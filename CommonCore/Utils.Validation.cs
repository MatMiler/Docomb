using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{


		public static bool ValidateAny<T>(Func<T, bool> validation, params T[] list)
		{
			return list.Any(validation);
		}

		public static bool ValidateAll<T>(Func<T, bool> validation, params T[] list)
		{
			return list.All(validation);
		}




	}
}
