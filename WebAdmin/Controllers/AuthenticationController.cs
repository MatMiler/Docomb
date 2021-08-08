using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static Docomb.WebCore.Configurations.UiConfig;

namespace Docomb.WebAdmin.Controllers
{
	[Route(UrlPathPrefix + "/account")]
	public class AuthenticationController : Controller
	{

		[HttpGet("login")]
		public ActionResult Login()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + UrlPathPrefix); // Authentication not needed

			List<WebCore.Authentication.IScheme> schemes = WebCore.Configurations.MainConfig.Instance.Authentication.Schemes;
			WebCore.Authentication.IScheme scheme = schemes?.FirstOrDefault();
		
			if (scheme == null)
				return Redirect("/" + UrlPathPrefix); // No authentication scheme
			else if((scheme != null) && (schemes?.Count == 1))
				return Redirect($"/{UrlPathPrefix}/account/login/default"); // Only one authentication scheme, redirect to login with default (only) scheme

			PrepareViewBag();
			return View("~/Areas/Admin/Pages/AuthSelection.cshtml");
		}

		[HttpGet("login/default")]
		public async void LoginWithDefault()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
			{
				// Authentication not needed
				Response.Redirect("/" + UrlPathPrefix);
				return;
			}

			List<WebCore.Authentication.IScheme> schemes = WebCore.Configurations.MainConfig.Instance.Authentication.Schemes;
			WebCore.Authentication.IScheme scheme = schemes?.FirstOrDefault();

			if (scheme == null)
			{
				// No authentication scheme
				Response.Redirect("/" + UrlPathPrefix);
			}
			else
			{
				if (schemes.Count > 1)
				{
					// Multiple authentication schemes, redirect to selection
					Response.Redirect($"/{UrlPathPrefix}/account/login");
				}
				else
				{
					await HttpContext.ChallengeAsync(scheme.Code, new AuthenticationProperties
					{
						RedirectUri = "/" + UrlPathPrefix,
						AllowRefresh = true,
						IsPersistent = true,
						ExpiresUtc = new(DateTime.Now.AddYears(1))
					});
				}
			}
		}

		[HttpPost("login/scheme")]
		public async void LoginWithScheme(string schemeCode)
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
			{
				// Authentication not needed
				Response.Redirect("/" + UrlPathPrefix);
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
					Response.Redirect("/" + UrlPathPrefix + ((schemes?.Count > 0) ? "/login" : ""));
					return;
				}
				schemeCode = scheme.Code;
			}
			await HttpContext.ChallengeAsync(schemeCode, new AuthenticationProperties
			{
				RedirectUri = "/" + UrlPathPrefix,
				AllowRefresh = true,
				IsPersistent = true,
				ExpiresUtc = new(DateTime.Now.AddYears(1))
			});
		}

		[HttpGet("denied")]
		public ActionResult AccessDenied()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + UrlPathPrefix); // Authentication not needed

			PrepareViewBag();
			return View("~/Areas/Admin/Pages/AuthAccessDenied.cshtml");
		}

		[HttpGet("failed")]
		public ActionResult LoginFailed()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + UrlPathPrefix); // Authentication not needed

			PrepareViewBag();
			ViewBag.ShowLoginFailed = true;
			return View("~/Areas/Admin/Pages/AuthSelection.cshtml");
		}

		[HttpGet("logout")]
		public ActionResult Logout()
		{
			if (User.Identity.IsAuthenticated)
				HttpContext.SignOutAsync().Wait();

			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + UrlPathPrefix); // Authentication not needed

			PrepareViewBag();
			return View("~/Areas/Admin/Pages/AuthLoggedOut.cshtml");
		}


		[HttpGet("switch")]
		public ActionResult SwitchAccount()
		{
			if (User.Identity.IsAuthenticated)
				HttpContext.SignOutAsync().Wait();

			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + UrlPathPrefix); // Authentication not needed

			return Login();
		}



		private void PrepareViewBag()
		{
			ViewBag.baseHref = $"{Request.Scheme}://{Request.Host}{Request.PathBase}/{UrlPathPrefix}/";
			ViewBag.basePath = $"{Request.PathBase}/{UrlPathPrefix}/";
			ViewBag.readerBasePath = $"{Request.PathBase}/";
		}

	}
}
