using Docomb.ContentStorage;
using Docomb.WebCore.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebAdmin
{
	public class AdminContext
	{
		public AdminContext(ClaimsPrincipal user)
		{
			User = user;
		}

		public ClaimsPrincipal User { get; private set; }

		public UserInfo UserInfo { get => _userInfo ??= new(User); }
		private UserInfo _userInfo = null;

		public ActionContext StorageContext { get => _storageContext ??= GetActionContext(); }
		private ActionContext _storageContext = null;

		private ActionContext GetActionContext()
		{
			return new()
			{
				UserName = UserInfo.Username,
				UserEmail = UserInfo.Username
			};
		}

		public bool HasAccess(AccessLevel accessLevel) => Access.HasAccess(User, accessLevel);

	}
}
