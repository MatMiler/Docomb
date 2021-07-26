using Docomb.CommonCore;
using Docomb.ContentStorage;
using Docomb.ContentStorage.Workspaces;
using Docomb.WebCore.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using System.Web;

namespace Docomb.WebAdmin.Api.ContentManager
{
	public static class Info
	{

		public class WorkspaceSummary
		{
			[JsonPropertyName("name")]
			public string Name { get; set; }

			[JsonPropertyName("url")]
			public string Url { get; set; }

			[JsonPropertyName("reactLocalUrl")]
			public string ReactLocalUrl { get; set; }

			[JsonPropertyName("initials")]
			public string Initials { get; set; }

			[JsonPropertyName("icon")]
			public string Icon { get; set; }

			[JsonPropertyName("storage")]
			public WorkspaceStorageInfo Storage { get; set; }

			public WorkspaceSummary()
			{

			}

			public WorkspaceSummary(Workspace workspace)
			{
				if (workspace == null) return;
				Name = workspace.Name?.Trim();
				Url = workspace.UrlPath;
				ReactLocalUrl = Utils.CombineUrlPaths("", workspace.UrlPath);
				Initials = (Name?.Length > 0) ? Name[0..1] : "?";
				Storage = new()
				{
					HasGit = workspace.Git?.IsValid ?? false
				};
			}
		}

		public class WorkspaceStorageInfo
		{
			[JsonPropertyName("hasGit")]
			public bool HasGit { get; set; }
		}



		public static List<WorkspaceSummary> GetWorkspaceSummaryList(ClaimsPrincipal user)
		{
			if (!user.Identity.IsAuthenticated) return null;
			List<WorkspaceSummary> list = new List<WorkspaceSummary>();

			UserInfo userInfo = new(user);

			List<Workspace> workspaces = WebCore.Configurations.WorkspacesConfig.Workspaces;
			if (workspaces?.Count > 0)
			{
				foreach (Workspace workspace in workspaces)
				{
					if (userInfo.GetAccessLevel(workspace) >= AccessLevel.Editor)
					{
						list.Add(new(workspace));
					}
				}
			}

			return list;
		}



		public enum ContentItemAction
		{
			View,
			Edit
		}

		public class WorkspacePageInfo
		{
			[JsonPropertyName("workspace")]
			public WorkspaceSummary Workspace { get; set; }

			[JsonPropertyName("contentItem")]
			public ContentItemSummary ContentItem { get; set; }

			[JsonPropertyName("details")]
			public FileDetails FileDetails { get; set; }

			[JsonPropertyName("breadcrumbs")]
			public List<ContentItemSummary> Breadcrumbs { get; set; }

			[JsonPropertyName("action")]
			public ContentItemAction Action { get; set; }
		}

		public static WorkspacePageInfo GetWorkspacePageInfo(ClaimsPrincipal user, string url, string query)
		{
			if (!user.Identity.IsAuthenticated) return null;
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return null;
			if (new UserInfo(user).GetAccessLevel(workspace) < AccessLevel.Editor) return null;
			ContentItem item = workspace.Content.FindItem(remainingPath, MatchType.Physical);
			System.Collections.Specialized.NameValueCollection queryParams = HttpUtility.ParseQueryString((query ?? "").TrimStart('?'));
			ContentItemAction action = ContentItemAction.View;
			ContentFile contentFile = item?.AsFile;
			FileDetails details = (contentFile != null) ? new FileDetails(contentFile) : null;

			#region Breadcrumbs / Parents
			List<ContentItemSummary> breadcrumbs = new();
			{
				List<ContentStorage.ContentItemSummary> parents = workspace.Content.GetParents(remainingPath, MatchType.Physical, true);
				if (parents?.Count > 0)
				{
					for (int x = 0; x < parents.Count; x++)
					{
						ContentItemSummary parent = parents[x];
						ContentItemSummary crumb = parent.Clone();
						crumb.Title = (x == 0) ? workspace.Name : parent.FileName;
						breadcrumbs.Add(crumb);
					}
				}
			}
			#endregion

			#region Additional
			{
				if ((queryParams?.Get("action") ?? "").Trim().ToLower() == "edit")
				{
					switch (item?.AsFile?.FileType)
					{
						case FileType.Markdown: case FileType.Html: case FileType.PlainText: { action = ContentItemAction.Edit; break; }
					}
				}
			}
			#endregion

			return new()
			{
				Workspace = new(workspace),
				ContentItem = (item != null) ? new(item) : null,
				FileDetails = details,
				Action = action,
				Breadcrumbs = breadcrumbs
			};
		}


		public static List<ContentItemSummary> GetTree(ClaimsPrincipal user, string workspaceUrl)
		{
			if (!user.Identity.IsAuthenticated) return null;
			(Workspace workspace, _) = WebCore.Configurations.WorkspacesConfig.FindFromPath(workspaceUrl);
			if (workspace == null) return null;
			if (new UserInfo(user).GetAccessLevel(workspace) < AccessLevel.Editor) return null;
			return GetTree(workspace, new());
		}

		private static List<ContentItemSummary> GetTree(Workspace workspace, List<string> parentPathParts, int depth = 0)
		{
			if (depth > 50) return null;
			List<ContentStorage.ContentItemSummary> children = workspace.Content.GetPhysicalChildren(parentPathParts);
			if ((children == null) || (children.Count <= 0)) return null;

			List<ContentItemSummary> items = new();
			foreach (ContentStorage.ContentItemSummary child in children)
			{
				if (child == null) continue;
				ContentItemSummary item = child.Clone();
				item.Title = child.FileName;
				items.Add(item);
				if (item.Type == ContentItemType.Directory)
					item.Children = GetTree(workspace, child.UrlParts, depth + 1);
			}

			return items;
		}



		public static DataWithStatus<List<string>> GetDirectoryPaths(ClaimsPrincipal user, string workspaceUrl)
		{
			if (!user.Identity.IsAuthenticated) return new(new ActionStatus(ActionStatus.StatusCode.AuthorizationNeeded), null);
			(Workspace workspace, _) = WebCore.Configurations.WorkspacesConfig.FindFromPath(workspaceUrl);
			if (workspace == null) return new(new ActionStatus(ActionStatus.StatusCode.NotFound), null);
			if (new UserInfo(user).GetAccessLevel(workspace) < AccessLevel.Editor) return new(new ActionStatus(ActionStatus.StatusCode.AccessDenied), null);
			try
			{
				List<string> list = GetChildDirectoryPaths(workspace, new());
				return new(new ActionStatus(ActionStatus.StatusCode.OK), list);
			}
			catch (Exception e)
			{
				return new(new ActionStatus(ActionStatus.StatusCode.Error, exception: e), null);
			}
		}


		private static List<string> GetChildDirectoryPaths(Workspace workspace, List<string> parentPathParts, int depth = 0)
		{
			List<string> list = new();

			List<ContentStorage.ContentItemSummary> children = workspace.Content.GetPhysicalChildren(parentPathParts, false, true);
			if ((children == null) || (children.Count <= 0)) return new();

			List<ContentItemSummary> items = new();
			foreach (ContentStorage.ContentItemSummary child in children)
			{
				if (child?.Type != ContentItemType.Directory) continue;
				list.Add(child.Url);
				list.AddRange(GetChildDirectoryPaths(workspace, child.UrlParts, depth + 1));
			}

			return list;
		}




	}
}
