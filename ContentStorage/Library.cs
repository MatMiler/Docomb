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
			.ToHashSet();
		public static readonly HashSet<string> DefaultFileNameCores = new() { "index", "default", "home", "readme" };
		public static readonly HashSet<string> DefaultFileNames = MergeListContents(DefaultFileNameCores, OmittableExtensions, (a, b) => $"{a}.{b}").ToHashSet();


		public ContentItem FindItem(string path) => FindItem(SplitPath(path, true));
		public ContentItem FindItem(List<string> pathParts)
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
			if (Directory.Exists(path))
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

		private Dictionary<string, ContentItemSummary> _itemSummaryByPath = new();
		private Dictionary<string, Dictionary<string, ContentItemSummary>> _itemSummariesByParentPath = new();

		public ContentItemSummary GetItemSummary(List<string> pathParts)
		{
			string path = (pathParts?.Count > 0) ? string.Join('/', pathParts) : "";
			if (_itemSummaryByPath.ContainsKey(path)) return _itemSummaryByPath[path];

			ContentItem item = FindItem(pathParts);
			if (item != null)
			{
				ContentItemSummary summary = new(item);
				_itemSummaryByPath.Add(path, summary);
				return summary;
			}

			return null;
		}

		public Dictionary<string, ContentItemSummary> GetChildren(List<string> parentPathParts)
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
						if (_itemSummaryByPath.ContainsKey(directoryName))
						{
							dict.Add(directoryName, _itemSummaryByPath[directoryName]);
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
								_itemSummaryByPath.Add(directoryName, summary);
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
							_itemSummaryByPath.Add(directoryName, summary);
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
						_itemSummaryByPath.Add(simplifiedName, summary);
						usedNames.Add(simplifiedLower);
					}
				}
			}
			#endregion

			_itemSummariesByParentPath.Add(parentPath, dict);
			return dict;
		}

		#endregion

	}
}
