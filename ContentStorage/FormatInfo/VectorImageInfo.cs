using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.FormatInfo
{
	public static class VectorImageInfo
	{

		public static readonly List<string> Extensions = new() { "svg" };

		public static string GetMimeType(string ext)
		{
			return ext?.ToLower() switch
			{
				"svg" => "image/svg+xml",
				_ => "application/octet-stream"
			};
		}

	}
}
