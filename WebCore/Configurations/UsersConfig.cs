using Docomb.CommonCore;
using Docomb.WebCore.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Docomb.WebCore.Authentication.UserAccessStorage;

namespace Docomb.WebCore.Configurations
{
	public class UsersConfig
	{

		/// <summary>Get the instance of the UsersConfig</summary>
		public static UsersConfig Instance { get { return _lazy.Value; } }
		private static readonly Lazy<UsersConfig> _lazy = new Lazy<UsersConfig>(() => new UsersConfig());

		private UsersConfig()
		{
			JsonManager = new("users.json");
			LoadConfig();
		}



		#region Load & save settings

		private EditableJson<UserAccessStorage.JsonStructure> JsonManager = null;

		private static readonly object _loadLock = new();
		private void LoadConfig()
		{
			lock (_loadLock)
			{
				_globalUserAccess = new(JsonManager?.Read());
			}
		}
		private void SaveConfig()
		{
			lock (_loadLock) { JsonManager.Write(_globalUserAccess?.ToJsonStructure()); }
		}

		public static void Reload() => Instance.LoadConfig();
		public static void Save() => Instance.SaveConfig();

		#endregion




		public UserAccessStorage GlobalUserAccess => _globalUserAccess;
		private UserAccessStorage _globalUserAccess = null;




		private readonly object _updateLock = new();
		public ActionStatus UpdateUsersBulk(List<UserChangeItem> changes)
		{
			if ((changes == null) || (changes.Count <= 0)) return new ActionStatus(ActionStatus.StatusCode.OK);
			try
			{
				lock (_updateLock)
				{
					_globalUserAccess.UpdateUsersBulk(changes);
					SaveConfig();
				}
				return new ActionStatus(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				return new ActionStatus(ActionStatus.StatusCode.Error, exception: e);
			}
		}

	}
}
