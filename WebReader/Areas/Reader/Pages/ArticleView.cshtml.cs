using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Docomb.WebReader.Reader.Pages
{
	public class ArticleViewModel : PageModel
	{
		[BindProperty(SupportsGet = true)]
		public string ArticlePath { get; set; }

		public void OnGet()
		{
		}
	}
}
