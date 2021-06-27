using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public class UserAccessStorage
	{

		public UserAccessStorage(IConfigurationSection configSource)
		{
			Dictionary<string, AccessLevel> dict = new();

			AddUserLevels(configSource?.GetSection("reader"), dict, AccessLevel.Reader);
			AddUserLevels(configSource?.GetSection("editor"), dict, AccessLevel.Editor);
			AddUserLevels(configSource?.GetSection("admin"), dict, AccessLevel.Admin);

			_userLevels = dict;
		}

		private void AddUserLevels(IConfigurationSection usersSection, Dictionary<string, AccessLevel> dict, AccessLevel level)
		{
			List<string> list = usersSection?.GetChildren()?.Select(x => x.Value)?.ToList();

			if (list?.Count > 0)
			{
				foreach (string username in list)
				{
					if (dict.ContainsKey(username))
					{
						if (!(dict[username] >= level))
							dict[username] = level;
					}
					else
					{
						dict.Add(username, level);
					}
				}
			}

		}

		internal Dictionary<string, AccessLevel> UserLevels { get => _userLevels; }
		private Dictionary<string, AccessLevel> _userLevels = null;

	}
}
