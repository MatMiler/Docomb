using Docomb.ContentStorage;
using Docomb.ContentStorage.Workspaces;
using Docomb.WebCore.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader.ViewModels
{
	public class PageContext
	{
		public PageContext(string urlPath, Workspace workspace, ContentItem item, List<string> contentPathParts, dynamic viewBag, ClaimsPrincipal user)
		{
			UrlPath = urlPath;
			Workspace = workspace;
			ContentItem = item;
			PathParts = contentPathParts;
			PrepareViewbag(viewBag, user);
		}

		public void PrepareViewbag(dynamic viewBag, ClaimsPrincipal user)
		{
			viewBag.Title = ContentItem.Title;
			viewBag.Context = this;
			viewBag.HasPageData = (ContentItem != null);
			viewBag.User = new UserInfo(user);
		}


		public ContentItem ContentItem { get; protected set; }
		public string UrlPath { get; protected set; }
		public Workspace Workspace { get; protected set; }
		public List<string> PathParts { get; protected set; }


		public List<ContentItemSummary> GetParents()
		{
			return Workspace.Content.GetParents(PathParts, MatchType.Logical);
		}

	}
}
