using Docomb.ContentStorage.Workspaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader
{
	public class SiteEnvironment
	{
		public string SiteName { get; set; }
		public string RootUrl { get; set; }
		public List<Workspace> Workspaces { get; set; }

		public SiteEnvironment()
		{
			SiteName = WebCore.Configurations.MainConfig.Instance.SiteName;
			RootUrl = WebCore.Configurations.MainConfig.Instance.RootUrl;
			Workspaces = WebCore.Configurations.WorkspacesConfig.Workspaces;
		}


		public static SiteEnvironment Instance { get { return _lazy.Value; } }
		private static readonly Lazy<SiteEnvironment> _lazy = new Lazy<SiteEnvironment>(() => new SiteEnvironment());

	}
}
