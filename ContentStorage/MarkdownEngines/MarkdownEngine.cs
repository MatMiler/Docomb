using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.MarkdownEngines
{
	public abstract class MarkdownEngine
	{
		public abstract string Code { get; }
		public abstract string Name { get; }
		public abstract string Description { get; }
		public abstract string Version { get; }
		public abstract string WebsiteUrl { get; }

		public virtual bool IsActive => true;


		public abstract string RenderHtml(ContentFile file, string content = null);



		public static string RemoveFrontMatter(string content)
		{
			if (content.StartsWith("---"))
			{
				int firstNewline = content.IndexOfAny(new char[] { '\n', '\r' });
				if (firstNewline < 0) return content;
				int closingLineDashes = content.IndexOf("---", firstNewline);
				int closingLineDots = content.IndexOf("...", firstNewline);
				int closingLine = closingLineDashes;
				// Use first '...' position if found ans is before '---'
				if ((closingLineDots >= firstNewline) && (closingLineDots < closingLine)) closingLine = closingLineDots;
				if (closingLine < firstNewline) return content; // No valid closing line


				int firstClosingNewline = (closingLine >= firstNewline) ? content.IndexOfAny(new char[] { '\n', '\r' }, closingLine) : -1;
				if (firstClosingNewline >= firstNewline)
					return content.Substring(firstClosingNewline)?.TrimStart();
				else
					return "";
			}

			return content;
		}
	}
}
