using Docomb.CommonCore;
using Docomb.WebCore.Authentication;
using Docomb.WebCore.Configurations;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using static Docomb.WebCore.Authentication.UserAccessStorage;

namespace Docomb.WebAdmin.Api
{
	[Route(WebCore.Configurations.UiConfig.UrlPathPrefix + "/api/users")]
	public class UsersController : Controller
	{
		[HttpGet("userInfo")]
		public UserInfo UserInfo()
		{
			return new UserInfo(User);
		}


		[HttpGet("globalUsers/list")]
		public DataWithStatus<Dictionary<string, AccessLevel>> ListGlobalUsers()
		{
			if (!User.Identity.IsAuthenticated) return new(new ActionStatus(ActionStatus.StatusCode.AuthorizationNeeded), null);
			if (new UserInfo(User).GetAccessLevel() < AccessLevel.Admin) return new(new ActionStatus(ActionStatus.StatusCode.AccessDenied), null);

			Dictionary<string, AccessLevel> list = UsersConfig.Instance?.GlobalUserAccess?.UserLevels;

			return new(new ActionStatus(ActionStatus.StatusCode.OK), list);
		}



		[HttpPost("globalUsers/update")]
		public DataWithStatus<Dictionary<string, AccessLevel>> UpdateGlobalUsers([FromBody] List<UserChangeItem> changes)
		{
			if (!User.Identity.IsAuthenticated) return new(new ActionStatus(ActionStatus.StatusCode.AuthorizationNeeded), null);
			if (new UserInfo(User).GetAccessLevel() < AccessLevel.Admin) return new(new ActionStatus(ActionStatus.StatusCode.AccessDenied), null);

			ActionStatus status = UsersConfig.Instance.UpdateUsersBulk(changes);

			Dictionary<string, AccessLevel> list = UsersConfig.Instance?.GlobalUserAccess?.UserLevels;

			return new(status, list);
		}



	}
}
