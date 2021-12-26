using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebCore.Configurations.Credentials
{
	[Obsolete]
	public class CredentialSet
	{
		[JsonPropertyName("key")]
		public string Key { get; set; }



		[JsonPropertyName("username")]
		public string Username { get; set; }

		[JsonPropertyName("password")]
		public string Password { get; set; }
	}
}
