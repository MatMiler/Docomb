using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public class Google : IScheme
	{

		public string Code { get => _code; set => _code = value; }
		private string _code;

		public string Name => _name;
		private string _name;

		public string ButtonLogo => "google-color";

		public bool IsValid { get; private set; }

		private string _clientId = null;
		private string _clientSecret = null;


		public Google(IConfigurationSection configSource)
		{
			_code = configSource?.GetValue<string>("code")?.Trim();
			_name = configSource?.GetValue<string>("name")?.Trim();
			_clientId = CommonCore.Secrets.Manager.GetValue(configSource?.GetValue<string>("clientId"));
			_clientSecret = CommonCore.Secrets.Manager.GetValue(configSource?.GetValue<string>("clientSecret"));

			if (string.IsNullOrWhiteSpace(_code)) _code = "Google";
			if (string.IsNullOrWhiteSpace(_name)) _name = "Google";

			IsValid = (!string.IsNullOrWhiteSpace(_clientId)) && (!string.IsNullOrWhiteSpace(_clientSecret));
		}


		public void AddToBuilder(AuthenticationBuilder builder)
		{
			builder.AddGoogle(Code, option =>
			{
				option.ClientId = _clientId;
				option.ClientSecret = _clientSecret;
				option.SaveTokens = true;
				option.AccessDeniedPath = $"/{Configurations.UiConfig.UrlPathPrefix}/account/failed";
			});
		}


	}
}
