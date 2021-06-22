using Docomb.CommonCore;
using Docomb.ContentStorage;
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


		[HttpPost("moveFile")]
		public MoveResponse MoveFile([FromBody] MoveRequest request)
		{
			MoveResponse response = ContentManager.Edit.MoveFile(request);
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


		[HttpPost("moveDirectory")]
		public MoveResponse MoveDirectory([FromBody] MoveRequest request)
		{
			MoveResponse response = ContentManager.Edit.MoveDirectory(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("createFile")]
		public DataWithStatus<ContentItemSummary> CreateFile([FromBody] CreateFileRequest request)
		{
			DataWithStatus<ContentItemSummary> response = ContentManager.Edit.CreateFile(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("createDirectory")]
		public DataWithStatus<ContentItemSummary> CreateDirectory([FromBody] CreateFileRequest request)
		{
			DataWithStatus<ContentItemSummary> response = ContentManager.Edit.CreateDirectory(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("deleteItem")]
		public DeleteItemResponse DeleteItem([FromBody] DeleteItemRequest request)
		{
			DeleteItemResponse response = ContentManager.Edit.DeleteItem(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("preUploadCheck")]
		public PreUploadCheckResponse PreUploadCheck([FromBody] PreUploadCheckRequest request)
		{
			PreUploadCheckResponse response = ContentManager.Edit.PreUploadCheck(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("uploadFile")]
		public DataWithStatus<ContentItemSummary> UploadFile()
		{
			//int a = 1;
			UploadFileRequest request = new UploadFileRequest();
			request.ParentUrl = Request.Form["parentUrl"];
			request.File = Request.Form.Files.FirstOrDefault();
			DataWithStatus<ContentItemSummary> response = ContentManager.Edit.UploadFile(request);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
			//return new DataWithStatus<ContentItemSummary>(new ActionStatus(ActionStatus.StatusCode.ActionNotSupported), null);
		}


		[HttpPost("previewMarkdown")]
		public DataWithStatus<string> PreviewMarkdown([FromBody] SaveRequest request)
		{
			DataWithStatus<string> response = ContentManager.Edit.PreviewMarkdown(request) ?? new(new ActionStatus(ActionStatus.StatusCode.Error), null);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}




	}
}
