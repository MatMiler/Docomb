using Docomb.CommonCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.WebReporters
{
	public class ReporterConfig
	{


		internal ReporterConfig(IConfigurationSection configSource)
		{
			LoadConfiguration(configSource);
		}

		public void LoadConfiguration(IConfigurationSection configSource)
		{
			LoadConsoleConfig(configSource?.GetSection("console"));
			LoadEmailConfig(configSource?.GetSection("email"));
		}





		#region Console

		private const string _consoleReporterCode = "console";
		private WebReporters.Console _consoleReporter = null;

		private void LoadConsoleConfig(IConfigurationSection configSource)
		{
			bool isEnabled = Utils.ParseBool(configSource?.GetValue<bool?>("enabled"), true);
			if (isEnabled)
			{
				_consoleReporter ??= new();
				_consoleReporter.IncludeDate = Utils.ParseBool(configSource?.GetValue<bool?>("showDate"), true);
				string dateFormat = Utils.ParseString(configSource?.GetValue<string>("dateFormat"));
				if (!string.IsNullOrWhiteSpace(dateFormat)) _consoleReporter.DateFormat = dateFormat;
				Reports.AddReporter(_consoleReporterCode, _consoleReporter);
			}
			else
			{
				Reports.RemoveReporter(_consoleReporterCode);
			}
		}

		#endregion




		#region Email

		private const string _emailReporterCode = "email";
		private WebReporters.Email _emailReporter = null;

		private void LoadEmailConfig(IConfigurationSection configSource)
		{
			bool isEnabled = Utils.ParseBool(configSource?.GetValue<bool?>("enabled"), false);
			if (isEnabled)
			{
				string recipients = Utils.ParseString(configSource?.GetValue<string>("recipients"));
				string host = CommonCore.Secrets.Manager.GetValue(configSource?.GetValue<string>("host"));
				int port = Utils.ParseInt(CommonCore.Secrets.Manager.GetValue(configSource?.GetValue<string>("port")));
				string username = CommonCore.Secrets.Manager.GetValue(configSource?.GetValue<string>("username"));
				string password = CommonCore.Secrets.Manager.GetValue(configSource?.GetValue<string>("password"));
				_emailReporter ??= new(recipients, host, port, username, password);
				Reports.AddReporter(_emailReporterCode, _emailReporter);
			}
			else
			{
				Reports.RemoveReporter(_emailReporterCode);
			}
		}


		#endregion


	}
}
