using static Docomb.CommonCore.Utils;
using Docomb.ContentStorage;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using static Docomb.WebAdmin.Api.ContentManager.Info;
using Docomb.ContentStorage.Workspaces;

namespace Docomb.WebAdmin.Api.ContentManager
{
	public class FileDetails
	{

		[JsonPropertyName("title")]
		public string Title { get; protected set; }

		[JsonPropertyName("fileName")]
		public string FileName { get; protected set; }

		[JsonIgnore]
		public string FilePath { get; protected set; }

		[JsonPropertyName("url")]
		public string Url { get; protected set; }

		[JsonPropertyName("reactLocalUrl")]
		public string ReactLocalUrl => CombineUrlPaths("", CombineUrlPaths(Workspace.ReactLocalUrl, Url));


		[JsonPropertyName("type")]
		public FileType FileType { get; protected set; }

		[JsonPropertyName("workspace")]
		public WorkspaceSummary Workspace { get; protected set; }


		[JsonPropertyName("fileSize")]
		public long? FileSize { get; protected set; }

		[JsonPropertyName("fileSizeDesc")]
		public string FileSizeDesc { get; protected set; }

		[JsonPropertyName("lastModifiedDate")]
		public DateTime? LastModifiedDate { get; protected set; }


		[JsonPropertyName("contentText")]
		public string ContentText { get; protected set; }

		[JsonPropertyName("contentHtml")]
		public string ContentHtml { get; protected set; }





		public static FileDetails Get(string url)
		{
			(Workspace workspace, List<string> remainingPath) = WebCore.Configurations.WorkspacesConfig.FindFromPath(url);
			if ((workspace == null) || (remainingPath == null)) return null;
			ContentItem item = workspace.Content.FindItem(remainingPath, ContentStorage.MatchType.Physical);

			return new(item.AsFile);
		}

		public FileDetails()
		{
		}

		public FileDetails(ContentFile contentFile)
		{
			Load(contentFile);
		}

		public void Load(ContentFile contentFile)
		{
			if (contentFile == null) return;
			#region Basic information
			{
				Title = contentFile.Title;
				FileName = contentFile.FileName;
				FilePath = contentFile.FilePath;
				Url = contentFile.Url;
				FileType = contentFile.FileType;
				Workspace = (contentFile.Workspace != null) ? new(contentFile.Workspace) : null;
			}
			#endregion

			#region Physical file metadata
			try
			{
				FileInfo fileInfo = new(FilePath);
				FileSize = fileInfo.Length;
				FileSizeDesc = DescriptiveByteSize(fileInfo.Length);
				LastModifiedDate = fileInfo.LastWriteTimeUtc;
			}
			catch { }
			#endregion

			#region Content
			{
				switch (FileType)
				{
					case FileType.Markdown:
						{
							ContentText = contentFile.TextContent;
							var markdownEngine = ContentStorage.MarkdownEngines.Manager.GetEngine(contentFile.Workspace);
							ContentHtml = markdownEngine.RenderHtml(contentFile);
							break;
						}
					case FileType.Html: { ContentHtml = ContentText = contentFile.TextContent; break; }
					case FileType.PlainText: { ContentText = contentFile.TextContent; break; }
				}
			}
			#endregion
		}


	}
}
