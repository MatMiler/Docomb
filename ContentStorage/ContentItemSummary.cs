using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class ContentItemSummary : IContentInfo
	{
		public ContentItemType Type { get; protected set; }

		public string FilePath { get; protected set; }

		public string Url { get; protected set; }

		public bool NeedsTrailingSlash { get; protected set; }

		public List<string> UrlParts { get; protected set; }

		public string Title { get; protected set; }

		public Workspace Workspace { get; protected set; }

		public string FullUrl => Workspace?.FullUrl?.TrimEnd('/') + "/" + Url?.TrimStart('/');




		public ContentItemSummary() { }
		public ContentItemSummary(Workspace workspace, ContentItemType type, string filePath, List<string> urlParts, bool needsTrailingSlash, string title)
		{
			Workspace = workspace;
			Type = type;
			FilePath = filePath;
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
				UrlParts = item.UrlParts;
				NeedsTrailingSlash = item.NeedsTrailingSlash;
				Title = item.Title;
				Url = string.Join('/', UrlParts) + (NeedsTrailingSlash ? '/' : null);
			}
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
