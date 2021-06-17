using static Docomb.CommonCore.Utils;
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
				//contentFile.Workspace.Content.ClearCache();
			}

			return success;
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
			[JsonPropertyName("success")]
			public bool Success { get; set; }

			[JsonPropertyName("oldUrl")]
			public string OldUrl { get; set; }

			[JsonPropertyName("newUrl")]
			public string NewUrl { get; set; }
		}


		public static MoveResponse RenameFile(MoveRequest request) => RenameFile(request?.Url, request?.FileName);
		public static MoveResponse RenameFile(string url, string newName)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return new() { Success = false };
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentFile contentFile = item?.AsFile;
			if (contentFile == null) return new() { Success = false };

			bool success = contentFile.Rename(newName);
			string newUrl = null;

			if (success)
			{
				try
				{
					List<string> parts = new(item.UrlParts);
					if (parts?.Count > 0) parts[parts.Count - 1] = newName;
					newUrl = CombineUrlPaths("", CombineUrlPaths(workspace.UrlPath, string.Join("/", parts)));
				}
				catch { }
			}

			return new() { OldUrl = url, NewUrl = newUrl, Success = success };
		}



		public static MoveResponse RenameDirectory(MoveRequest request) => RenameDirectory(request?.Url, request?.FileName);
		public static MoveResponse RenameDirectory(string url, string newName)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return new() { Success = false };
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);
			ContentDirectory contentDirectory = item?.AsDirectory;
			if (contentDirectory == null) return new() { Success = false };

			bool success = contentDirectory.Rename(newName);
			string newUrl = null;

			if (success)
			{
				try
				{
					List<string> parts = new(item.UrlParts);
					if (parts?.Count > 0) parts[parts.Count - 1] = newName;
					newUrl = CombineUrlPaths("", CombineUrlPaths(workspace.UrlPath, string.Join("/", parts)));
				}
				catch { }
			}

			return new() { OldUrl = url, NewUrl = newUrl, Success = success };
		}



	}
}
