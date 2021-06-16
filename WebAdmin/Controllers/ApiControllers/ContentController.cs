using Docomb.WebAdmin.ContentManager;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Docomb.WebAdmin.ContentManager.Edit;

namespace Docomb.WebAdmin.Controllers.ApiControllers
{
	[Route(AdminConfig.UrlPathPrefix + "/api/content")]
	public class ContentController : Controller
	{

		//[HttpGet("fileDetails")]
		//public ActionResult<FileDetails> GetFileDetails(string url) => FileDetails.Get(url);


		[HttpPost("saveTextFile")]
		public bool SaveTextFile(SaveRequest request)
		{
			return ContentManager.Edit.Save(request);
		}

	}
}
