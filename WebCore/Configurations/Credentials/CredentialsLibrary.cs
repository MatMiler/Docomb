using Docomb.CommonCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Configurations.Credentials
{
	public class CredentialsLibrary
	{
		internal CredentialsLibrary(IConfigurationSection configSource)
		{
			LoadConfiguration(configSource);
		}


		public void LoadConfiguration(IConfigurationSection configSource)
		{
			Dictionary<string, CredentialSet> sets = new();
			IEnumerable<IConfigurationSection> children = configSource?.GetChildren();
			if (children?.Count() > 0)
			{
				foreach (IConfigurationSection child in children)
				{
					string key = child?.GetValue<string>("key");
					string username = child?.GetValue<string>("username");
					string password = child?.GetValue<string>("password");
					if ((!string.IsNullOrWhiteSpace(key)) && (Utils.ValidateAny(x => !string.IsNullOrWhiteSpace(x), username, password)))
					{
						sets.Add(key, new() { Key = key, Username = username, Password = password });
					}
				}
			}
			_sets = sets;
		}


		private Dictionary<string, CredentialSet> _sets = null;

		public CredentialSet Get(string key) => _sets?.GetValueOrDefault(key);

	}
}
