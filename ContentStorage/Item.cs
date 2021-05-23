using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public abstract class Item
	{
		public abstract ContentItemType Type { get; }

		public string FilePath { get; protected set; }

		//public string FullUrl { get; protected set; }
		public string Url { get; protected set; }


		//public string LastUrlPart { get; protected set; }

		public List<string> UrlParts { get; protected set; }

		//public Item(string filePath, string url)
		//{
		//	FilePath = filePath;
		//	Url = url;
		//	UrlParts = SplitPath(url);
		//}
		public Item(string filePath, List<string> urlParts)
		{
			FilePath = filePath;
			UrlParts = urlParts;
			Url = string.Join('/', urlParts);
		}

		//public ContentFolder Parent { get; protected set; }



	}
}
