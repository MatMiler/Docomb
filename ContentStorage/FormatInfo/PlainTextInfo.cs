using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.FormatInfo
{
	public static class PlainTextInfo
	{

		public const string MediaType = "text/plain";

		//public ContentFile File { get; protected set; }

		//public PlainTextInfo(ContentFile file)
		//{
		//	File = file;
		//}


		public static readonly List<string> Extensions = new() { "txt", "json", "js" };







	}
}
