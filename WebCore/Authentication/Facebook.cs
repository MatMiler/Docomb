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
	public class Facebook : IScheme
	{
		public string Code { get => _code; set => _code = value; }
		private string _code;

		public string Name => _name;
		private string _name;

		public string ButtonLogo => "facebook-color";

		public bool IsValid { get; private set; }

		private string _appId = null;
		private string _appSecret = null;


		public Facebook(IConfigurationSection configSource)
		{
			_code = configSource?.GetValue<string>("code")?.Trim();
			_name = configSource?.GetValue<string>("name")?.Trim();
			_appId = configSource?.GetValue<string>("appId");
			_appSecret = configSource?.GetValue<string>("appSecret");

			if (string.IsNullOrWhiteSpace(_code)) _code = "Facebook";
			if (string.IsNullOrWhiteSpace(_name)) _name = "Facebook";

			IsValid = (!string.IsNullOrWhiteSpace(_appId)) && (!string.IsNullOrWhiteSpace(_appSecret));
		}


		public void AddToBuilder(AuthenticationBuilder builder)
		{
			builder.AddFacebook(Code, option =>
			{
				option.AppId = _appId;
				option.AppSecret = _appSecret;
				option.ReturnUrlParameter = "ReturnUrl";
				option.AccessDeniedPath = "/_admin/account/failed";
			});
		}
	}
}
