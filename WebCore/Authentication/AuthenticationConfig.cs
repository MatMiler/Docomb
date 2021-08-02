using static Docomb.CommonCore.Utils;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Builder;

namespace Docomb.WebCore.Authentication
{
	public sealed class AuthenticationConfig
	{

		internal AuthenticationConfig(IConfigurationSection configSource)
		{
			LoadConfiguration(configSource);
		}

		public void LoadConfiguration(IConfigurationSection configSource)
		{
			#region Schemes
			{
				List<IScheme> schemes = new();

				Dictionary<string, int> codeRepeats = new();

				IEnumerable<IConfigurationSection> children = configSource?.GetSection("schemes")?.GetChildren();
				if (children?.Count() > 0)
				{
					foreach (IConfigurationSection child in children)
					{
						string type = child?.GetValue<string>("type");
						IScheme scheme = type switch
						{
							"MicrosoftAccount" => new MicrosoftAccount(child),
							"Facebook" => new Facebook(child),
							_ => null
						};
						if (scheme?.IsValid == true)
						{
							if (codeRepeats.ContainsKey(scheme.Code))
								codeRepeats[scheme.Code]++;
							else
								codeRepeats.Add(scheme.Code, 1);
							schemes.Add(scheme);
						}
					}

					#region Fix non-unique codes
					{
						Dictionary<string, int> codeIndexes = codeRepeats.Where(x => x.Value > 1).ToDictionary(x => x.Key, (x) => 0, null);
						if (codeIndexes.Count > 0)
						{
							foreach (IScheme scheme in schemes)
							{
								if (codeIndexes.ContainsKey(scheme.Code)) { scheme.Code += "_" + (++codeIndexes[scheme.Code]); }
							}
						}
					}
					#endregion
				}

				Schemes = schemes;
			}
			#endregion

			AuthorizeAdmin = ParseBool(configSource?.GetValue<bool?>("authorizeAdmin"), Schemes?.Count > 0);
			AuthorizeReader = ParseBool(configSource?.GetValue<bool?>("authorizeReader"), false);

			FixedUserAccess = new UserAccessStorage(configSource?.GetSection("users"));
		}


		public bool AuthorizeAdmin { get; private set; }
		public bool AuthorizeReader { get; private set; }

		public List<IScheme> Schemes { get; private set; }

		/// <summary>User access list defined in config.json; Cannot be programmatically altered</summary>
		internal UserAccessStorage FixedUserAccess { get; private set; }



		private bool _authenticationsWereAdded = false;
		private bool _authenticationsWereUsed = false;

		public void AddAuthentications(IServiceCollection services, string loginUrl)
		{
			if (_authenticationsWereAdded) return;

			List<IScheme> schemes = Configurations.MainConfig.Instance.Authentication.Schemes;
			if (schemes?.Count > 0)
			{
				AuthenticationBuilder builder = services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme);
				builder.AddCookie(item => {
					item.LoginPath = new PathString(loginUrl);
					item.SlidingExpiration = true;
					item.ExpireTimeSpan = new TimeSpan(356, 0, 0, 0);
					});
				foreach (var scheme in schemes)
				{
					scheme.AddToBuilder(builder);
				}
			}

			_authenticationsWereAdded = true;
		}


		public void UseAuthentication(IApplicationBuilder app)
		{
			if (_authenticationsWereUsed) return;

			List<IScheme> schemes = Configurations.MainConfig.Instance.Authentication.Schemes;
			if (schemes?.Count > 0)
			{
				app.UseAuthentication();
				app.UseAuthorization();
			}

			_authenticationsWereUsed = true;
		}

	}
}
