using Docomb.WebCore.Authentication;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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


	}
}
