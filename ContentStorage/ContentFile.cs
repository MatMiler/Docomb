using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Docomb.CommonCore;

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

		public override bool NeedsTrailingSlash => _needsTrailingslash;
		private bool _needsTrailingslash = false;


		public virtual FileType FileType { get; protected set; } = FileType.File;


		public ContentFile(Workspace workspace, string filePath, List<string> urlParts, bool needsTrailingSlash) : base(workspace, filePath, urlParts)
		{
			_needsTrailingslash = needsTrailingSlash;
			IdentifyFileType();
		}





		public string FileName => _fileName ??= GetFileNameFromPath(FilePath);
		protected string _fileName = null;

		public override string Title { get => _title ??= GenerateTitle(); set => _title = value; }
		protected string GenerateTitle()
		{
			string s = Markdown?.Title;
			if (!string.IsNullOrEmpty(s)) return s;
			if ((!string.IsNullOrEmpty(FileName)) && (!Library.DefaultFileNames.Contains(FileName.ToLower())))
			{
				s = FileName;
				if (!string.IsNullOrEmpty(s)) return s;
			}
			return UrlParts?.LastOrDefault() ?? Workspace.Name;
		}



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
			else if (FormatInfo.PlainTextInfo.Extensions.Contains(extension))
			{
				FileType = FileType.PlainText;
				return;
			}

		}





		#region Read & write file

		public string TextContent => _textContent ?? ReadTextFile();
		private string _textContent = null;



		public bool TextContentWasLoaded => _textContentWasLoaded;
		private bool _textContentWasLoaded = false;
		public string ReadTextFile()
		{
			try
			{
				_textContent = File.ReadAllText(FilePath) ?? "";
				_textContentWasLoaded = true;
				return _textContent;
			}
			catch (Exception e) { }
			_textContent = "";
			return _textContent;
		}


		public bool SaveTextFile(string content)
		{
			try
			{
				StreamWriter fileStream = new StreamWriter(FilePath);
				fileStream.Write(content);
				fileStream.Flush();
				fileStream.Close();
				Workspace.Content.ClearCache();
				return true;
			}
			catch { return false; }
		}


		public ActionStatus Rename(string newName)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(newName)) return new(ActionStatus.StatusCode.InvalidRequestData, "File name cannot be empty.");
				if (Path.GetInvalidFileNameChars().Any(newName.Contains)) return new(ActionStatus.StatusCode.InvalidRequestData, $"New name '{newName}' contains invalid characters.");
				string newPath = Path.Combine(Path.GetDirectoryName(FilePath), newName);
				if (File.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"File '{newName}' already exists.");
				if (Directory.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"Folder '{newName}' already exists.");
				File.Move(FilePath, newPath);
				Workspace.Content.ClearCache();
				return new(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				return new(ActionStatus.StatusCode.Error, exception: e);
			}
		}

		#endregion

	}
}
