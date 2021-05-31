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
			List<ContentItemSummary> list = new();
			if (Workspace == null) return list;

			//var root = Workspace.Content.GetItemSummary(new());
			//if (root != null) list.Add(root);

			if (PathParts?.Count > 0)
			{
				for (int x = 0; x < PathParts.Count; x++)
				{
					ContentItemSummary item = Workspace.Content.GetItemSummary(PathParts.GetRange(0, x));
					if (item != null) list.Add(item);
				}
			}

			return list;
		}

	}
}
