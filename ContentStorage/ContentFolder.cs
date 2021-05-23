using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class ContentFolder : Item
	{
		public override ItemType Type => ItemType.Folder;

		public ContentFolder(string filePath, string url) : base(filePath, url)
		{
		}

		public ContentFolder(string filePath, List<string> urlParts) : base(filePath, urlParts)
		{
		}


	}
}
