using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.Workspaces
{
	public class Workspace
	{
		public Workspace(string name, string urlPath, string storagePath)
		{
			Name = name;
			UrlPath = urlPath;
			ContentStoragePath = storagePath;
			Initialize();
		}



		/// <summary>Name of the workspace</summary>
		public string Name { get; set; }


		/// <summary>Description of the workspace</summary>
		public string Description { get; set; }


		/// <summary></summary>
		public string UrlPath
		{
			get => _urlPath;
			set
			{
				// Split and re-join path parts for consistency
				UrlParts = SplitPath(value, true);
				_urlPath = string.Join('/', UrlParts) + "/";
			}
		}
		private string _urlPath = null;

		public string ParentUrl { get => _parentUrl; set { _parentUrl = value; _fullUrl = null; } }
		private string _parentUrl = null;

		public string FullUrl => _fullUrl ??= ParentUrl?.TrimEnd('/') + '/' + UrlPath?.TrimStart('/');
		private string _fullUrl = null;

		public List<string> UrlParts { get; protected set; }


		/// <summary>Path of the directory where the content is stored (.md files, images, etc.)</summary>
		public string ContentStoragePath { get; set; }


		/// <summary>Which engine should be used to display Markdown files</summary>
		public string MarkdownEngineCode { get; set; }


		/// <summary>Representation icon</summary>
		public string Icon { get; set; }


		public GitManager Git { get; set; }


		public Library Content { get => _content ??= new Library(this, ContentStoragePath, UrlPath); }
		private Library _content = null;



		public void Initialize()
		{
			if (Git != null) Git.Workspace = this;
		}


		public bool Is(Workspace workspace)
		{
			return UrlPath == workspace?.UrlPath;
		}


	}
}
