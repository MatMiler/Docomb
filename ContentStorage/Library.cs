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

		private Dictionary<string, ContentItemSummary> _itemPhysicalSummaryByPath = new();
		private Dictionary<string, ContentItemSummary> _itemLogicalSummaryByPath = new();
		private Dictionary<string, Dictionary<string, ContentItemSummary>> _itemSummariesByParentPath = new();
		private Dictionary<string, List<ContentItemSummary>> _physicalItemSummariesByParentPath = new();

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
			Dictionary<string, ContentItemSummary> cacheDict = matchType switch {
				MatchType.Physical => _itemPhysicalSummaryByPath,
				MatchType.Logical => _itemLogicalSummaryByPath,
				_ => null
			};
			if ((cacheDict != null) && (cacheDict.TryGetValue(path, out ContentItemSummary cached)))
				return cached;

			ContentItem item = FindItem(pathParts, matchType);
			if (item != null)
			{
				ContentItemSummary summary = new(item);
				cacheDict?.Add(path, summary);
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
			if (_itemSummariesByParentPath.ContainsKey(parentPath)) return _itemSummariesByParentPath[parentPath];

			Dictionary<string, ContentItemSummary> dict = new();
			string path = Path.Combine(RootPath, parentPath);
			if (!Directory.Exists(path)) return dict;
			DirectoryInfo parent = new(path);

			HashSet<string> usedNames = new();

			#region Directories
			{
				List<DirectoryInfo> directories = parent.GetDirectories()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).ToList();
				if (directories?.Count > 0)
				{
					foreach (DirectoryInfo directory in directories)
					{
						string directoryName = directory.Name;
						string nameLower = directoryName.ToLower();
						if (_itemLogicalSummaryByPath.ContainsKey(directoryName))
						{
							dict.Add(directoryName, _itemLogicalSummaryByPath[directoryName]);
							usedNames.Add(nameLower);
						}

						if (usedNames.Contains(nameLower)) continue;

						bool defaultFileFound = false;

						#region Find default file
						foreach (string fileName in DefaultFileNames)
						{
							string[] files = Directory.GetFiles(path, fileName, new EnumerationOptions { MatchCasing = MatchCasing.CaseInsensitive, RecurseSubdirectories = false });
							if (files?.Length >= 1)
							{
								ContentItemSummary summary = new(new ContentFile(Workspace, files[0], parentPathParts.Concat(new List<string>() { directoryName }).ToList(), true));
								dict.Add(directoryName, summary);
								_itemLogicalSummaryByPath.Add(directoryName, summary);
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
							dict.Add(directoryName, summary);
							_itemLogicalSummaryByPath.Add(directoryName, summary);
							usedNames.Add(nameLower);
						}
						#endregion
					}
				}
			}
			#endregion

			#region Files
			{
				List<FileInfo> files = parent.GetFiles()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).ToList();
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
						dict.Add(simplifiedName, summary);
						_itemLogicalSummaryByPath.Add(simplifiedName, summary);
						usedNames.Add(simplifiedLower);
					}
				}
			}
			#endregion

			_itemSummariesByParentPath.TryAdd(parentPath, dict);
			return dict;
		}


		public List<ContentItemSummary> GetPhysicalChildren(List<string> parentPathParts, bool includeFiles = true, bool includeDirectories = true)
		{
			string parentPath = string.Join('/', parentPathParts);
			if (_physicalItemSummariesByParentPath.TryGetValue(parentPath, out List<ContentItemSummary> cachedList))
				return cachedList;

			List<ContentItemSummary> list = new();
			string path = Path.Combine(RootPath, parentPath);
			if (!Directory.Exists(path)) return list;
			DirectoryInfo parent = new(path);

			#region Directories
			if (includeDirectories)
			{
				List<DirectoryInfo> directories = parent.GetDirectories()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).ToList();
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
				List<FileInfo> files = parent.GetFiles()?.Where(x => (!x.Attributes.HasFlag(FileAttributes.Hidden)) && (!x.Attributes.HasFlag(FileAttributes.System))).ToList();
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

			_physicalItemSummariesByParentPath.TryAdd(parentPath, list);
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
				List<string> fileParts = new List<string>(parent.UrlParts);
				fileParts.Add(fileName);
				ContentItem item = FindItem(fileParts, MatchType.Physical);
				Workspace.Git?.AddFile(item.FilePath, context);
				ClearCache();
				return new DataWithStatus<ContentItemSummary>(new ActionStatus(ActionStatus.StatusCode.OK), new ContentItemSummary(item));
			}
			catch (Exception e)
			{
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
				List<string> fileParts = new List<string>(parent.UrlParts);
				fileParts.Add(fileName);
				ContentItem item = FindItem(fileParts, MatchType.Physical);
				Workspace.Git?.AddDirectory(item.FilePath, context);
				ClearCache();
				return new DataWithStatus<ContentItemSummary>(new ActionStatus(ActionStatus.StatusCode.OK), new ContentItemSummary(item));
			}
			catch (Exception e)
			{
				return new(new ActionStatus(ActionStatus.StatusCode.Error, exception: e), null);
			}
		}

		#endregion


	}
}
