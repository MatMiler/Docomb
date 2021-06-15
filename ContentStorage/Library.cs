using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

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

			HashSet<string> usedNames = new();

			#region Directories
			{
				string[] directoryPaths = Directory.GetDirectories(path);
				if (directoryPaths?.Length > 0)
				{
					foreach (string directoryPath in directoryPaths)
					{
						string directoryName = GetFileNameFromPath(directoryPath);
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
							ContentItemSummary summary = new(new ContentDirectory(Workspace, directoryPath, parentPathParts.Concat(new List<string>() { directoryName }).ToList()));
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
				string[] filePaths = Directory.GetFiles(path);
				if (filePaths?.Length > 0)
				{
					foreach (string filePath in filePaths)
					{
						string fileName = GetFileNameFromPath(filePath);
						string extension = GetFileExtension(fileName)?.ToLower();
						// Not a supported article or not logically a child
						if ((string.IsNullOrEmpty(extension)) || (!ArticleExtensions.Contains(extension?.ToLower())) || (DefaultFileNames.Contains(fileName))) continue;

						string simplifiedName = OmittableExtensions.Contains(extension) ? GetFileNameWithoutExtension(fileName) : fileName;
						if (string.IsNullOrEmpty(simplifiedName)) continue;
						string simplifiedLower = simplifiedName.ToLower();
						if (usedNames.Contains(simplifiedLower)) continue;
						ContentItemSummary summary = new(new ContentFile(Workspace, filePath, parentPathParts.Concat(new List<string>() { simplifiedName }).ToList(), false));
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


		public List<ContentItemSummary> GetPhysicalChildren(List<string> parentPathParts)
		{
			string parentPath = string.Join('/', parentPathParts);
			if (_physicalItemSummariesByParentPath.TryGetValue(parentPath, out List<ContentItemSummary> cachedList))
				return cachedList;

			List<ContentItemSummary> list = new();
			string path = Path.Combine(RootPath, parentPath);
			if (!Directory.Exists(path)) return list;

			#region Directories
			{
				string[] directoryPaths = Directory.GetDirectories(path);
				if (directoryPaths?.Length > 0)
				{
					foreach (string directoryPath in directoryPaths)
					{
						string directoryName = GetFileNameFromPath(directoryPath);
						ContentItemSummary summary = new(new ContentDirectory(Workspace, directoryPath, parentPathParts.Concat(new List<string>() { directoryName }).ToList()));
						list.Add(summary);
					}
				}
			}
			#endregion

			#region Files
			{
				string[] filePaths = Directory.GetFiles(path);
				if (filePaths?.Length > 0)
				{
					foreach (string filePath in filePaths)
					{
						string fileName = GetFileNameFromPath(filePath);
						ContentItemSummary summary = new(new ContentFile(Workspace, filePath, parentPathParts.Concat(new List<string>() { fileName }).ToList(), false));
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

	}
}
