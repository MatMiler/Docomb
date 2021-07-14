using Docomb.CommonCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public class UserAccessStorage
	{
		public UserAccessStorage() { }

		public UserAccessStorage(IConfigurationSection configSource)
		{
			LoadData(configSource);
		}

		public UserAccessStorage(UserAccessStorageDto dto)
		{
			LoadData(dto);
		}

		public void LoadData(IConfigurationSection configSource)
		{
			Dictionary<string, AccessLevel> usernames = new();
			Dictionary<AccessLevel, List<WildcardUserDefinition>> wildcards = new();

			AddUserLevels(configSource?.GetSection("none")?.GetChildren()?.Select(x => x.Value), usernames, wildcards, AccessLevel.None);
			AddUserLevels(configSource?.GetSection("reader")?.GetChildren()?.Select(x => x.Value), usernames, wildcards, AccessLevel.Reader);
			AddUserLevels(configSource?.GetSection("editor")?.GetChildren()?.Select(x => x.Value), usernames, wildcards, AccessLevel.Editor);
			AddUserLevels(configSource?.GetSection("admin")?.GetChildren()?.Select(x => x.Value), usernames, wildcards, AccessLevel.Admin);

			_userLevels = usernames;
			_wildcardLevels = wildcards;
		}

		public void LoadData(UserAccessStorageDto dto)
		{
			Dictionary<string, AccessLevel> usernames = new();
			Dictionary<AccessLevel, List<WildcardUserDefinition>> wildcards = new();

			AddUserLevels(dto?.None, usernames, wildcards, AccessLevel.None);
			AddUserLevels(dto?.Reader, usernames, wildcards, AccessLevel.Reader);
			AddUserLevels(dto?.Editor, usernames, wildcards, AccessLevel.Editor);
			AddUserLevels(dto?.Admin, usernames, wildcards, AccessLevel.Admin);

			_userLevels = usernames;
			_wildcardLevels = wildcards;
		}

		[System.Diagnostics.CodeAnalysis.SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "<Pending>")]
		private void AddUserLevels(IEnumerable<string> list, Dictionary<string, AccessLevel> usernames, Dictionary<AccessLevel, List<WildcardUserDefinition>> wildcards, AccessLevel level)
		{
			if (list?.Count() > 0)
			{
				foreach (string username in list)
				{
					if ((username.Contains("*")) || (username.Contains("?")))
					#region Wildcard
					{
						if (!wildcards.ContainsKey(level))
							wildcards.Add(level, new());
						else
							wildcards[level] ??= new();
						wildcards[level].Add(new(username));
					}
					#endregion
					else
					#region Username
					{
						if (usernames.ContainsKey(username))
						{
							if (!(usernames[username] >= level))
								usernames[username] = level;
						}
						else
						{
							usernames.Add(username, level);
						}
					}
					#endregion
				}
			}
		}

		public Dictionary<string, AccessLevel> UserLevels { get => _userLevels; }
		private Dictionary<string, AccessLevel> _userLevels = null;

		public Dictionary<AccessLevel, List<WildcardUserDefinition>> WildcardLevels { get => _wildcardLevels; }
		private Dictionary<AccessLevel, List<WildcardUserDefinition>> _wildcardLevels = null;



		public UserAccessStorageDto ToDto()
		{
			UserAccessStorageDto data = new();
			if (UserLevels == null) return data;
			data.None ??= new();
			data.Reader ??= new();
			data.Editor ??= new();
			data.Admin ??= new();

			Dictionary<string, AccessLevel> users = new(UserLevels);
			if (users?.Count > 0)
			{
				foreach (var user in users)
				{
					switch (user.Value)
					{
						case AccessLevel.None: { data.None.Add(user.Key); break; }
						case AccessLevel.Reader: { data.Reader.Add(user.Key); break; }
						case AccessLevel.Editor: { data.Editor.Add(user.Key); break; }
						case AccessLevel.Admin: { data.Admin.Add(user.Key); break; }
					}
				}
			}

			return data;
		}

		public class UserAccessStorageDto
		{
			[JsonPropertyName("none")]
			public List<string> None { get; set; } = new();

			[JsonPropertyName("reader")]
			public List<string> Reader { get; set; } = new();

			[JsonPropertyName("editor")]
			public List<string> Editor { get; set; } = new();

			[JsonPropertyName("admin")]
			public List<string> Admin { get; set; } = new();
		}



		private readonly object _updateLock = new();
		internal void UpdateUsersBulk(List<UserChangeItem> changes)
		{
			if ((changes == null) || (changes.Count <= 0)) return;
			lock (_updateLock)
			{
				_userLevels ??= new();
				foreach (UserChangeItem change in changes)
				{
					if (string.IsNullOrWhiteSpace(change?.Username)) continue;
					IEnumerable<string> users = _userLevels.Where(x => x.Key?.ToLower() == change?.Username?.ToLower()).Select(x => x.Key);
					switch (change.Change)
					{
						case UserChangeCommand.Add: case UserChangeCommand.Update:
							{
								if (users?.Count() > 0)
								{
									foreach (string user in users)
									{
										_userLevels[user] = change.AccessLevel;
									}
								}
								else
								{
									_userLevels.Add(change.Username, change.AccessLevel);
								}
								break;
							}
						case UserChangeCommand.Remove:
							{
								if (users?.Count() > 0)
								{
									foreach (string user in users)
									{
										_userLevels.Remove(user);
									}
								}
								break;
							}
					}
				}
			}
		}


		public class UserChangeItem
		{
			[JsonPropertyName("username")]
			public string Username { get; set; }

			[JsonPropertyName("accessLevel")]
			public AccessLevel AccessLevel { get; set; }

			[JsonPropertyName("change")]
			public UserChangeCommand Change { get; set; }
		}

		public enum UserChangeCommand
		{
			None,
			Add,
			Update,
			Remove
		}

	}
}
