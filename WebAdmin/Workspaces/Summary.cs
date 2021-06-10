using Docomb.CommonCore;
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

			[JsonPropertyName("initials")]
			public string Initials { get; set; }

			public string Icon { get; set; }

			public WorkspaceSummary()
			{

			}

			public WorkspaceSummary(ContentStorage.Workspace workspace)
			{
				Name = workspace.Name?.Trim();
				Url = Utils.CombineUrlPaths("", workspace.UrlPath);
				Initials = (Name?.Length > 0) ? Name[0..1] : "?";
			}
		}



		public static List<WorkspaceSummary> GetList()
		{
			return WebCore.Configurations.WorkspacesConfig.Workspaces.Select(x => new WorkspaceSummary(x))?.ToList();
		}






	}
}
