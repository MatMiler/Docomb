using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class ContentDirectory : Item
	{
		public override ContentItemType Type => ContentItemType.Directory;

		//public ContentFolder(string filePath, string url) : base(filePath, url)
		//{
		//}

		public ContentDirectory(string filePath, List<string> urlParts) : base(filePath, urlParts)
		{
		}


	}
}
