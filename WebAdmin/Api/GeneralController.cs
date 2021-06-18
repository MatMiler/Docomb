using Docomb.ContentStorage;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Docomb.WebAdmin.Api.ContentManager.Info;

namespace Docomb.WebAdmin.Api
{
	[Route(AdminConfig.UrlPathPrefix + "/api/general")]
	public class GeneralController : Controller
	{
		[HttpGet("workspaces")]
		public ActionResult<List<WorkspaceSummary>> Workspaces() => GetWorkspaceSummaryList();


		[HttpGet("workspacePageInfo")]
		public ActionResult<WorkspacePageInfo> WorkspacePageInfo(string url, string query) => GetWorkspacePageInfo(url, query);


		[HttpGet("workspaceContentTree")]
		public ActionResult<List<ContentItemSummary>> WorkspaceContentTree(string workspaceUrl) => GetTree(workspaceUrl);


		[HttpGet("workspeceDirectoryPaths")]
		public ResponseWithStatus<List<string>> WorkspaceDirectoryPaths(string workspaceUrl)
		{
			ResponseWithStatus<List<string>> data = GetDirectoryPaths(workspaceUrl);
			if (data?.ActionStatus != null) Response.StatusCode = data.ActionStatus.GetHttpStatusCode();
			return data;
		}

	}


}
