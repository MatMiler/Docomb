using Docomb.ContentStorage.Workspaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebCore.Dtos
{
	internal class WorkspaceDto
	{
		/// <summary>Name of the workspace</summary>
		[JsonPropertyName("name")]
		public string Name { get; set; }


		/// <summary>Description of the workspace</summary>
		[JsonPropertyName("desc")]
		public string Description { get; set; }


		/// <summary></summary>
		[JsonPropertyName("urlPath")]
		public string UrlPath { get; set; }

		/// <summary>Path of the directory where the content is stored (.md files, images, etc.)</summary>
		[JsonPropertyName("storagePath")]
		public string ContentStoragePath { get; set; }

		/// <summary>Which engine should be used to display Markdown files</summary>
		[JsonPropertyName("markdownEngine")]
		public string MarkdownEngineCode { get; set; }


		/// <summary>Representation icon</summary>
		[JsonPropertyName("icon")]
		public string Icon { get; set; }


		[JsonPropertyName("git")]
		public GitConfigDto Git { get; set; }


		public Workspace ToWorkspace()
		{
			Workspace workspace = new(Name, UrlPath, ContentStoragePath)
			{
				Description = Description,
				MarkdownEngineCode = MarkdownEngineCode,
				Icon = Icon,
				Git = Git?.ToGitManager()
			};
			workspace.Initialize();
			return workspace;
		}



		public static WorkspaceDto FromWorkspace(Workspace workspace)
		{
			if (workspace == null) return null;
			return new()
			{
				Name = workspace.Name,
				Description = workspace.Description,
				UrlPath = workspace.UrlPath,
				ContentStoragePath = workspace.ContentStoragePath,
				MarkdownEngineCode = workspace.MarkdownEngineCode,
				Git = GitConfigDto.FromGitManager(workspace.Git)
			};
		}
	}
}
