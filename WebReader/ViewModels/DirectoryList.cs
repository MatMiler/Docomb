using Docomb.ContentStorage;
using Docomb.ContentStorage.Workspaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader.ViewModels
{
	public class DirectoryList
	{
		public DirectoryList() { }
		public DirectoryList(string urlPath, Workspace workspace, ContentDirectory contentDirectory, List<string> contentPathParts, dynamic viewBag, ClaimsPrincipal user)
		{
			ContentDirectory = contentDirectory;
			Context = new(urlPath, workspace, contentDirectory, contentPathParts, viewBag, user);
		}

		public ContentDirectory ContentDirectory { get; protected set; }
		public PageContext Context { get; protected set; }

	}
}
