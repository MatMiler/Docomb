using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Controllers.Api
{
	[Route(AdminConfig.UrlPathPrefix + "/api/general")]
	public class GeneralController : Controller
	{
		[HttpGet("workspaces")]
		public ActionResult<List<Workspaces.Summary.WorkspaceSummary>> Workspaces()
		{
			return WebAdmin.Workspaces.Summary.GetList();
		}
	}
}
