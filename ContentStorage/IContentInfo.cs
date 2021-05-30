using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public interface IContentInfo
	{
		public ContentItemType Type { get; }

		public string FilePath { get; }

		public string Url { get; }

		public bool NeedsTrailingSlash { get; }

		public List<string> UrlParts { get; }

		public Workspace Workspace { get; }

	}
}
