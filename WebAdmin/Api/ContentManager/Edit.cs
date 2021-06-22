﻿using static Docomb.CommonCore.Utils;
using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Docomb.CommonCore;
using Microsoft.AspNetCore.Http;

namespace Docomb.WebAdmin.Api.ContentManager
{
	public static class Edit
	{


		#region Save content

		public class SaveRequest
		{
			[JsonPropertyName("url")]
			public string Url { get; set; }

			[JsonPropertyName("textContent")]
			public string TextContent { get; set; }
		}


		public static ActionStatus Save(SaveRequest request)
		{
			if (request == null) return new ActionStatus(ActionStatus.StatusCode.MissingRequestData);
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(request.Url);
			if ((workspace == null) || (remainingPath == null)) return new ActionStatus(ActionStatus.StatusCode.NotFound);
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentFile contentFile = item?.AsFile;

			bool success = false;

			if (contentFile != null)
			{
				try
				{
					success = contentFile.SaveTextFile(request.TextContent);
				}
				catch (Exception e)
				{
					return new ActionStatus(ActionStatus.StatusCode.Error, exception: e);
				}
			}

			return new ActionStatus(success ? ActionStatus.StatusCode.OK : ActionStatus.StatusCode.Error);
		}

		#endregion





		#region Move file/directory

		public class MoveRequest
		{
			[JsonPropertyName("url")]
			public string Url { get; set; }

			[JsonPropertyName("parent")]
			public string Parent { get; set; }

			[JsonPropertyName("fileName")]
			public string FileName { get; set; }
		}


		public class MoveResponse
		{
			[JsonPropertyName("actionStatus")]
			public ActionStatus ActionStatus { get; set; }

			//[JsonPropertyName("success")]
			//public bool Success { get; set; }

			[JsonPropertyName("oldUrl")]
			public string OldUrl { get; set; }

			[JsonPropertyName("newUrl")]
			public string NewUrl { get; set; }
		}


		public static MoveResponse RenameFile(MoveRequest request) => RenameFile(request?.Url, request?.FileName);
		public static MoveResponse RenameFile(string url, string newName)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentFile contentFile = item?.AsFile;
			if (contentFile == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };

			ActionStatus status = contentFile.Rename(newName) ?? new(ActionStatus.StatusCode.Error);
			string newUrl = null;

			if (status.IsOk == true)
			{
				try
				{
					List<string> parts = new(item.UrlParts);
					if (parts?.Count > 0) parts[parts.Count - 1] = newName;
					newUrl = CombineUrlPaths("", CombineUrlPaths(workspace.UrlPath, string.Join("/", parts)));
				}
				catch { }
			}

			return new() { ActionStatus = status, OldUrl = url, NewUrl = newUrl };
		}



		public static MoveResponse MoveFile(MoveRequest request) => MoveFile(request?.Url, request?.Parent);
		public static MoveResponse MoveFile(string url, string newParentPath)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentFile contentFile = item?.AsFile;
			if (contentFile == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };

			ActionStatus status = contentFile.Move(newParentPath) ?? new(ActionStatus.StatusCode.Error);
			string newUrl = null;

			if (status.IsOk == true)
			{
				try
				{
					newUrl = CombineUrlPaths("", CombineUrlPaths(workspace.UrlPath, CombineUrlPaths(newParentPath, contentFile.FileName)));
				}
				catch { }
			}

			return new() { ActionStatus = status, OldUrl = url, NewUrl = newUrl };
		}

		#endregion





		#region Rename file/directory

		public static MoveResponse RenameDirectory(MoveRequest request) => RenameDirectory(request?.Url, request?.FileName);
		public static MoveResponse RenameDirectory(string url, string newName)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentDirectory contentDirectory = item?.AsDirectory;
			if (contentDirectory == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };

			ActionStatus status = contentDirectory.Rename(newName) ?? new(ActionStatus.StatusCode.Error);
			string newUrl = null;

			if (status.IsOk == true)
			{
				try
				{
					List<string> parts = new(item.UrlParts);
					if (parts?.Count > 0) parts[parts.Count - 1] = newName;
					newUrl = CombineUrlPaths("", CombineUrlPaths(workspace.UrlPath, string.Join("/", parts)));
				}
				catch { }
			}

			return new() { ActionStatus = status, OldUrl = url, NewUrl = newUrl };
		}



		public static MoveResponse MoveDirectory(MoveRequest request) => MoveDirectory(request?.Url, request?.Parent);
		public static MoveResponse MoveDirectory(string url, string newParentPath)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentDirectory contentdirectory = item?.AsDirectory;
			if (contentdirectory == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };

			ActionStatus status = contentdirectory.Move(newParentPath) ?? new(ActionStatus.StatusCode.Error);
			string newUrl = null;

			if (status.IsOk == true)
			{
				try
				{
					newUrl = CombineUrlPaths("", CombineUrlPaths(workspace.UrlPath, CombineUrlPaths(newParentPath, CombineUrlPaths(contentdirectory.UrlParts.LastOrDefault(), ""))));
				}
				catch { }
			}

			return new() { ActionStatus = status, OldUrl = url, NewUrl = newUrl };
		}

		#endregion





		#region Create file/directory

		public class CreateFileRequest
		{
			[JsonPropertyName("parent")]
			public string Parent { get; set; }

			[JsonPropertyName("fileName")]
			public string FileName { get; set; }
		}


		public static DataWithStatus<ContentItemSummary> CreateFile(CreateFileRequest request) => CreateFile(request?.Parent, request?.FileName);
		public static DataWithStatus<ContentItemSummary> CreateFile(string parentUrl, string fileName)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(parentUrl);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentDirectory parent = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical)?.AsDirectory;
			if (parent == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound, message: "Can't find selected folder") };

			DataWithStatus<ContentItemSummary> response = workspace.Content.CreateFile(parent, fileName);

			return response;
		}


		public static DataWithStatus<ContentItemSummary> CreateDirectory(CreateFileRequest request) => CreateDirectory(request?.Parent, request?.FileName);
		public static DataWithStatus<ContentItemSummary> CreateDirectory(string parentUrl, string fileName)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(parentUrl);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentDirectory parent = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical)?.AsDirectory;
			if (parent == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound, message: "Can't find selected folder") };

			DataWithStatus<ContentItemSummary> response = workspace.Content.CreateDirectory(parent, fileName);

			return response;
		}

		#endregion





		#region Delete file/directory

		public class DeleteItemRequest
		{
			[JsonPropertyName("url")]
			public string Url { get; set; }
		}

		public class DeleteItemResponse
		{
			[JsonPropertyName("actionStatus")]
			public ActionStatus ActionStatus { get; set; }

			[JsonPropertyName("parentUrl")]
			public string ParentUrl { get; set; }

			[JsonPropertyName("parentReactLocalUrl")]
			public string ParentReactLocalUrl { get; set; }

			public DeleteItemResponse() { }
			public DeleteItemResponse(ActionStatus actionStatus, string parentUrl = null, string parentReactLocalUrl = null)
			{
				ActionStatus = actionStatus;
				ParentUrl = parentUrl;
				ParentReactLocalUrl = parentReactLocalUrl;
			}
		}

		public static DeleteItemResponse DeleteItem(DeleteItemRequest request) => DeleteItem(request?.Url);
		public static DeleteItemResponse DeleteItem(string url)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return new(new ActionStatus(ActionStatus.StatusCode.NotFound));
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			if (item == null) return new(new ActionStatus(ActionStatus.StatusCode.NotFound));

			string parentUrl = null;
			string parentReactLocalUrl = null;

			try
			{
				List<string> parentParts = remainingPath.GetRange(0, remainingPath.Count - 1);
				ContentItemSummary parent = new ContentItemSummary(workspace.Content.FindItem(parentParts, ContentStorage.MatchType.Physical));
				if (parent != null)
				{
					parentUrl = parent.Url;
					parentReactLocalUrl = parent.ReactLocalUrl;
				}
			}
			catch { }

			ActionStatus status = null;

			if (item.Type == ContentItemType.File)
				status = item.AsFile?.Delete();
			else if (item.Type == ContentItemType.Directory)
				status = item.AsDirectory?.Delete();

			return new(status, parentUrl, parentReactLocalUrl);
		}

		#endregion





		#region Upload files

		public class PreUploadCheckRequest
		{
			[JsonPropertyName("parentUrl")]
			public string ParentUrl { get; set; }

			[JsonPropertyName("files")]
			public List<ClientFile> Files { get; set; }

			public class ClientFile
			{
				[JsonPropertyName("name")]
				public string Name { get; set; }
			}
		}

		public class PreUploadCheckResponse
		{
			[JsonPropertyName("actionStatus")]
			public ActionStatus ActionStatus { get; set; }

			[JsonPropertyName("files")]
			public List<FileStatus> Files { get; set; }

			public enum FileStatusType
			{
				OK,
				AlreadyExists
			}
			public class FileStatus
			{
				[JsonPropertyName("name")]
				public string Name { get; set; }

				[JsonPropertyName("status")]
				public FileStatusType Status { get; set; }
			}
		}

		public static PreUploadCheckResponse PreUploadCheck(PreUploadCheckRequest request)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(request?.ParentUrl);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentDirectory parent = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical)?.AsDirectory;
			if (parent == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound, message: "Can't find target folder") };

			try
			{
				List<ContentItemSummary> children = workspace.Content.GetChildren(parent.UrlParts, MatchType.Physical);

				// Presume case-insensitive file system
				HashSet<string> existingItems = children.Select(x => x.FileName?.ToLower()).Distinct().ToHashSet();

				List<PreUploadCheckResponse.FileStatus> statuses = new();

				if (request?.Files?.Count > 0)
				{
					foreach(var file in request.Files)
					{
						if (string.IsNullOrWhiteSpace(file?.Name)) continue;
						PreUploadCheckResponse.FileStatus status = new() { Name = file?.Name };
						if (existingItems.Contains(file.Name.ToLower()))
							status.Status = PreUploadCheckResponse.FileStatusType.AlreadyExists;
						else
							status.Status = PreUploadCheckResponse.FileStatusType.OK;
						statuses.Add(status);
					}
				}

				return new() { ActionStatus = new(ActionStatus.StatusCode.OK), Files = statuses };
			}
			catch (Exception e)
			{
				return new PreUploadCheckResponse() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.Error, exception: e) };
			}
		}



		public class UploadFileRequest
		{
			[JsonPropertyName("parentUrl")]
			public string ParentUrl { get; set; }

			[JsonPropertyName("file")]
			public IFormFile File { get; set; }
		}

		public static DataWithStatus<ContentItemSummary> UploadFile(UploadFileRequest request)
		{
			if (request?.File == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.MissingRequestData, "No file was sent") };
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(request?.ParentUrl);
			if ((workspace == null) || (remainingPath == null)) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound) };
			ContentDirectory parent = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical)?.AsDirectory;
			if (parent == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.NotFound, message: "Can't find target folder") };

			try
			{
				string fileName = request.File?.FileName;
				ContentFile file = workspace.Content.FindItem(parent.UrlParts.Append(fileName).ToList(), MatchType.Physical)?.AsFile;
				if (file == null)
				{
					DataWithStatus<ContentItemSummary> createResponse = workspace.Content.CreateFile(parent, fileName);
					if (createResponse?.ActionStatus?.IsOk != true) return new() { ActionStatus = createResponse?.ActionStatus ?? new(ActionStatus.StatusCode.Error) };
					file = workspace.Content.FindItem(createResponse?.Data?.UrlParts, MatchType.Physical)?.AsFile;
					if (file == null) return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.Error) };
				}
				ActionStatus status = file.SaveBinaryFile(request.File.OpenReadStream());
				return new(status, new ContentItemSummary(file));
			}
			catch (Exception e)
			{
				return new() { ActionStatus = new ActionStatus(ActionStatus.StatusCode.Error, exception: e) };
			}
		}



		#endregion

	}
}