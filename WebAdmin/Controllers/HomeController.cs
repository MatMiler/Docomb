using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Docomb.WebCore.Configurations.UiConfig;

namespace Docomb.WebAdmin.Controllers
{
	[Route(UrlPathPrefix)]
	public class HomeController : Controller
	{
		[HttpGet("{**itemPath}")]
		public IActionResult Index()
		{
			if (!WebCore.Authentication.Access.HasAccess(User, WebCore.Authentication.AccessLevel.Editor))
				return Redirect($"/{UrlPathPrefix}/account/login");

			ViewBag.baseHref = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/{UrlPathPrefix}/";
			ViewBag.basePath = $"{Request.PathBase}/{UrlPathPrefix}/";
			ViewBag.readerBasePath = $"{Request.PathBase}/";
			return View("~/Areas/Admin/Pages/Index.cshtml");
		}
	}
}
