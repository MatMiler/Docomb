using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{

		public static List<string> SplitPath(string path)
		{
			if (string.IsNullOrWhiteSpace(path)) return new();
			List<string> parts = new();
			string[] a = path.Split(new char[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);
			foreach (string part in a)
			{
				// Skip empty parts
				if (string.IsNullOrWhiteSpace(part)) continue;

				// End processing on obviously invalid entries
				if ((part == "..") || (part == ".") || (part.Contains(":"))) break;

				parts.Add(part);
			}
			return parts;
		}








	}
}
