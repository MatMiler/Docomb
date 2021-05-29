using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public abstract class ContentItem
	{
		public abstract ContentItemType Type { get; }

		public string FilePath { get; protected set; }

		//public string FullUrl { get; protected set; }
		public string Url { get; protected set; }

		public abstract bool NeedsTrailingSlash { get; }


		//public string LastUrlPart { get; protected set; }

		public List<string> UrlParts { get; protected set; }

		//public Item(string filePath, string url)
		//{
		//	FilePath = filePath;
		//	Url = url;
		//	UrlParts = SplitPath(url);
		//}
		public ContentItem(string filePath, List<string> urlParts)
		{
			FilePath = filePath;
			UrlParts = urlParts;
			Url = string.Join('/', urlParts);
		}

		public ContentFile AsFile => (this is ContentFile file) ? file : null;
		public ContentDirectory AsDirectory => (this is ContentDirectory directory) ? directory : null;

		//public ContentFolder Parent { get; protected set; }



	}
}
