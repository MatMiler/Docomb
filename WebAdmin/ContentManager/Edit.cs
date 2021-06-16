using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.ContentManager
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


		public static bool Save(SaveRequest request)
		{
			if (request == null) return false;
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(request.Url);
			if ((workspace == null) || (remainingPath == null)) return false;
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentFile contentFile = item?.AsFile;

			bool success = false;

			if (contentFile != null)
			{
				success = contentFile.SaveTextFile(request.TextContent);
				contentFile.Workspace.Content.ClearCache();
			}

			return success;
		}






	}
}
