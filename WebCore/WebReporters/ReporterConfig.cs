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
		}





		#region Console

		private const string _consoleReporterCode = "console";
		private WebReporters.Console _consoleReporter = null;

		private void LoadConsoleConfig(IConfigurationSection configSource)
		{
			bool isEnabled = Utils.ParseBool(configSource?.GetSection("enabled"), true);
			if (isEnabled)
			{
				_consoleReporter ??= new();
				_consoleReporter.IncludeDate = Utils.ParseBool(configSource?.GetSection("showDate"), true);
				string dateFormat = Utils.ParseString(configSource?.GetSection("dateFormat"));
				if (!string.IsNullOrWhiteSpace(dateFormat)) _consoleReporter.DateFormat = dateFormat;
				Reports.AddReporter(_consoleReporterCode, _consoleReporter);
			}
			else
			{
				Reports.RemoveReporter(_consoleReporterCode);
			}
		}

		#endregion



	}
}
