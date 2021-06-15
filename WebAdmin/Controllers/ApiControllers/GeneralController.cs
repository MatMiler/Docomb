using Docomb.ContentStorage;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Docomb.WebAdmin.Workspaces.ContentManager;

namespace Docomb.WebAdmin.Controllers.Api
{
	[Route(AdminConfig.UrlPathPrefix + "/api/general")]
	public class GeneralController : Controller
	{
		[HttpGet("workspaces")]
		public ActionResult<List<WorkspaceSummary>> Workspaces() => GetWorkspaceSummaryList();


		[HttpGet("workspacePageInfo")]
		public ActionResult<WorkspacePageInfo> WorkspacePageInfo(string url) => GetWorkspacePageInfo(url);


		[HttpGet("workspaceContentTree")]
		public ActionResult<List<ContentItemSummary>> WorkspaceContentTree(string workspaceUrl) => GetTree(workspaceUrl);


	}


}
