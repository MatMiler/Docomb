using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Configurations
{
	public class WorkspacesConfig
	{
		/// <summary>Get the instance of the MainConfig</summary>
		public static WorkspacesConfig Instance { get { return _lazy.Value; } }
		private static readonly Lazy<WorkspacesConfig> _lazy = new Lazy<WorkspacesConfig>(() => new WorkspacesConfig());

		private WorkspacesConfig()
		{
			JsonManager = new("workspaces.json");
			LoadConfig();
		}







		#region Load & save settings

		private EditableJson<List<Workspace>> JsonManager = null;

		private static readonly object _loadLock = new();
		private void LoadConfig()
		{
			lock (_loadLock) { _workspaces = JsonManager.Read(); }
		}
		private void SaveConfig()
		{
			lock (_loadLock) { JsonManager.Write(_workspaces); }
		}

		public static void Reload() => Instance.LoadConfig();
		public static void Save() => Instance.SaveConfig();

		#endregion



		protected List<Workspace> _workspaces { get; set; }

		public List<Workspace> Workspaces => Instance._workspaces;



	}
}
