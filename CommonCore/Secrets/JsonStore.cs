using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Docomb.CommonCore.Secrets
{
	public class JsonStore : Store
	{

		public override string Code => "json";

		public override string GetValue(string key)
		{
			if (string.IsNullOrEmpty(key)) return null;
			string[] parts = key.Split("::", 2);
			if (parts.Length != 2) return null;
			IConfigurationRoot config = new ConfigurationBuilder().AddJsonFile(parts[0], optional: true, reloadOnChange: false).Build();
			return config?.GetValue<string>(parts[1]?.Replace('.', ':'));
		}

	}
}
