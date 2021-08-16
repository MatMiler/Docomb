using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Docomb.ContentStorage.Workspaces;

namespace Docomb.ContentStorage
{
	public abstract class ContentItem : IContentInfo
	{
		public abstract ContentItemType Type { get; }

		public string FilePath { get; protected set; }

		public string Url { get => _url ??= string.Join('/', UrlParts) + (NeedsTrailingSlash ? '/' : null); protected set => _url = value; }
		private string _url = null;

		public abstract bool NeedsTrailingSlash { get; }

		public virtual string Title { get => _title ??= UrlParts?.LastOrDefault() ?? Workspace.Name; set => _title = value; }
		protected string _title = null;


		public Workspace Workspace { get; protected set; }


		public List<string> UrlParts { get; protected set; }


		public ContentItem(Workspace workspace, string filePath, List<string> urlParts)
		{
			Workspace = workspace;
			FilePath = filePath;
			UrlParts = urlParts;
			_url = null;
		}

		public ContentFile AsFile => (this is ContentFile file) ? file : null;
		public ContentDirectory AsDirectory => (this is ContentDirectory directory) ? directory : null;


		public string FullUrlPath => _fullUrlPath ??= string.Join("/", (Workspace.UrlParts ?? new()).Concat(SplitPath(System.IO.Path.GetRelativePath(Workspace.ContentStoragePath, FilePath))));
		private string _fullUrlPath = null;

	}
}
