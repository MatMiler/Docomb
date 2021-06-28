using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public class MicrosoftAccount : IScheme
	{
		public string Code { get => _code; set => _code = value; }
		private string _code;

		public string Name => _name;
		private string _name;

		public string ButtonLogo => "microsoft-color";

		public bool IsValid { get; private set; }

		private string _clientId = null;
		private string _clientSecret = null;


		public MicrosoftAccount(IConfigurationSection configSource)
		{
			_code = configSource?.GetValue<string>("code")?.Trim();
			_name = configSource?.GetValue<string>("name")?.Trim();
			_clientId = configSource?.GetValue<string>("clientId");
			_clientSecret = configSource?.GetValue<string>("clientSecret");

			if (string.IsNullOrWhiteSpace(_code)) _code = "MicrosoftAccount";
			if (string.IsNullOrWhiteSpace(_name)) _name = "Microsoft Account";

			IsValid = (!string.IsNullOrWhiteSpace(_clientId)) && (!string.IsNullOrWhiteSpace(_clientSecret));
		}


		public void AddToBuilder(AuthenticationBuilder builder)
		{
			builder.AddMicrosoftAccount(Code, option =>
			{
				option.ClientId = _clientId;
				option.ClientSecret = _clientSecret;
				option.SaveTokens = true;
			});
		}
	}
}
