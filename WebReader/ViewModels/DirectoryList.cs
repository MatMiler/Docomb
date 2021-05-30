using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader.ViewModels
{
	public class DirectoryList
	{

		public DirectoryList() { }
		public DirectoryList(string urlPath, Workspace workspace, ContentDirectory contentDirectory, List<string> contentPathParts, dynamic viewBag)
		{
			UrlPath = urlPath;
			Workspace = workspace;
			ContentDirectory = contentDirectory;
			ContentPathParts = contentPathParts;
			PrepareViewbag(viewBag);
		}

		public void PrepareViewbag(dynamic viewBag)
		{
			viewBag.Title = ContentDirectory.Title;
			viewBag.WorkspacePath = Workspace.UrlPath;
			viewBag.Workspace = Workspace;
			viewBag.PathParts = ContentDirectory.UrlParts;
			viewBag.HasPageData = true;
		}


		public string UrlPath { get; protected set; }
		public Workspace Workspace { get; protected set; }
		public ContentDirectory ContentDirectory { get; protected set; }
		public List<string> ContentPathParts { get; protected set; }

	}
}
