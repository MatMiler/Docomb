using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.Json.Serialization;
using Docomb.ContentStorage.Workspaces;

namespace Docomb.ContentStorage
{
	public class ContentItemSummary : IContentInfo
	{
		[JsonPropertyName("type")]
		public ContentItemType Type { get; protected set; }

		[JsonPropertyName("fileName")]
		public string FileName { get; protected set; }

		[JsonIgnore]
		public string FilePath { get; protected set; }

		[JsonPropertyName("url")]
		public string Url { get; protected set; }

		[JsonIgnore]
		public bool NeedsTrailingSlash { get; protected set; }

		[JsonIgnore]
		public List<string> UrlParts { get; protected set; }

		[JsonPropertyName("name")]
		public string Title { get; set; }

		[JsonIgnore]
		public Workspace Workspace { get; protected set; }

		[JsonPropertyName("children")]
		public List<ContentItemSummary> Children { get; set; }

		[JsonPropertyName("reactLocalUrl")]
		public string ReactLocalUrl => CombineUrlPaths("", CombineUrlPaths(Workspace.UrlPath, Url));

		[JsonPropertyName("fullUrl")]
		public string FullUrl => Workspace?.FullUrl?.TrimEnd('/') + "/" + Url?.TrimStart('/');




		public ContentItemSummary() { }
		public ContentItemSummary(Workspace workspace, ContentItemType type, string filePath, List<string> urlParts, bool needsTrailingSlash, string title)
		{
			Workspace = workspace;
			Type = type;
			FilePath = filePath;
			FileName = GetFileNameFromPath(FilePath);
			UrlParts = urlParts;
			NeedsTrailingSlash = needsTrailingSlash;
			Title = title;
			Url = string.Join('/', urlParts) + (NeedsTrailingSlash ? '/' : null);
		}

		public ContentItemSummary(ContentItem item)
		{
			if (item != null)
			{
				Workspace = item.Workspace;
				Type = item.Type;
				FilePath = item.FilePath;
				FileName = GetFileNameFromPath(FilePath);
				UrlParts = item.UrlParts;
				NeedsTrailingSlash = item.NeedsTrailingSlash;
				Title = item.Title;
				Url = string.Join('/', UrlParts) + (NeedsTrailingSlash ? '/' : null);
			}
		}

		public ContentItemSummary Clone()
		{
			return new()
			{
				Type = Type,
				FileName = FileName,
				FilePath = FilePath,
				Url = Url,
				NeedsTrailingSlash = NeedsTrailingSlash,
				UrlParts = UrlParts,
				Title = Title,
				Workspace = Workspace,
				Children = Children
			};
		}


		public ContentFile GetFile()
		{
			return ((Type == ContentItemType.File) && (!string.IsNullOrEmpty(FilePath))) ? new(Workspace, FilePath, UrlParts, NeedsTrailingSlash) : null;
		}

		public ContentDirectory GetDirectory(Workspace workspace)
		{
			return ((Type == ContentItemType.Directory) && (!string.IsNullOrEmpty(FilePath))) ? new(workspace, FilePath, UrlParts) : null;
		}

	}
}
