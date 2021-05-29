﻿using Docomb.ContentStorage;
using Microsoft.AspNetCore.Mvc;
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
			(Workspace workspace, List<string> remainingPath) = Docomb.WebCore.Configurations.WorkspacesConfig.FindFromPath(itemPath);
			if ((workspace != null) && (remainingPath != null))
			{
				ContentItem item = workspace.Content.FindItem(remainingPath);
				switch (item?.Type)
				{
					case ContentItemType.File: return ViewContentFile(itemPath, workspace, item.AsFile, remainingPath);
					case ContentItemType.Directory: return ViewContentDirectory(itemPath, workspace, item.AsDirectory, remainingPath);
				}
			}

			// TODO: Redirect to an alternative URL (parent, root)

			//return View();
			return Content($"No content at '{itemPath}'");
		}



		[HttpGet("/__file/{**itemPath}")]
		public IActionResult ViewContentFile(string itemPath, Workspace workspace = null, ContentFile file = null, List<string> remainingPath = null)
		{
			if (workspace == null) (workspace, remainingPath) = Docomb.WebCore.Configurations.WorkspacesConfig.FindFromPath(itemPath);
			if (workspace == null) return Content($"No workspace at '{string.Join('/', remainingPath)}'");
			file ??= workspace.Content.FindItem(remainingPath)?.AsFile;
			if (file == null) return Content($"No content file at '{string.Join('/', remainingPath)}'");


			switch (file.FileType)
			{
				case FileType.Markdown: return View("~/Areas/Reader/Pages/Article.cshtml", new ViewModels.Article(itemPath, workspace, file, remainingPath));
				case FileType.Html: return Content(file.TextContent, contentType: Docomb.ContentStorage.FormatInfo.HtmlInfo.MediaType);
			}





			return Content($"Workspace '{workspace.Name}', path '{string.Join('/', file.UrlParts)}', content '{file.FilePath}' ({file.FileType})");
		}



		[HttpGet("/__file/{**itemPath}")]
		public IActionResult ViewContentDirectory(string itemPath, Workspace workspace = null, ContentDirectory directory = null, List<string> remainingPath = null)
		{
			if (workspace == null) (workspace, remainingPath) = Docomb.WebCore.Configurations.WorkspacesConfig.FindFromPath(itemPath);
			if (workspace == null) return Content($"No workspace at '{string.Join('/', remainingPath)}'");
			directory ??= workspace.Content.FindItem(remainingPath)?.AsDirectory;
			if (directory == null) return Content($"No content directory at '{string.Join('/', remainingPath)}'");

			return Content($"Workspace '{workspace.Name}', URL path '{string.Join('/', directory.UrlParts)}', directory content '{directory.FilePath}'");
		}


	}
}
