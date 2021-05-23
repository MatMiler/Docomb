using Docomb.ContentStorage;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace WebReader
{
	[Route("")]
	public class ArticleController : Controller
	{

		[HttpGet("/{**articlePath}")]
		public IActionResult ViewArticle(string articlePath)
		{

			//Reader.Pages.ArticleViewModel model = new() { ArticlePath = articlePath };
			//return View("~/Areas/Reader/Pages/ArticleView.cshtml", model);

			(Docomb.ContentStorage.Workspace workspace, List<string> remainingPath)? a = Docomb.WebCore.Configurations.WorkspacesConfig.FindFromPath(articlePath);

			if (a != null)
			{
				Item contentItem = a.Value.workspace.Content.FindItem(a.Value.remainingPath);


				return Content($"Workspace '{a.Value.workspace.Name}', path '{string.Join('/', a.Value.remainingPath)}', content '{contentItem?.FilePath}' ({contentItem?.Type})");
			}


			//return View();
			return Content(articlePath);
		}
	}
}
