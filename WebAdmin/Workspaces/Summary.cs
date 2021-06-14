﻿using Docomb.CommonCore;
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
				Type = item.NeedsTrailingSlash ? ContentItemType.Directory : item.Type;
				Name = item.Title;
				Url = item.Url;
				LocalUrl = Utils.CombineUrlPaths("", Utils.CombineUrlPaths(workspace.UrlPath, item.Url));
			}

			public ContentItemSummary(ContentStorage.ContentItemSummary item, Workspace workspace)
			{
				Type = item.NeedsTrailingSlash ? ContentItemType.Directory : item.Type;
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

			[JsonPropertyName("breadcrumbs")]
			public List<ContentItemSummary> Breadcrumbs { get; set; }

			[JsonPropertyName("action")]
			public ContentItemAction Action { get; set; }
		}

		public static WorkspacePageInfo GetWorkspacePageInfo(string url)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return null;
			ContentItem item = workspace.Content.FindItem(remainingPath, MatchType.Physical);

			List<ContentItemSummary> breadcrumbs = new();
			{
				List<ContentStorage.ContentItemSummary> parents = workspace.Content.GetParents(remainingPath, MatchType.Physical, true);
				if (parents?.Count > 0)
				{
					for (int x = 0; x < parents.Count; x++)
					{
						ContentStorage.ContentItemSummary parent = parents[x];
						ContentItemSummary crumb = new(parent, workspace);
						crumb.Name = (x == 0) ? workspace.Name : parent.FileName;
						breadcrumbs.Add(crumb);
					}
				}
			}

			return new()
			{
				Workspace = new(workspace),
				ContentItem = (item != null) ? new(item, workspace) : null,
				Action = ContentItemAction.View,
				Breadcrumbs = breadcrumbs
			};
		}


		public static List<ContentItemSummary> GetTree(string workspaceUrl)
		{
			(Workspace workspace, _) = WebCore.Configurations.WorkspacesConfig.FindFromPath(workspaceUrl);
			if (workspace == null) return null;
			return GetTree(workspace, new());
		}

		public static List<ContentItemSummary> GetTree(Workspace workspace, List<string> parentPathParts, int depth = 0)
		{
			if (depth > 50) return null;
			List<ContentStorage.ContentItemSummary> children = workspace.Content.GetPhysicalChildren(parentPathParts);
			if ((children == null) || (children.Count <= 0)) return null;

			List<ContentItemSummary> items = new();
			foreach (ContentStorage.ContentItemSummary child in children)
			{
				if (child == null) continue;
				ContentItemSummary item = new(child, workspace) { Name = child.FileName };
				items.Add(item);
				if (item.Type == ContentItemType.Directory)
					item.Children = GetTree(workspace, child.UrlParts, depth + 1);
			}

			return items;
		}

	}
}
