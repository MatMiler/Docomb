﻿using static Docomb.CommonCore.Utils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public abstract class ContentItem : IContentInfo
	{
		public abstract ContentItemType Type { get; }

		public string FilePath { get; protected set; }

		//public string FullUrl { get; protected set; }
		public string Url { get; protected set; }

		public abstract bool NeedsTrailingSlash { get; }

		public virtual string Title { get => _title ??= UrlParts?.LastOrDefault(); set => _title = value; }
		protected string _title = null;


		public Workspace Workspace { get; protected set; }


		//public string LastUrlPart { get; protected set; }

		public List<string> UrlParts { get; protected set; }

		//public Item(string filePath, string url)
		//{
		//	FilePath = filePath;
		//	Url = url;
		//	UrlParts = SplitPath(url);
		//}
		public ContentItem(Workspace workspace, string filePath, List<string> urlParts)
		{
			Workspace = workspace;
			FilePath = filePath;
			UrlParts = urlParts;
			Url = string.Join('/', urlParts) + (NeedsTrailingSlash ? '/' : null);
		}

		public ContentFile AsFile => (this is ContentFile file) ? file : null;
		public ContentDirectory AsDirectory => (this is ContentDirectory directory) ? directory : null;

		//public ContentFolder Parent { get; protected set; }



	}
}