using Docomb.ContentStorage.Workspaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public class UserInfo
	{
		public UserInfo(ClaimsPrincipal user)
		{
			_user = user;
		}

		[JsonIgnore]
		public ClaimsPrincipal User => _user;
		private ClaimsPrincipal _user = null;


		[JsonPropertyName("username")]
		public string Username { get => _username ??= GetUsername(); }
		private string _username = null;


		[JsonPropertyName("name")]
		public string Name { get => _name ??= GetName(); }
		private string _name = null;


		[JsonPropertyName("globalAccess")]
		public AccessLevel AccessLevel { get => _accessLevel ??= Access.GetAccessLevel(Username); }
		private AccessLevel? _accessLevel = null;


		public AccessLevel GetAccessLevel(Workspace workspace = null)
		{
			if (workspace == null) return AccessLevel;

			AccessLevel level;
			if (!_workspaceAccessLevels.TryGetValue(workspace.UrlPath, out level))
			{
				level = Access.GetAccessLevel(Username, workspace);
				_workspaceAccessLevels.Add(workspace.UrlPath, level);
			}
			return level;
		}
		private Dictionary<string, AccessLevel> _workspaceAccessLevels = new();



		public string GetUsername() => GetUsername(User);
		public static string GetUsername(ClaimsPrincipal user)
		{
			return user.FindFirst(ClaimTypes.Email)?.Value;
		}


		public string GetName() => GetName(User);
		public static string GetName(ClaimsPrincipal user)
		{
			return user.FindFirst(ClaimTypes.Name)?.Value;
		}





	}
}
