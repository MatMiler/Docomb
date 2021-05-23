using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class ContentFile : Item
	{

		//public string FilePath { get; protected set; }


		//public string FileName { get; protected set; }


		//public string FullUrl { get; protected set; }

		//public string FileUrlPart { get; protected set; }

		//public List<string> UrlParts { get; protected set; }

		//public ContentFolder Parent { get; protected set; }


		public override ItemType Type => ItemType.File;

		public ContentFile(string filePath, string url) : base(filePath, url)
		{
		}

		public ContentFile(string filePath, List<string> urlParts) : base(filePath, urlParts)
		{
		}

	}
}
