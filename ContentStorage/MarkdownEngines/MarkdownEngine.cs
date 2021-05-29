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


		public abstract string RenderHtml(ContentFile file);

	}
}
