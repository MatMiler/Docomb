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






		public static readonly List<string> MarkdownExtensions = new() { ".md", ".MD", ".markdown", ".mdown", ".mkdn", ".mkd", ".mdwn", ".text" };
		public static readonly List<string> MarkdownDefaultFileCores = new() { "index", "home", "readme", "Index", "Home", "Readme", "INDEX", "HOME", "README" };
		public static readonly List<string> MarkdownDefaultFiles = MergeListContents(MarkdownDefaultFileCores, MarkdownExtensions, (a, b) => a + b);

		public Item FindItem(string path) => FindItem(SplitPath(path));
		public Item FindItem(List<string> pathParts)
		{
			string path = Path.Combine(RootPath, string.Join('/', pathParts));

			foreach (string extension in MarkdownExtensions)
			{
				string filePath = path + extension;
				if (File.Exists(filePath))
				{
					return new ContentFile(filePath, pathParts);
				}
			}

			foreach (string fileName in MarkdownDefaultFiles)
			{
				string filePath = Path.Combine(path, fileName);
				if (File.Exists(filePath))
				{
					return new ContentFile(filePath, pathParts);
				}
			}

			if (Directory.Exists(path))
			{
				return new ContentFolder(path, pathParts);
			}


			return null;
		}




	}
}
