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
	[Route(WebCore.Configurations.UiConfig.UrlPathPrefix + "/api/content")]
	public class ContentController : Controller
	{


		[HttpPost("saveTextFile")]
		public ActionStatus SaveTextFile([FromBody] SaveRequest request)
		{
			AdminContext context = new(User);
			ActionStatus status = Edit.Save(request, context) ?? new ActionStatus(ActionStatus.StatusCode.Error);
			Response.StatusCode = status.GetHttpStatusCode();
			return status;
		}


		[HttpPost("renameFile")]
		public MoveResponse RenameFile([FromBody] MoveRequest request)
		{
			AdminContext context = new(User);
			MoveResponse response = Edit.RenameFile(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("moveFile")]
		public MoveResponse MoveFile([FromBody] MoveRequest request)
		{
			AdminContext context = new(User);
			MoveResponse response = Edit.MoveFile(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("renameDirectory")]
		public MoveResponse RenameDirectory([FromBody] MoveRequest request)
		{
			AdminContext context = new(User);
			MoveResponse response = Edit.RenameDirectory(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("moveDirectory")]
		public MoveResponse MoveDirectory([FromBody] MoveRequest request)
		{
			AdminContext context = new(User);
			MoveResponse response = Edit.MoveDirectory(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("createFile")]
		public DataWithStatus<ContentItemSummary> CreateFile([FromBody] CreateFileRequest request)
		{
			AdminContext context = new(User);
			DataWithStatus<ContentItemSummary> response = Edit.CreateFile(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("createDirectory")]
		public DataWithStatus<ContentItemSummary> CreateDirectory([FromBody] CreateFileRequest request)
		{
			AdminContext context = new(User);
			DataWithStatus<ContentItemSummary> response = Edit.CreateDirectory(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("deleteItem")]
		public DeleteItemResponse DeleteItem([FromBody] DeleteItemRequest request)
		{
			AdminContext context = new(User);
			DeleteItemResponse response = Edit.DeleteItem(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("preUploadCheck")]
		public PreUploadCheckResponse PreUploadCheck([FromBody] PreUploadCheckRequest request)
		{
			AdminContext context = new(User);
			PreUploadCheckResponse response = Edit.PreUploadCheck(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("uploadFile")]
		public DataWithStatus<ContentItemSummary> UploadFile()
		{
			AdminContext context = new(User);
			UploadFileRequest request = new();
			request.ParentUrl = Request.Form["parentUrl"];
			request.File = (Request.Form?.Files?.Count > 0) ? Request.Form.Files[0] : null;
			DataWithStatus <ContentItemSummary> response = Edit.UploadFile(request, context);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}


		[HttpPost("previewMarkdown")]
		public DataWithStatus<string> PreviewMarkdown([FromBody] SaveRequest request)
		{
			AdminContext context = new(User);
			DataWithStatus<string> response = Edit.PreviewMarkdown(request, context) ?? new(new ActionStatus(ActionStatus.StatusCode.Error), null);
			if (response?.ActionStatus != null) Response.StatusCode = response.ActionStatus.GetHttpStatusCode();
			return response;
		}




	}
}
