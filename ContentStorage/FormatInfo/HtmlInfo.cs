using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.FormatInfo
{
	public class HtmlInfo
	{

		public const string MediaType = "text/html";

		public ContentFile File { get; protected set; }

		public HtmlInfo(ContentFile file)
		{
			File = file;
		}

		public static readonly List<string> Extensions = new() { "html", "htm" };

	}
}
