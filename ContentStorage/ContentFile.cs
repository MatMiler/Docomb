using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Docomb.CommonCore;
using Docomb.ContentStorage.Workspaces;

namespace Docomb.ContentStorage
{
	public class ContentFile : ContentItem
	{

		public override ContentItemType Type => ContentItemType.File;

		public override bool NeedsTrailingSlash => _needsTrailingslash;

		[System.Diagnostics.CodeAnalysis.SuppressMessage("Style", "IDE0044:Add readonly modifier", Justification = "<Pending>")]
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
			catch { }
			_textContent = "";
			return _textContent;
		}


		public bool SaveTextFile(string content, ActionContext context)
		{
			try
			{
				StreamWriter fileStream = new(FilePath);
				fileStream.Write(content);
				fileStream.Flush();
				fileStream.Close();
				Workspace.Content.ClearCache();
				Workspace.Git?.UpdateFile(FilePath, context);
				return true;
			}
			catch { return false; }
		}


		public ActionStatus SaveBinaryFile(Stream stream, ActionContext context)
		{
			try
			{
				using (var fileStream = new FileStream(FilePath, FileMode.OpenOrCreate))
				{
					stream.CopyTo(fileStream);
					stream.Close();
				}
				Workspace.Git?.UpdateFile(FilePath, context);
				return new ActionStatus(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				return new ActionStatus(ActionStatus.StatusCode.Error, exception: e);
			}
		}


		public ActionStatus Rename(string newName, ActionContext context)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(newName)) return new(ActionStatus.StatusCode.InvalidRequestData, "File name cannot be empty.");
				if (Path.GetInvalidFileNameChars().Any(newName.Contains)) return new(ActionStatus.StatusCode.InvalidRequestData, $"New name '{newName}' contains invalid characters.");
				string newPath = Path.Combine(Path.GetDirectoryName(FilePath), newName);
				if (File.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"File '{newName}' already exists.");
				if (Directory.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"Folder '{newName}' already exists.");
				string oldPath = FilePath;
				if (Workspace.Git?.MoveFile(oldPath, newPath, context) != true)
					File.Move(FilePath, newPath);
				Workspace.Content.ClearCache();
				return new(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				return new(ActionStatus.StatusCode.Error, exception: e);
			}
		}

		public ActionStatus Move(string newParentPath, ActionContext context)
		{
			try
			{
				ContentDirectory parent = Workspace.Content.FindItem(newParentPath, MatchType.Physical)?.AsDirectory;
				if (parent == null) return new(ActionStatus.StatusCode.NotFound, $"Target path '{newParentPath}' doesn't exist.");
				string newPath = Path.Combine(parent.FilePath, FileName);
				if (newPath == FilePath) return new(ActionStatus.StatusCode.InvalidRequestData, $"The file is already in '{newParentPath}'");
				if (File.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"A file with the same name already exists in '{newParentPath}'.");
				if (Directory.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"A folder with the same name already exists in '{newParentPath}'.");
				string oldPath = FilePath;
				if (Workspace.Git?.MoveFile(oldPath, newPath, context) != true)
					File.Move(FilePath, newPath);
				Workspace.Content.ClearCache();
				return new(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				return new(ActionStatus.StatusCode.Error, exception: e);
			}
		}

		public ActionStatus Delete(ActionContext context)
		{
			try
			{
				File.Delete(FilePath);
				Workspace.Content.ClearCache();
				Workspace.Git?.RemoveFile(FilePath, context);
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
