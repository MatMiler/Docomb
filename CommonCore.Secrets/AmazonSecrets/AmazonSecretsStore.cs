using Amazon;
using Amazon.SecretsManager;
using Amazon.SecretsManager.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	/// <summary>
	/// Amazon Secrets Manager store.
	/// <para><example>
	/// Usage example:
	/// <list type="bullet"><c>"@store1:key"</c> if secret name is specified in the constructor</list>
	/// <list type="bullet"><c>"@store1:secret:key"</c></list>
	/// </example></para>
	/// </summary>
	internal class AmazonSecretsStore : IStore
	{
		/// <summary>Amazon Secrets Manager store.</summary>
		/// <param name="code">Store code</param>
		/// <param name="region">AWS region</param>
		/// <param name="secretName">Default secret name</param>
		public AmazonSecretsStore(string code, string region, string secretName = null) : this(code, RegionEndpoint.GetBySystemName(region), secretName)
		{
		}

		/// <summary>Amazon Secrets Manager store.</summary>
		/// <param name="code">Store code</param>
		/// <param name="region">AWS region</param>
		/// <param name="secretName">Default secret name</param>
		public AmazonSecretsStore(string code, RegionEndpoint region, string secretName = null)
		{
			_code = code;
			_region = region;
			_secretName = secretName;
 		}

		private string _code;
		private string _secretName;
		private RegionEndpoint _region = null;

		public string Code => _code;


		public string GetValue(string key)
		{
			string secretName = _secretName;
			string secretKey;

			string[] parts = key?.Split(new char[] { '/', ':', '\\' }, 2);
			if ((string.IsNullOrWhiteSpace(secretName)) || (parts.Length == 2))
			{
				if ((parts == null) || (parts.Length < 2)) return null;

				secretName = parts[0];
				secretKey = parts[1];
			}
			else
			{
				secretKey = key;
			}
			if (string.IsNullOrWhiteSpace(secretName)) return null;
			if (string.IsNullOrWhiteSpace(secretKey)) return null;


			IAmazonSecretsManager client = new AmazonSecretsManagerClient(_region);

			GetSecretValueRequest request = new();
			request.SecretId = secretName;
			request.VersionStage = "AWSCURRENT";

			GetSecretValueResponse response;
			try
			{
				response = client.GetSecretValueAsync(request).Result;
			}
			catch { throw; }

			if (response?.SecretString != null)
			{
				string json = response.SecretString;
				try
				{
					Dictionary<string, string> values = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, string>>(json);
					return values?.GetValueOrDefault(secretKey);
				}
				catch { throw; }
			}

			return null;
		}
	}
}
