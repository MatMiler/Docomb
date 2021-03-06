using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Docomb.CommonCore;
using Docomb.ContentStorage.Workspaces;

namespace Docomb.ContentStorage
{
	public class Library
	{

		public string RootPath { get; set; }
		public string BaseUrl { get; set; }

		private Uri _baseUri = null;
		public Uri BaseUri { get => _baseUri ??= new Uri(BaseUrl); }

		public Workspace Workspace { get; protected set; }


		public Library(Workspace workspace, string rootPath = null, string baseUrl = null)
		{
			Workspace = workspace;
			RootPath = rootPath ?? workspace?.ContentStoragePath;
			BaseUrl = baseUrl ?? workspace?.UrlPath;
		}






		public static readonly HashSet<string> OmittableExtensions =
			FormatInfo.MarkdownInfo.Extensions
			.ToHashSet();
		public static readonly HashSet<string> ArticleExtensions =
			FormatInfo.MarkdownInfo.Extensions
			.Concat(FormatInfo.HtmlInfo.Extensions)
			.Concat(FormatInfo.PlainTextInfo.Extensions)
			.Concat(FormatInfo.ScriptInfo.Extensions)
			.Concat(FormatInfo.BitmapImageInfo.Extensions)
			.Concat(FormatInfo.VectorImageInfo.Extensions)
			.Concat(FormatInfo.DocumentInfo.DocumentExtensions)
			.ToHashSet();
		public static readonly HashSet<string> DefaultFileNameCores = new() { "index", "default", "home", "readme" };
		public static readonly HashSet<string> DefaultFileNames = MergeListContents(DefaultFileNameCores, OmittableExtensions, (a, b) => $"{a}.{b}").ToHashSet();


		public ContentItem FindItem(string path, MatchType matchType) => FindItem(SplitPath(path, true), matchType);
		public ContentItem FindItem(List<string> pathParts, MatchType matchType)
		{
			string path = Path.Combine(RootPath, string.Join('/', pathParts));


			#region Exact file match
			if (File.Exists(path))
			{
				return new ContentFile(Workspace, path, pathParts, false);
			}
			#endregion


			#region Omittable extensions
			if (pathParts.Count >= 1)
			{
				string parentPath = Path.Combine(RootPath, string.Join('/', pathParts.GetRange(0, pathParts.Count - 1)));
				if (Directory.Exists(parentPath))
				{
					string fileNameCore = pathParts.Last() + ".";
					foreach (string extension in OmittableExtensions)
					{
						string[] files = Directory.GetFiles(parentPath, fileNameCore + extension, new EnumerationOptions { MatchCasing = MatchCasing.CaseInsensitive, RecurseSubdirectories = false });
						if (files?.Length >= 1)
						{
							return new ContentFile(Workspace, files[0], pathParts, false);
						}
					}
				}
			}
			#endregion


			#region Default files
			if ((matchType == MatchType.Logical) && (Directory.Exists(path)))
			{
				foreach (string fileName in DefaultFileNames)
				{
					string[] files = Directory.GetFiles(path, fileName, new EnumerationOptions { MatchCasing = MatchCasing.CaseInsensitive, RecurseSubdirectories = false });
					if (files?.Length >= 1)
					{
						return new ContentFile(Workspace, files[0], pathParts, true);
					}
				}
			}
			#endregion


			#region Directory
			if (Directory.Exists(path))
			{
				return new ContentDirectory(Workspace, path, pathParts);
			}
			#endregion


			return null;
		}









		#region Item summaries

		private Dictionary<string, TimedCache<ContentItemSummary>> _itemPhysicalSummaryByPath = new();
		private Dictionary<string, TimedCache<ContentItemSummary>> _itemLogicalSummaryByPath = new();
		private Dictionary<string, TimedCache<Dictionary<string, ContentItemSummary>>> _itemSummariesByParentPath = new();
		private Dictionary<string, TimedCache<List<ContentItemSummary>>> _physicalItemSummariesByParentPath = new();

		private class TimedCache<T>
		{
			public TimedCache(T data, TimeSpan? validity = null)
			{
				Data = data;
				ValidUntil = CreatedAt + (validity ?? new TimeSpan(0, 10, 0));
			}

			public T Data { get; set; }
			public DateTime CreatedAt { get; set; } = DateTime.Now;
			public DateTime ValidUntil { get; set; }
			public bool IsValid => (ValidUntil >= DateTime.Now);
		}

		private bool TryGetTimedCacheValue<TKey, TValue>(Dictionary<TKey, TimedCache<TValue>> dict, TKey key, out TValue value)
		{
			if ((dict != null) && (dict.TryGetValue(key, out TimedCache<TValue> cache)))
			{
				if (cache.IsValid == true)
				{
					value = cache.Data;
					return true;
				}
			}
			value = default;
			return false;
		}

		public void ClearCache()
		{
			_itemPhysicalSummaryByPath = new();
			_itemLogicalSummaryByPath = new();
			_itemSummariesByParentPath = new();
			_physicalItemSummariesByParentPath = new();
		}

		public ContentItemSummary GetItemSummary(List<string> pathParts, MatchType matchType)
		{
			string path = (pathParts?.Count > 0) ? string.Join('/', pathParts) : "";
			Dictionary<string, TimedCache<ContentItemSummary>> cacheDict = matchType switch {
				MatchType.Physical => _itemPhysicalSummaryByPath,
				MatchType.Logical => _itemLogicalSummaryByPath,
				_ => null
			};
			if ((cacheDict != null) && (TryGetTimedCacheValue(cacheDict, path, out ContentItemSummary cached)))
			{
				return cached;
			}

			ContentItem item = FindItem(pathParts, matchType);
			if (item != null)
			{
				ContentItemSummary summary = new(item);
				cacheDict?.AddOrSet(path, new(summary));
				return summary;
			}

			return null;
		}


		public List<ContentItemSummary> GetChildren(List<string> parentPathParts, MatchType matchType = MatchType.Logical)
		{
			return matchType switch
			{
				MatchType.Logical => GetLogicalChildren(parentPathParts)?.Values.ToList(),
				MatchType.Physical => GetPhysicalChildren(parentPathParts),
				_ => throw new NotImplementedException()
			};
		}

		public Dictionary<string, ContentItemSummary> GetLogicalChildren(List<string> parentPathParts)
		{
			string parentPath = string.Join('/', parentPathParts);
			if (TryGetTimedCacheValue(_itemSummariesByParentPath, parentPath, out Dictionary<string, ContentItemSummary> value))
			{
				return value;
			}

			Dictionary<string, ContentItemSummary> dict = new();
			string path = Path.Combine(RootPath, parentPath);
			if (!Directory.Exists(path)) return dict;
			DirectoryInfo parent = new(path);

			HashSet<string> usedNames = new();

			#region Directories
			{
				List<DirectoryInfo> directories = parent.GetDirectories()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).OrderBy(x => x.Name).ToList();
				if (directories?.Count > 0)
				{
					foreach (DirectoryInfo directory in directories)
					{
						string directoryName = directory.Name;
						string nameLower = directoryName.ToLower();
						if (TryGetTimedCacheValue(_itemLogicalSummaryByPath, directoryName, out ContentItemSummary cache))
						{
							dict.AddOrSet(directoryName, cache);
							usedNames.Add(nameLower);
						}

						if (usedNames.Contains(nameLower)) continue;

						bool defaultFileFound = false;

						#region Find default file
						foreach (string fileName in DefaultFileNames)
						{
							string[] files = Directory.GetFiles(directory.FullName, fileName, new EnumerationOptions { MatchCasing = MatchCasing.CaseInsensitive, RecurseSubdirectories = false });
							if (files?.Length >= 1)
							{
								ContentItemSummary summary = new(new ContentFile(Workspace, files[0], parentPathParts.Concat(new List<string>() { directoryName }).ToList(), true));
								dict.AddOrSet(directoryName, summary);
								_itemLogicalSummaryByPath.AddOrSet(directoryName, new(summary));
								usedNames.Add(nameLower);
								defaultFileFound = true;
								break;
							}
						}
						#endregion

						#region Add directory as such
						if (!defaultFileFound)
						{
							ContentItemSummary summary = new(new ContentDirectory(Workspace, directory.FullName, parentPathParts.Concat(new List<string>() { directoryName }).ToList()));
							dict.AddOrSet(directoryName, summary);
							_itemLogicalSummaryByPath.AddOrSet(directoryName, new(summary));
							usedNames.Add(nameLower);
						}
						#endregion
					}
				}
			}
			#endregion

			#region Files
			{
				List<FileInfo> files = parent.GetFiles()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).OrderBy(x => x.Name).ToList();
				if (files?.Count > 0)
				{
					foreach (FileInfo file in files)
					{
						string fileName = file.Name;
						string extension = GetFileExtension(fileName)?.ToLower();
						// Not a supported article or not logically a child
						if ((string.IsNullOrEmpty(extension)) || (!ArticleExtensions.Contains(extension?.ToLower())) || (DefaultFileNames.Contains(fileName))) continue;

						string simplifiedName = OmittableExtensions.Contains(extension) ? GetFileNameWithoutExtension(fileName) : fileName;
						if (string.IsNullOrEmpty(simplifiedName)) continue;
						string simplifiedLower = simplifiedName.ToLower();
						if (usedNames.Contains(simplifiedLower)) continue;
						ContentItemSummary summary = new(new ContentFile(Workspace, file.FullName, parentPathParts.Concat(new List<string>() { simplifiedName }).ToList(), false));
						dict.AddOrSet(simplifiedName, summary);
						_itemLogicalSummaryByPath.AddOrSet(simplifiedName, new(summary));
						usedNames.Add(simplifiedLower);
					}
				}
			}
			#endregion

			_itemSummariesByParentPath.AddOrSet(parentPath, new(dict));
			return dict;
		}


		public List<ContentItemSummary> GetPhysicalChildren(List<string> parentPathParts, bool includeFiles = true, bool includeDirectories = true)
		{
			string parentPath = string.Join('/', parentPathParts);
			if (TryGetTimedCacheValue(_physicalItemSummariesByParentPath, parentPath, out List<ContentItemSummary> cachedList))
				return cachedList;

			List<ContentItemSummary> list = new();
			string path = Path.Combine(RootPath, parentPath);
			if (!Directory.Exists(path)) return list;
			DirectoryInfo parent = new(path);

			#region Directories
			if (includeDirectories)
			{
				List<DirectoryInfo> directories = parent.GetDirectories()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).OrderBy(x => x.Name).ToList();
				if (directories?.Count > 0)
				{
					foreach (DirectoryInfo directory in directories)
					{
						string directoryName = directory.Name;
						ContentItemSummary summary = new(new ContentDirectory(Workspace, directory.FullName, parentPathParts.Concat(new List<string>() { directoryName }).ToList()));
						list.Add(summary);
					}
				}
			}
			#endregion

			#region Files
			if (includeFiles)
			{
				List<FileInfo> files = parent.GetFiles()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).OrderBy(x => x.Name).ToList();
				if (files?.Count > 0)
				{
					foreach (FileInfo file in files)
					{
						string fileName = file.Name;
						ContentItemSummary summary = new(new ContentFile(Workspace, file.FullName, parentPathParts.Concat(new List<string>() { fileName }).ToList(), false));
						list.Add(summary);
					}
				}
			}
			#endregion

			_physicalItemSummariesByParentPath.AddOrSet(parentPath, new(list));
			return list;
		}


		public List<ContentItemSummary> GetParents(List<string> pagePathParts, MatchType matchType, bool includeLast = false)
		{
			List<ContentItemSummary> list = new();
			if (Workspace == null) return list;

			if (pagePathParts?.Count > 0)
			{
				for (int x = 0; x <= (pagePathParts.Count + (includeLast ? 0 : -1)); x++)
				{
					ContentItemSummary item = Workspace.Content.GetItemSummary(pagePathParts.GetRange(0, x), matchType);
					if (item != null) list.Add(item);
				}
			}
			else if (includeLast)
			{
				ContentItemSummary root = Workspace.Content.GetItemSummary(new(), matchType);
				if (root != null) list.Add(root);
			}

			return list;
		}

		#endregion






		#region New items

		public DataWithStatus<ContentItemSummary> CreateFile(ContentDirectory parent, string fileName, ActionContext context, string content = null)
		{
			if (string.IsNullOrWhiteSpace(fileName)) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, "File name cannot be empty."), null);
			if (string.IsNullOrWhiteSpace(GetFileNameWithoutExtension(fileName))) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, "File name cannot be empty."), null);
			if (Path.GetInvalidFileNameChars().Any(fileName.Contains)) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, $"New name '{fileName}' contains invalid characters."), null);
			if (parent == null) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, $"No folder was given in which to create a file."), null);
			string filePath = Path.Combine(parent.FilePath, fileName);
			if (File.Exists(filePath)) return new(new ActionStatus(ActionStatus.StatusCode.Conflict, $"A file named '{fileName}' already exists."), null);
			if (Directory.Exists(filePath)) return new(new ActionStatus(ActionStatus.StatusCode.Conflict, $"A folder named '{fileName}' already exists."), null);

			try
			{
				using FileStream stream = File.Create(filePath);
				stream.Close();
				if (content?.Length > 0) File.WriteAllText(filePath, content, Encoding.UTF8);
				List<string> fileParts = new(parent.UrlParts);
				fileParts.Add(fileName);
				ContentItem item = FindItem(fileParts, MatchType.Physical);
				Workspace.Git?.AddFile(item.FilePath, context);
				ClearCache();
				return new DataWithStatus<ContentItemSummary>(new ActionStatus(ActionStatus.StatusCode.OK), new ContentItemSummary(item));
			}
			catch (Exception e)
			{
				Reports.Report(e);
				return new(new ActionStatus(ActionStatus.StatusCode.Error, exception: e), null);
			}
		}

		public DataWithStatus<ContentItemSummary> CreateDirectory(ContentDirectory parent, string fileName, ActionContext context)
		{
			if (string.IsNullOrWhiteSpace(fileName)) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, "Folder name cannot be empty."), null);
			if (string.IsNullOrWhiteSpace(GetFileNameWithoutExtension(fileName))) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, "Folder name cannot be empty."), null);
			if (Path.GetInvalidFileNameChars().Any(fileName.Contains)) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, $"New name '{fileName}' contains invalid characters."), null);
			if (parent == null) return new(new ActionStatus(ActionStatus.StatusCode.InvalidRequestData, $"No folder was given in which to create a sub-folder."), null);
			string filePath = Path.Combine(parent.FilePath, fileName);
			if (File.Exists(filePath)) return new(new ActionStatus(ActionStatus.StatusCode.Conflict, $"A file named '{fileName}' already exists."), null);
			if (Directory.Exists(filePath)) return new(new ActionStatus(ActionStatus.StatusCode.Conflict, $"A folder named '{fileName}' already exists."), null);

			try
			{
				Directory.CreateDirectory(filePath);
				List<string> fileParts = new(parent.UrlParts);
				fileParts.Add(fileName);
				ContentItem item = FindItem(fileParts, MatchType.Physical);
				Workspace.Git?.AddDirectory(item.FilePath, context);
				ClearCache();
				return new DataWithStatus<ContentItemSummary>(new ActionStatus(ActionStatus.StatusCode.OK), new ContentItemSummary(item));
			}
			catch (Exception e)
			{
				Reports.Report(e);
				return new(new ActionStatus(ActionStatus.StatusCode.Error, exception: e), null);
			}
		}

		#endregion


	}
}
