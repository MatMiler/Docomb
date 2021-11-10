using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	public class ValueStore : Store
	{

		public override string Code => "value";

		public override string GetValue(string key) => key;

	}
}
