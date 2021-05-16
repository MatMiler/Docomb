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

			Reader.Pages.ArticleViewModel model = new() { ArticlePath = articlePath };
			return View("~/Areas/Reader/Pages/ArticleView.cshtml", model);

			//return View();
			return Content(articlePath);
		}
	}
}
