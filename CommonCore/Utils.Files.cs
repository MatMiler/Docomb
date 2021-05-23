using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{

		public static List<string> SplitPath(string path, bool blockParentTraversal = false)
		{
			if (string.IsNullOrWhiteSpace(path)) return new();
			List<string> parts = new();
			string[] a = path.Split(new char[] { '/', '\\' }, StringSplitOptions.RemoveEmptyEntries);
			foreach (string part in a)
			{
				// Skip empty parts
				if (string.IsNullOrWhiteSpace(part)) continue;

				// End processing on obviously invalid entries
				if ((blockParentTraversal) && ((part == "..") || (part == ".") || (part.Contains(":")))) break;

				parts.Add(part);
			}
			return parts;
		}



		public static string GetFileNameFromPath(string filePath) => SplitPath(filePath)?.LastOrDefault();


		public static string GetFileExtension(string fileName)
		{
			if (string.IsNullOrEmpty(fileName)) return null;
			if ((fileName.Contains('\\')) || (fileName.Contains('/'))) fileName = GetFileNameFromPath(fileName) ?? "";
			int lastDot = fileName.LastIndexOf('.');
			if ((lastDot <= 0) || (lastDot >= fileName.Length - 1)) return null;
			return fileName.Substring(lastDot + 1);
		}





	}
}
