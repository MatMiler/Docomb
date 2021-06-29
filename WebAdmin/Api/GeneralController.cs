using Docomb.CommonCore;
using Docomb.ContentStorage;
using Docomb.WebCore.Authentication;
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
		public ActionResult<List<WorkspaceSummary>> Workspaces() => GetWorkspaceSummaryList(User);


		[HttpGet("workspacePageInfo")]
		public ActionResult<WorkspacePageInfo> WorkspacePageInfo(string url, string query) => GetWorkspacePageInfo(User, url, query);


		[HttpGet("workspaceContentTree")]
		public ActionResult<List<ContentItemSummary>> WorkspaceContentTree(string workspaceUrl) => GetTree(User, workspaceUrl);


		[HttpGet("workspeceDirectoryPaths")]
		public DataWithStatus<List<string>> WorkspaceDirectoryPaths(string workspaceUrl)
		{
			DataWithStatus<List<string>> data = GetDirectoryPaths(User, workspaceUrl);
			if (data?.ActionStatus != null) Response.StatusCode = data.ActionStatus.GetHttpStatusCode();
			return data;
		}


		[HttpGet("userInfo")]
		public UserInfo UserInfo()
		{
			return new UserInfo(User);
		}

	}


}
