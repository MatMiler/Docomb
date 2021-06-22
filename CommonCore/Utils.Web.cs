using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{

		public static string CombineUrlPaths(string a, string b)
		{
			return a?.TrimEnd('/') + '/' + b?.TrimStart('/');
		}



	}
}
