using static Docomb.CommonCore.Utils;
using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Docomb.CommonCore;

namespace Docomb.WebAdmin.Api.ContentManager
{
	public static class Edit
	{


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



	}
}
