using Docomb.CommonCore;
using Docomb.ContentStorage.Workspaces;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Api
{
	[Route(WebCore.Configurations.UiConfig.UrlPathPrefix + "/api/storage")]
	public class StorageController : Controller
	{


		[HttpGet("gitSync")]
		public ActionStatus GitSync(string workspaceUrl)
		{
			AdminContext context = new(User);
			if (context?.HasAccess(WebCore.Authentication.AccessLevel.Editor) != true) return new ActionStatus(ActionStatus.StatusCode.AccessDenied);
			(Workspace workspace, _) = WebCore.Configurations.WorkspacesConfig.FindFromPath(workspaceUrl);
			if (workspace == null) return new ActionStatus(ActionStatus.StatusCode.NotFound);

			try
			{
				workspace.Git.Sync(context.StorageContext);
			}
			catch (Exception e)
			{
				Reports.Report(e);
				return new ActionStatus(ActionStatus.StatusCode.Error, exception: e);
			}

			return new ActionStatus(ActionStatus.StatusCode.OK);
		}


	}
}
