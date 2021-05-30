using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader.ViewModels
{
	public class Article
	{
		public Article() { }
		public Article(string urlPath, Workspace workspace, ContentFile contentFile, List<string> contentPathParts, dynamic viewBag)
		{
			UrlPath = urlPath;
			Workspace = workspace;
			ContentFile = contentFile;
			ContentPathParts = contentPathParts;
			PrepareViewbag(viewBag);
		}

		public void PrepareViewbag(dynamic viewBag)
		{
			viewBag.Title = ContentFile.Title;
			viewBag.CurrentWorkspacePath = Workspace.UrlPath;
		}


		public string UrlPath { get; protected set; }
		public Workspace Workspace { get; protected set; }
		public ContentFile ContentFile { get; protected set; }
		public List<string> ContentPathParts { get; protected set; }


		public ContentStorage.MarkdownEngines.MarkdownEngine MarkdownEngine => _markdownEngine ??= ContentStorage.MarkdownEngines.Manager.GetEngine(Workspace);
		private ContentStorage.MarkdownEngines.MarkdownEngine _markdownEngine = null;

	}
}
