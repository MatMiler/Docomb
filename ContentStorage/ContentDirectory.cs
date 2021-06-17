using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class ContentDirectory : ContentItem
	{
		public override ContentItemType Type => ContentItemType.Directory;

		public override bool NeedsTrailingSlash => true;

		//public ContentFolder(string filePath, string url) : base(filePath, url)
		//{
		//}

		public ContentDirectory(Workspace workspace, string filePath, List<string> urlParts) : base(workspace, filePath, urlParts)
		{
		}


		public bool Rename(string newName)
		{
			try
			{
				string newPath = Path.Combine(Directory.GetParent(FilePath).FullName, newName);
				Directory.Move(FilePath, newPath);
				Workspace.Content.ClearCache();
				return true;
			}
			catch { }
			return false;
		}


	}
}
