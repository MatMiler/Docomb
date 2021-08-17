using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{

		public static bool AddOrSet<TKey, TValue>(this Dictionary<TKey, TValue> dict, TKey key, TValue value)
		{
			if (dict == null) return false;

			if (dict.TryAdd(key, value))
			{ return true; }
			else
			{
				try
				{
					dict[key] = value;
					return true;
				}
				catch { return false; }
			}
		}

	}
}
