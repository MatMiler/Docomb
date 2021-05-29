using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;

namespace Docomb.ContentStorage
{
	public class ContentFile : ContentItem
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




		#region Format info

		public FormatInfo.MarkdownInfo Markdown { get; protected set; }
		public FormatInfo.HtmlInfo Html { get; protected set; }

		#endregion



		protected void IdentifyFileType()
		{
			if (string.IsNullOrEmpty(FileName)) return;
			string fileNameLower = FileName?.ToLower();
			string extension = GetFileExtension(fileNameLower);

			if (FormatInfo.MarkdownInfo.Extensions.Contains(extension))
			{
				FileType = FileType.Markdown;
				Markdown = new(this);
				return;
			}
			else if (FormatInfo.HtmlInfo.Extensions.Contains(extension))
			{
				FileType = FileType.Html;
				Html = new(this);
				return;
			}

		}





		#region Read & write file

		public string TextContent => _textContent ??= ReadTextFile(FilePath) ?? "";
		private string _textContent = null;




		public static string ReadTextFile(string filePath)
		{
			try
			{
				string content = File.ReadAllText(filePath);
				return content;
			}
			catch (Exception e) { }
			return null;
		}


		public static bool SaveTextFile(string filePath, string content)
		{
			try
			{
				StreamWriter fileStream = new StreamWriter(filePath);
				fileStream.Write(content);
				fileStream.Flush();
				fileStream.Close();
				return true;
			}
			catch { return false; }
		}

		#endregion

	}
}
