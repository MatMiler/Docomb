using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.FormatInfo
{
	class BitmapImageInfo
	{

		public static readonly List<string> Extensions = new() { "jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "ico" };

		public static string GetMimeType(string ext)
		{
			return ext?.ToLower() switch
			{
				"jpg" => "image/jpeg",
				"jpeg" => "image/jpeg",
				"gif" => "image/gif",
				"bmp" => "image/bmp",
				"png" => "image/png",
				"tiff" => "image/tiff",
				"tif" => "image/tiff",
				"ico" => "image/x-icon",
				_ => "application/octet-stream"
			};
		}

	}
}
