using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{

		/// <summary>Split path (URL or file path) into segments</summary>
		/// <param name="path">Path to split</param>
		/// <param name="blockParentTraversal">Stop if path contains "..", "." or ":"</param>
		/// <returns>List of path segments</returns>
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


		/// <summary>Get the name of file or directory in a path (last segment)</summary>
		/// <param name="filePath"></param>
		/// <returns></returns>
		public static string GetFileNameFromPath(string filePath) => SplitPath(filePath)?.LastOrDefault();


		public static string GetFileExtension(string fileName)
		{
			if (string.IsNullOrEmpty(fileName)) return null;
			if ((fileName.Contains('\\')) || (fileName.Contains('/'))) fileName = GetFileNameFromPath(fileName) ?? "";
			int lastDot = fileName.LastIndexOf('.');
			if ((lastDot <= 0) || (lastDot >= fileName.Length - 1)) return null;
			return fileName.Substring(lastDot + 1);
		}

		public static string GetFileNameWithoutExtension(string fileName)
		{
			if (string.IsNullOrEmpty(fileName)) return null;
			if ((fileName.Contains('\\')) || (fileName.Contains('/'))) fileName = GetFileNameFromPath(fileName) ?? "";
			if (string.IsNullOrEmpty(fileName?.Trim('.'))) return null;
			int lastDot = fileName.LastIndexOf('.');
			if ((lastDot <= 0) || (lastDot >= fileName.Length - 1)) return fileName;
			return fileName.Substring(0, lastDot);
		}




		/// <summary>Simplifies file size into a shorter readable form (e.g. '12.3 MB')</summary>
		/// <param name="size">File size</param>
		/// <param name="formatProvider">Format provider to format number (decimal mark)</param>
		/// <returns></returns>
		public static string DescriptiveByteSize(ulong size, NumberFormatInfo formatInfo = null) => DescriptiveByteSize((double)size, formatInfo);
		/// <summary>Simplifies file size into a shorter readable form (e.g. '12.3 MB')</summary>
		/// <param name="size">File size</param>
		/// <param name="formatProvider">Format provider to format number (decimal mark)</param>
		/// <returns></returns>
		public static string DescriptiveByteSize(double size, NumberFormatInfo formatInfo = null)
		{
			return size switch
			{
				>= 107374182400D => Math.Round(size / 1073741824D, 0).ToString(formatInfo) + " GB",
				>= 10737418240D => Math.Round(size / 1073741824D, 1).ToString(formatInfo) + " GB",
				>= 1073741824D => Math.Round(size / 1073741824D, 2).ToString(formatInfo) + " GB",
				>= 104857600D => Math.Round(size / 1048576D, 0).ToString(formatInfo) + " MB",
				>= 10485760D => Math.Round(size / 1048576D, 1).ToString(formatInfo) + " MB",
				>= 1048576D => Math.Round(size / 1048576D, 2).ToString(formatInfo) + " MB",
				>= 102400D => Math.Round(size / 1024D, 0).ToString(formatInfo) + " KB",
				>= 10240D => Math.Round(size / 1024D, 1).ToString(formatInfo) + " KB",
				>= 1024D => Math.Round(size / 1024D, 2).ToString(formatInfo) + " KB",
				_ => Math.Ceiling(size).ToString(formatInfo) + " B"
			};
		}



	}
}
