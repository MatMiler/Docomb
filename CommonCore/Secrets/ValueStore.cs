using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	public class ValueStore : IStore
	{

		public string Code => "value";

		public string GetValue(string key) => key;

	}
}
