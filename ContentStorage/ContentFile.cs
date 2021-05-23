using static Docomb.CommonCore.Utils;
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


		public override ContentItemType Type => ContentItemType.File;


		public virtual FileType FileType { get; protected set; } = FileType.File;


		public ContentFile(string filePath, List<string> urlParts) : base(filePath, urlParts)
		{
			IdentifyFileType();
		}



		public string FileName => _fileName ??= GetFileNameFromPath(FilePath);
		protected string _fileName = null;




		#region File handlers

		public FileHandlers.Markdown Markdown { get; protected set; }
		public FileHandlers.Html Html { get; protected set; }

		#endregion



		protected void IdentifyFileType()
		{
			if (string.IsNullOrEmpty(FileName)) return;
			string fileNameLower = FileName?.ToLower();
			string extension = GetFileExtension(fileNameLower);

			if (FileHandlers.Markdown.Extensions.Contains(extension))
			{
				FileType = FileType.Markdown;
				Markdown = new(this);
				return;
			}
			else if (FileHandlers.Html.Extensions.Contains(extension))
			{
				FileType = FileType.Html;
				Html = new(this);
				return;
			}

		}

	}
}
