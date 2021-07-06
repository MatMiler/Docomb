using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebReader
{
	[Route("account")]
	public class AuthenticationController : Controller
	{
		[HttpGet("login")]
		public ActionResult Login()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeReader)
				return Redirect("/"); // Authentication not needed

			List<WebCore.Authentication.IScheme> schemes = WebCore.Configurations.MainConfig.Instance.Authentication.Schemes;
			WebCore.Authentication.IScheme scheme = schemes?.FirstOrDefault();

			if (scheme == null)
				return Redirect("/"); // No authentication scheme
			else if ((scheme != null) && (schemes?.Count == 1))
				return Redirect($"/account/login/default"); // Only one authentication scheme, redirect to login with default (only) scheme

			PrepareViewBag();
			return View("~/Areas/Reader/Pages/AuthSelection.cshtml");
		}

		[HttpGet("login/default")]
		public async void LoginWithDefault()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeReader)
			{
				// Authentication not needed
				Response.Redirect("/");
				return;
			}

			List<WebCore.Authentication.IScheme> schemes = WebCore.Configurations.MainConfig.Instance.Authentication.Schemes;
			WebCore.Authentication.IScheme scheme = schemes?.FirstOrDefault();

			if (scheme == null)
			{
				// No authentication scheme
				Response.Redirect("/");
			}
			else
			{
				if (schemes.Count > 1)
				{
					// Multiple authentication schemes, redirect to selection
					Response.Redirect($"/account/login");
				}
				else
				{
					await HttpContext.ChallengeAsync(scheme.Code, new AuthenticationProperties { RedirectUri = "/" });
				}
			}
		}

		[HttpPost("login/scheme")]
		public async void LoginWithScheme(string schemeCode)
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeReader)
			{
				// Authentication not needed
				Response.Redirect("/");
				return;
			}

			List<WebCore.Authentication.IScheme> schemes = WebCore.Configurations.MainConfig.Instance.Authentication.Schemes;
			WebCore.Authentication.IScheme scheme = schemes?.FirstOrDefault();
			if ((scheme != null) && (schemes?.Count == 1))
			{
				schemeCode = scheme.Code;
			}
			else
			{
				scheme = schemes?.Where(x => x.Code == schemeCode).FirstOrDefault();
				if (scheme == null)
				{
					Response.Redirect("/" + ((schemes?.Count > 0) ? "login" : ""));
					return;
				}
				schemeCode = scheme.Code;
			}
			await HttpContext.ChallengeAsync(schemeCode, new AuthenticationProperties { RedirectUri = "/" });
		}

		[HttpGet("denied")]
		public ActionResult AccessDenied()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeReader)
				return Redirect("/"); // Authentication not needed

			PrepareViewBag();
			return View("~/Areas/Reader/Pages/AuthAccessDenied.cshtml");
		}

		[HttpGet("failed")]
		public ActionResult LoginFailed()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeReader)
				return Redirect("/"); // Authentication not needed

			PrepareViewBag();
			ViewBag.ShowLoginFailed = true;
			return View("~/Areas/Reader/Pages/AuthSelection.cshtml");
		}

		[HttpGet("logout")]
		public ActionResult Logout()
		{
			if (User.Identity.IsAuthenticated)
				HttpContext.SignOutAsync().Wait();

			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeReader)
				return Redirect("/"); // Authentication not needed

			PrepareViewBag();
			return View("~/Areas/Reader/Pages/AuthLoggedOut.cshtml");
		}


		[HttpGet("switch")]
		public ActionResult SwitchAccount()
		{
			if (User.Identity.IsAuthenticated)
				HttpContext.SignOutAsync().Wait();

			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeReader)
				return Redirect("/"); // Authentication not needed

			return Login();
		}



		private void PrepareViewBag()
		{
			ViewBag.baseHref = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/";
		}
	}
}
