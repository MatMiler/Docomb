using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Docomb.ContentStorage.Workspaces;

namespace Docomb.WebCore.Configurations
{
	public class WorkspacesConfig
	{
		/// <summary>Get the instance of the MainConfig</summary>
		public static WorkspacesConfig Instance { get { return _lazy.Value; } }
		private static readonly Lazy<WorkspacesConfig> _lazy = new(() => new WorkspacesConfig());

		private WorkspacesConfig()
		{
			JsonManager = new("workspaces.json");
			LoadConfig();
		}







		#region Load & save settings

		[System.Diagnostics.CodeAnalysis.SuppressMessage("Style", "IDE0044:Add readonly modifier", Justification = "<Pending>")]
		private EditableJson<List<Dtos.WorkspaceDto>> JsonManager = null;

		private static readonly object _loadLock = new();
		private void LoadConfig()
		{
			lock (_loadLock)
			{
				_workspaces = new();
				var dtos = JsonManager.Read()?.Where(x => x != null).ToList();
				if (dtos?.Count > 0)
				{
					string parentUrl = MainConfig.Instance?.RootUrl;
					foreach (Dtos.WorkspaceDto dto in dtos)
					{
						Workspace workspace = dto?.ToWorkspace();
						if (workspace == null) continue;
						workspace.ParentUrl = parentUrl;
						workspace.Initialize();
						if (!string.IsNullOrWhiteSpace(workspace.Git?.CredentialsKey))
						{
							Credentials.CredentialSet credentialsSet = MainConfig.Instance?.Credentials?.Get(workspace.Git.CredentialsKey);
							if (credentialsSet != null)
							{
								workspace.Git.Username = credentialsSet.Username;
								workspace.Git.Password = credentialsSet.Password;
							}
						}
						_workspaces.Add(workspace);
					}
				}

				// Reset auto-generated values
				_workspacesByUrl = null;
				_workspacesByUrlsPriority = null;
			}
		}
		private void SaveConfig()
		{
			List<Dtos.WorkspaceDto> list = _workspaces?.Select(x => Dtos.WorkspaceDto.FromWorkspace(x)).ToList();
			lock (_loadLock) { JsonManager.Write(list); }
		}

		public static void Reload() => Instance.LoadConfig();
		public static void Save() => Instance.SaveConfig();

		#endregion



		public static List<Workspace> Workspaces => Instance._workspaces;
		protected List<Workspace> _workspaces = null;


		/// <summary>Dictionary of workspaces, where key is the workspace's URL</summary>
		public static Dictionary<string, Workspace> WorkspacesByUrl { get => Instance._workspacesByUrl ??= Instance._workspaces?.ToDictionary(x => x.UrlPath); }
		private Dictionary<string, Workspace> _workspacesByUrl = null;

		/// <summary>List of workspace URLs, sorted descending by length</summary>
		public static List<(string url, Workspace workspace)> WorkspacesByUrlsPriority { get => Instance._workspacesByUrlsPriority ??= Instance._workspaces?.Select(x => (url: x.UrlPath, workspace: x)).OrderBy(x => -x.url.Length).ToList(); }
		private List<(string url, Workspace workspace)> _workspacesByUrlsPriority = null;



		public static (Workspace workspace, List<string> remainingPath) FindFromPath(string path) => FindFromPath(SplitPath(path, true));

		public static (Workspace workspace, List<string> remainingPath) FindFromPath(List<string> pathParts)
		{
			var list = WorkspacesByUrlsPriority;
			if ((list == null) || (list.Count <= 0)) return (null, new());

			// Re-join path for consistency in comparison
			string path = string.Join('/', pathParts) + "/";

			foreach (var (url, workspace) in list)
			{
				if ((path.StartsWith(url)) || (url == "/"))
				{
					if (pathParts.Count < workspace.UrlParts.Count) continue; // Something went wrong with comparison
					List<string> remainingParts = (pathParts.Count == workspace.UrlParts.Count) ? new() : pathParts.GetRange(workspace.UrlParts.Count, pathParts.Count - workspace.UrlParts.Count);
					return (workspace, remainingParts);
				}
			}

			return (null, new());
		}


	}
}
