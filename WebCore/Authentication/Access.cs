using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public static class Access
	{

		public static bool HasAccess(ClaimsPrincipal user, AccessLevel level, Workspace workspace = null)
		{
			string username = UserInfo.GetUsername(user);

			return HasAccess(username, level, workspace);
		}

		public static bool HasAccess(string username, AccessLevel level, Workspace workspace = null)
		{
			#region No authorization needed
			{
				if (level == AccessLevel.None)
					return true; // No authorization was requested
				else if ((level == AccessLevel.Reader) && (Configurations.MainConfig.Instance?.Authentication?.AuthorizeReader == false))
					return true; // Reader doesn't require authorization
				else if (((level == AccessLevel.Editor) || (level == AccessLevel.Admin)) && (Configurations.MainConfig.Instance?.Authentication?.AuthorizeAdmin == false))
					return true; // Admin doesn't require authorization
			}
			#endregion

			// No user
			if (string.IsNullOrWhiteSpace(username)) return false;

			#region Username match
			{
				// Fixed user access (can't be altered)
				AccessLevel foundLevel = AccessLevel.None;
				if ((Configurations.MainConfig.Instance?.Authentication?.FixedUserAccess?.UserLevels?.TryGetValue(username, out foundLevel) == true) && (foundLevel >= level))
					return true;

				// Global user access
				if ((Configurations.UsersConfig.Instance?.GlobalUserAccess?.UserLevels?.TryGetValue(username, out foundLevel) == true) && (foundLevel >= level))
					return true;
			}
			#endregion

			#region Wildcards
			if (Configurations.UsersConfig.Instance?.GlobalUserAccess?.WildcardLevels?.Count > 0)
			{
				foreach (KeyValuePair<AccessLevel, List<WildcardUserDefinition>> group in Configurations.UsersConfig.Instance.GlobalUserAccess.WildcardLevels)
				{
					if (group.Key < level) continue;
					foreach (WildcardUserDefinition definition in group.Value)
					{
						if (definition?.Pattern?.IsMatch(username) == true)
							return true;
					}
				}
			}
			#endregion

			return false;
		}


		public static AccessLevel GetAccessLevel(string username, Workspace workspace = null)
		{
			AccessLevel level = AccessLevel.None;
			if (string.IsNullOrWhiteSpace(username)) return level;


			#region Username match
			{
				bool hasFound = false;

				// Fixed user access (can't be altered)
				AccessLevel foundLevel = AccessLevel.None;
				if ((Configurations.MainConfig.Instance?.Authentication?.FixedUserAccess?.UserLevels?.TryGetValue(username, out foundLevel) == true) && (foundLevel > level))
				{
					level = foundLevel;
					hasFound = true;
				}

				// Global user access
				if ((Configurations.UsersConfig.Instance?.GlobalUserAccess?.UserLevels?.TryGetValue(username, out foundLevel) == true) && (foundLevel > level))
				{
					level = foundLevel;
					hasFound = true;
				}

				// Exact username match takes priority over wildcard
				if (hasFound) return level;
			}
			#endregion

			#region Wildcards
			if (Configurations.UsersConfig.Instance?.GlobalUserAccess?.WildcardLevels?.Count > 0)
			{
				foreach (KeyValuePair<AccessLevel, List<WildcardUserDefinition>> group in Configurations.UsersConfig.Instance.GlobalUserAccess.WildcardLevels)
				{
					if (group.Key <= level) continue;
					foreach (WildcardUserDefinition definition in group.Value)
					{
						if (definition?.Pattern?.IsMatch(username) == true)
						{
							level = group.Key;
						}
					}
				}
			}
			#endregion


			return level;
		}



	}
}
