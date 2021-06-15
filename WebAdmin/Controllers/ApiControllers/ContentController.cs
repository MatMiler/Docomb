using Docomb.WebAdmin.ContentManager;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Controllers.ApiControllers
{
	[Route(AdminConfig.UrlPathPrefix + "/api/content")]
	public class ContentController : Controller
	{
		[HttpGet("fileDetails")]
		public ActionResult<FileDetails> GetFileDetails(string url) => FileDetails.Get(url);


	}
}
