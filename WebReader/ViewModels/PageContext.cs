using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader.ViewModels
{
	public class PageContext
	{
		public PageContext(string urlPath, Workspace workspace, ContentItem item, List<string> contentPathParts, dynamic viewBag)
		{
			UrlPath = urlPath;
			Workspace = workspace;
			ContentItem = item;
			PathParts = contentPathParts;
			PrepareViewbag(viewBag);
		}

		public void PrepareViewbag(dynamic viewBag)
		{
			viewBag.Title = ContentItem.Title;
			viewBag.Context = this;
			viewBag.HasPageData = (ContentItem != null);
		}


		public ContentItem ContentItem { get; protected set; }
		public string UrlPath { get; protected set; }
		public Workspace Workspace { get; protected set; }
		public List<string> PathParts { get; protected set; }


		public List<ContentItemSummary> GetParents()
		{
			return Workspace.Content.GetParents(PathParts);
		}

	}
}
