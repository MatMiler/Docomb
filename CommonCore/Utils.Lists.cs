using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{


		public static List<TResult> MergeListContents<T1, T2, TResult>(IEnumerable<T1> list1, IEnumerable<T2> list2, Func<T1, T2, TResult> mergeFunction)
		{
			List<TResult> list = new();
			if (!(list1?.Count() > 0) || !(list2?.Count() > 0)) return list;

			foreach (T1 a in list1)
			{
				foreach (T2 b in list2)
				{
					list.Add(mergeFunction(a, b));
				}
			}

			return list;
		}


	}
}
