using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	public abstract class Store
	{

		public abstract string Code { get; }

		public abstract string GetValue(string key);


	}
}
