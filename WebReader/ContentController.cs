using Docomb.CommonCore;
using Docomb.ContentStorage;
using Docomb.ContentStorage.Workspaces;
using Docomb.WebCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebReader
{
	[Route("")]
	public class ContentController : Controller
	{

		[HttpGet("/{**itemPath}")]
		public IActionResult ViewContentItem(string itemPath)
		{
			UserInfo userInfo = new UserInfo(User);
			if (!Access.HasAccess(User, WebCore.Authentication.AccessLevel.Reader))
			{
				return Redirect(User.Identity.IsAuthenticated ? "/account/denied" : "/account/login");
			}

			ViewBag.User = userInfo;
			ViewBag.ItemPath = itemPath;

			(Workspace workspace, List<string> remainingPath) = Docomb.WebCore.Configurations.WorkspacesConfig.FindFromPath(itemPath);
			if ((workspace != null) && (remainingPath != null))
			{
				ContentItem item = workspace.Content.FindItem(remainingPath, MatchType.Logical);
				switch (item?.Type)
				{
					case ContentItemType.File: return ViewContentFile(itemPath, workspace, item.AsFile, remainingPath);
					case ContentItemType.Directory: return ViewContentDirectory(itemPath, workspace, item.AsDirectory, remainingPath);
				}
			}

			ViewBag.ItemPath = null;

			if (string.IsNullOrEmpty(itemPath?.Trim('/')))
				return View("~/Areas/Reader/Pages/WorkspaceList.cshtml");
			else
				return NotFound();
		}



		private IActionResult ViewContentFile(string itemPath, Workspace workspace = null, ContentFile file = null, List<string> remainingPath = null)
		{
			if (workspace == null) (workspace, remainingPath) = Docomb.WebCore.Configurations.WorkspacesConfig.FindFromPath(itemPath);
			if (workspace == null) return NotFound();
			file ??= workspace.Content.FindItem(remainingPath, MatchType.Logical)?.AsFile;
			if (file == null) return NotFound();


			if ((itemPath?.Length > 0) && (!itemPath.EndsWith('/')) && (file.NeedsTrailingSlash))
				return Redirect(Request.Path + "/");

			if (Utils.ParseBool(Request.Query["raw"]))
			{
				return PhysicalFile(file.FilePath, ContentStorage.FormatInfo.PlainTextInfo.MediaType);
			}


			switch (file.FileType)
			{
				case FileType.Markdown:
				case FileType.PlainText:
					return View("~/Areas/Reader/Pages/Article.cshtml", new ViewModels.Article(itemPath, workspace, file, remainingPath, ViewBag, User));
			}


			var fileTypeProvider = new FileExtensionContentTypeProvider();
			if (fileTypeProvider.TryGetContentType(file.FileName, out string contentType))
				return PhysicalFile(file.FilePath, contentType);

			return BadRequest();
		}



		private IActionResult ViewContentDirectory(string itemPath, Workspace workspace = null, ContentDirectory directory = null, List<string> remainingPath = null)
		{
			if (workspace == null) (workspace, remainingPath) = Docomb.WebCore.Configurations.WorkspacesConfig.FindFromPath(itemPath);
			if (workspace == null) return NotFound();
			directory ??= workspace.Content.FindItem(remainingPath, MatchType.Logical)?.AsDirectory;
			if (directory == null) return NotFound();

			return View("~/Areas/Reader/Pages/Directory.cshtml", new ViewModels.DirectoryList(itemPath, workspace, directory, remainingPath, ViewBag, User));
		}


	}
}
