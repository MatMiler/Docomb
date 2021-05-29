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



		public Library(string rootPath, string baseUrl)
		{
			RootPath = rootPath;
			BaseUrl = baseUrl;
		}






		public static readonly List<string> OmittableExtensions =
			FormatInfo.MarkdownInfo.Extensions
			.Concat(FormatInfo.HtmlInfo.Extensions)
			.ToList();
		public static readonly List<string> DefaultFileNameCores = new() { "index", "default", "home", "readme" };
		public static readonly List<string> DefaultFileNames = MergeListContents(DefaultFileNameCores, OmittableExtensions, (a, b) => $"{a}.{b}");


		public ContentItem FindItem(string path) => FindItem(SplitPath(path, true));
		public ContentItem FindItem(List<string> pathParts)
		{
			string path = Path.Combine(RootPath, string.Join('/', pathParts));


			#region Exact file match
			if (File.Exists(path))
			{
				return new ContentFile(path, pathParts, false);
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
							return new ContentFile(files[0], pathParts, false);
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
						return new ContentFile(files[0], pathParts, true);
					}
				}
			}
			#endregion


			#region Directory
			if (Directory.Exists(path))
			{
				return new ContentDirectory(path, pathParts);
			}
			#endregion


			return null;
		}




	}
}
