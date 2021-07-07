using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader.ViewModels
{
	public class Article
	{
		public Article() { }
		public Article(string urlPath, Workspace workspace, ContentFile contentFile, List<string> contentPathParts, dynamic viewBag, ClaimsPrincipal user)
		{
			ContentFile = contentFile;
			Context = new(urlPath, workspace, contentFile, contentPathParts, viewBag, user);
		}

		public ContentFile ContentFile { get; protected set; }
		public PageContext Context { get; protected set; }


		public ContentStorage.MarkdownEngines.MarkdownEngine MarkdownEngine => _markdownEngine ??= ContentStorage.MarkdownEngines.Manager.GetEngine(Context?.Workspace);
		private ContentStorage.MarkdownEngines.MarkdownEngine _markdownEngine = null;

	}
}
