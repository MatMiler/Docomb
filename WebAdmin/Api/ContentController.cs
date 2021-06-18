using Docomb.CommonCore;
using Docomb.WebAdmin.Api.ContentManager;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Docomb.WebAdmin.Api.ContentManager.Edit;

namespace Docomb.WebAdmin.Api
{
	[Route(AdminConfig.UrlPathPrefix + "/api/content")]
	public class ContentController : Controller
	{

		//[HttpGet("fileDetails")]
		//public ActionResult<FileDetails> GetFileDetails(string url) => FileDetails.Get(url);


		[HttpPost("saveTextFile")]
		public ActionStatus SaveTextFile([FromBody] SaveRequest request)
		{
			ActionStatus status = ContentManager.Edit.Save(request) ?? new ActionStatus(ActionStatus.StatusCode.Error);
			Response.StatusCode = status.GetHttpStatusCode();
			return status;
		}


		[HttpPost("renameFile")]
		public MoveResponse RenameFile([FromBody] MoveRequest request)
		{
			MoveResponse response = ContentManager.Edit.RenameFile(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("renameDirectory")]
		public MoveResponse RenameDirectory([FromBody] MoveRequest request)
		{
			MoveResponse response = ContentManager.Edit.RenameDirectory(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}

	}
}
