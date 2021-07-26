using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Docomb.WebCore.Authentication;
using Microsoft.Extensions.Configuration;

namespace Docomb.WebCore.Configurations
{
	/// <summary>
	/// General configuration
	/// </summary>
	public sealed class MainConfig
	{

		/// <summary>Get the instance of the MainConfig</summary>
		public static MainConfig Instance { get { return _lazy.Value; } }
		private static readonly Lazy<MainConfig> _lazy = new(() => new MainConfig());

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
				RootUrl = jsonConfig?.GetValue<string>("url") ?? DefaultRootUrl;

				Authentication = new(jsonConfig?.GetSection("authentication"));
				Credentials = new(jsonConfig?.GetSection("credentials"));
			}
		}
		/// <summary>Reload data from configuration sources</summary>
		public static void Reload() => Instance.LoadConfig();

		#endregion





		#region General settings

		public const string DefaultSiteName = "Docs";
		public string SiteName { get; private set; } = DefaultSiteName;

		public const string DefaultRootUrl = "/";
		public string RootUrl { get; private set; } = DefaultRootUrl;

		#endregion





		#region Authentication, credentials

		public AuthenticationConfig Authentication { get; private set; }

		public Credentials.CredentialsLibrary Credentials { get; private set; }

		#endregion


	}
}
