using Docomb.CommonCore;
using Docomb.WebCore.Authentication;
using Docomb.WebCore.Configurations;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Api
{
	[Route(AdminConfig.UrlPathPrefix + "/api/users")]
	public class UsersController : Controller
	{


		[HttpGet("globalUsers")]
		public DataWithStatus<Dictionary<string, AccessLevel>> Index()
		{
			if (!User.Identity.IsAuthenticated) return new(new ActionStatus(ActionStatus.StatusCode.AuthorizationNeeded), null);
			if (new UserInfo(User).GetAccessLevel() < AccessLevel.Admin) return new(new ActionStatus(ActionStatus.StatusCode.AccessDenied), null);

			Dictionary<string, AccessLevel> list = UsersConfig.Instance?.GlobalUserAccess?.UserLevels;

			return new(new ActionStatus(ActionStatus.StatusCode.OK), list);
		}





	}
}
