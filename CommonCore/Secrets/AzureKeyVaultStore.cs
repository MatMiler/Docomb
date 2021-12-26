using Azure.Security.KeyVault.Secrets;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	public class AzureKeyVaultStore : Store
	{
		public AzureKeyVaultStore(string code, string vaultUri, Azure.Core.TokenCredential credential) : this(code, new Uri(vaultUri), credential)
		{
		}

		public AzureKeyVaultStore(string code, Uri vaultUri, Azure.Core.TokenCredential credential)
		{
			_code = code;
			_vaultUri = vaultUri;
			_credential = credential;
			_client = new(_vaultUri, _credential);
		}

		private string _code;
		private Uri _vaultUri;
		private Azure.Core.TokenCredential _credential;

		private SecretClient _client;

		public override string Code => _code;

		public override string GetValue(string key) => GetValueAsync(key).Result;

		public async Task<string> GetValueAsync(string key)
		{
			try
			{
				Azure.Response<KeyVaultSecret> secret = await _client.GetSecretAsync(key);
				return secret.Value.Value;
			}
			catch (Exception e)
			{
				e.Report();
				return null;
			}
		}

	}
}
