using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Authentication
{
	[Route(AdminConfig.UrlPathPrefix + "/account")]
	public class AuthenticationController : Controller
	{

		[HttpGet("login")]
		public ActionResult Login()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + AdminConfig.UrlPathPrefix); // Authentication not needed

			List<WebCore.Authentication.IScheme> schemes = WebCore.Configurations.MainConfig.Instance.Authentication.Schemes;
			WebCore.Authentication.IScheme scheme = schemes?.FirstOrDefault();
		
			if (scheme == null)
				return Redirect("/" + AdminConfig.UrlPathPrefix); // No authentication scheme
			else if((scheme != null) && (schemes?.Count == 1))
				return Redirect($"/{AdminConfig.UrlPathPrefix}/account/login/default"); // Only one authentication scheme, redirect to login with default (only) scheme
			return Content("Log in scheme selection");
		}

		[HttpGet("login/default")]
		public async void LoginWithDefault()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
			{
				// Authentication not needed
				Response.Redirect("/" + AdminConfig.UrlPathPrefix);
				return;
			}

			List<WebCore.Authentication.IScheme> schemes = WebCore.Configurations.MainConfig.Instance.Authentication.Schemes;
			WebCore.Authentication.IScheme scheme = schemes?.FirstOrDefault();

			if (scheme == null)
			{
				// No authentication scheme
				Response.Redirect("/" + AdminConfig.UrlPathPrefix);
			}
			else
			{
				if (schemes.Count > 1)
				{
					// Multiple authentication schemes, redirect to selection
					Response.Redirect($"/{AdminConfig.UrlPathPrefix}/account/login");
				}
				else
				{
					await HttpContext.ChallengeAsync(scheme.Code, new AuthenticationProperties { RedirectUri = "/" + AdminConfig.UrlPathPrefix });
				}
			}
		}

		[HttpPost("login/scheme")]
		public async void LoginWithScheme(string schemeCode)
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
			{
				// Authentication not needed
				Response.Redirect("/" + AdminConfig.UrlPathPrefix);
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
					Response.Redirect("/" + AdminConfig.UrlPathPrefix + ((schemes?.Count > 0) ? "/login" : ""));
					return;
				}
				schemeCode = scheme.Code;
			}
			await HttpContext.ChallengeAsync(schemeCode, new AuthenticationProperties { RedirectUri = "/" + AdminConfig.UrlPathPrefix });
		}

		[HttpGet("denied")]
		public ActionResult AccessDenied()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + AdminConfig.UrlPathPrefix); // Authentication not needed

			return Content("Access denied");
		}

		[HttpGet("failed")]
		public ActionResult LoginFailed()
		{
			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + AdminConfig.UrlPathPrefix); // Authentication not needed

			return Content("Log in failed");
		}

		[HttpGet("logout")]
		public ActionResult Logout()
		{
			if (User.Identity.IsAuthenticated)
				HttpContext.SignOutAsync().Wait();

			if (!WebCore.Configurations.MainConfig.Instance.Authentication.AuthorizeAdmin)
				return Redirect("/" + AdminConfig.UrlPathPrefix); // Authentication not needed

			return Content("Logged out");
		}

	}
}
