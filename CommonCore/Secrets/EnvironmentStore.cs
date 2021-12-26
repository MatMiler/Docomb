using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace Docomb.CommonCore.Secrets
{
	public class EnvironmentStore : Store
	{

		public override string Code => "env";

		public override string GetValue(string key) => Environment.GetEnvironmentVariable(key);

	}
}
