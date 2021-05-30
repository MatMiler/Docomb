using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.MarkdownEngines
{
	public class MarkdownSharpWrapper : MarkdownEngine
	{
		public override string Code => "MarkdownSharp";

		public override string Name => "MarkdownSharp";

		public override string Description => "Open source C# implementation of Markdown processor, as featured on Stack Overflow.";

		public override string Version => Engine?.Version;

		public override string WebsiteUrl => "https://github.com/StackExchange/MarkdownSharp/";




		public override string RenderHtml(ContentFile file)
		{
			return Engine?.Transform(RemoveFrontMatter(file.TextContent));
		}




		public MarkdownSharp.Markdown Engine => _engine = new();
		private MarkdownSharp.Markdown _engine = null;





	}
}
