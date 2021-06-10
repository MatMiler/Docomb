using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Controllers
{
	[Route(AdminConfig.UrlPathPrefix)]
	public class HomeController : Controller
	{
		[HttpGet("{**itemPath}")]
		public IActionResult Index()
		{
			ViewBag.baseHref = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/{AdminConfig.UrlPathPrefix}/";
			ViewBag.basePath = $"{Request.PathBase}/{AdminConfig.UrlPathPrefix}/";
			return View("~/Areas/Admin/Pages/Index.cshtml");
		}
	}
}
