﻿using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class Workspace
	{

		/// <summary>Name of the workspace</summary>
		[JsonPropertyName("name")]
		public string Name { get; set; }


		/// <summary>Description of the workspace</summary>
		[JsonPropertyName("desc")]
		public string Description { get; set; }


		/// <summary></summary>
		[JsonPropertyName("urlPath")]
		public string UrlPath
		{
			get => _urlPath;
			set
			{
				// Split and re-join path parts for consistency
				UrlParts = SplitPath(value, true);
				_urlPath = string.Join('/', UrlParts) + "/";
			}
		}
		private string _urlPath = null;

		[JsonIgnore]
		public string ParentUrl { get => _parentUrl; set { _parentUrl = value; _fullUrl = null; } }
		[JsonIgnore]
		private string _parentUrl = null;

		[JsonIgnore]
		public string FullUrl => _fullUrl ??= ParentUrl?.TrimEnd('/') + '/' + UrlPath?.TrimStart('/');
		[JsonIgnore]
		private string _fullUrl = null;

		[JsonIgnore]
		public List<string> UrlParts { get; protected set; }


		/// <summary>Path of the directory where the content is stored (.md files, images, etc.)</summary>
		[JsonPropertyName("storagePath")]
		public string ContentStoragePath { get; set; }


		/// <summary>Which engine should be used to display Markdown files</summary>
		[JsonPropertyName("markdownEngine")]
		public string MarkdownEngineCode { get; set; }


		//[JsonPropertyName("preloadStructure")]
		//private bool? _preloadStructure { get; set; }
		///// <summary>Whether to load file structure into memory</summary>
		//public bool PreloadStructure { get => _preloadStructure ?? DefaultPreloadStructure; set => _preloadStructure = value; }
		//public const bool DefaultPreloadStructure = false;


		///// <summary>Whether URL matching should be case sensitive</summary>
		//[JsonPropertyName("caseSensitiveUrl")]
		//public bool IsUrlCaseSensitive { get; set; } = false;

		[JsonIgnore]
		public Library Content { get => _content ??= new Library(this, ContentStoragePath, UrlPath); }
		[JsonIgnore]
		private Library _content = null;





	}
}
