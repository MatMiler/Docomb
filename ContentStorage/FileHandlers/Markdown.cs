using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.FileHandlers
{
	public class Markdown
	{

		public ContentFile File { get; protected set; }

		public Markdown(ContentFile file)
		{
			File = file;
		}


		public static readonly List<string> Extensions = new() { "md", "markdown", "mdown", "mkdn", "mkd", "mdwn", "text" };


	}
}
