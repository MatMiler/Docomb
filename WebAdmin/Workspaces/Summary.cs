using Docomb.CommonCore;
using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Workspaces
{
	public static class Summary
	{

		public class WorkspaceSummary
		{
			[JsonPropertyName("name")]
			public string Name { get; set; }

			[JsonPropertyName("url")]
			public string Url { get; set; }

			[JsonPropertyName("localUrl")]
			public string LocalUrl { get; set; }

			[JsonPropertyName("initials")]
			public string Initials { get; set; }

			[JsonPropertyName("icon")]
			public string Icon { get; set; }

			public WorkspaceSummary()
			{

			}

			public WorkspaceSummary(Workspace workspace)
			{
				if (workspace == null) return;
				Name = workspace.Name?.Trim();
				Url = workspace.UrlPath;
				LocalUrl = Utils.CombineUrlPaths("", workspace.UrlPath);
				Initials = (Name?.Length > 0) ? Name[0..1] : "?";
			}
		}



		public static List<WorkspaceSummary> GetWorkspaceSummaryList()
		{
			return WebCore.Configurations.WorkspacesConfig.Workspaces.Select(x => new WorkspaceSummary(x))?.ToList();
		}



		public class ContentItemSummary
		{
			[JsonPropertyName("type")]
			public ContentItemType Type { get; set; }

			[JsonPropertyName("name")]
			public string Name { get; set; }

			[JsonPropertyName("url")]
			public string Url { get; set; }

			[JsonPropertyName("localUrl")]
			public string LocalUrl { get; set; }

			[JsonPropertyName("children")]
			public List<ContentItemSummary> Children { get; set; }

			public ContentItemSummary(ContentItem item, Workspace workspace)
			{
				Type = item.Type;
				Name = item.Title;
				Url = item.Url;
				LocalUrl = Utils.CombineUrlPaths("", Utils.CombineUrlPaths(workspace.UrlPath, item.Url));
			}
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

			[JsonPropertyName("action")]
			public ContentItemAction Action { get; set; }
		}

		public static WorkspacePageInfo GetWorkspacePageInfo(string url)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return null;
			ContentItem item = workspace.Content.FindItem(remainingPath);


			return new()
			{
				Workspace = new(workspace),
				ContentItem = (item != null) ? new(item, workspace) : null,
				Action = ContentItemAction.View
			};
		}


	}
}
