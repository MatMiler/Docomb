using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Docomb.WebCore.Configurations
{
	/// <summary>
	/// General configuration
	/// </summary>
	public sealed class MainConfig
	{

		/*
		 * Contents TODO
		 * [-] Authentication method; TODO - For now rely on authentication being configured on site
		 * [-] Credentials; TODO - For now use only local files and don't work with external services
		 * [ ] Default workspace path
		 * [-] Config locations (workspaces, user permissions); TODO - For now use workspaces.json and users.json in application directory
		 */


		/// <summary>Get the instance of the MainConfig</summary>
		public static MainConfig Instance { get { return _lazy.Value; } }
		private static readonly Lazy<MainConfig> _lazy = new Lazy<MainConfig>(() => new MainConfig());

		private MainConfig()
		{
			LoadConfig();
		}




		#region Load settings

		private static readonly object _loadLock = new();
		/// <summary>Load data from .json files and environment</summary>
		private void LoadConfig()
		{
			lock (_loadLock)
			{
				IConfigurationRoot jsonConfig = new ConfigurationBuilder()
					.AddJsonFile("config.json", optional: true, reloadOnChange: false)
					.Build();

				SiteName = jsonConfig?.GetValue<string>("name");
				if (string.IsNullOrWhiteSpace(SiteName)) SiteName = DefaultSiteName;
			}
		}
		/// <summary>Reload data from configuration sources</summary>
		public static void Reload() => Instance.LoadConfig();

		#endregion





		#region General settings

		public const string DefaultSiteName = "Docs";
		public string SiteName { get; private set; } = DefaultSiteName;

		#endregion

	}
}
