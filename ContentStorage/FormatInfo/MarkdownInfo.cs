using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using YamlDotNet.Core;
using YamlDotNet.Core.Events;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace Docomb.ContentStorage.FormatInfo
{
	public class MarkdownInfo
	{

		public ContentFile File { get; protected set; }

		public MarkdownInfo(ContentFile file)
		{
			File = file;
		}


		public static readonly List<string> Extensions = new() { "md", "markdown", "mdown", "mkdn", "mkd", "mdwn", "text" };






		#region Meta data

		public class MetaData
		{
			public string Title { get; set; }
		}

		private MetaData _meta = null;
		public MetaData Meta { get => _meta ??= ParseMetaData() ?? new MetaData(); }

		public MetaData ParseMetaData()
		{
			MetaData data = null;
			try
			{
				var yamlDeserializer = new DeserializerBuilder()
					.WithNamingConvention(CamelCaseNamingConvention.Instance)
					.Build();
				using (var input = new StringReader(File?.TextContent))
				{
					var parser = new YamlDotNet.Core.Parser(input);
					parser.Consume<StreamStart>();
					parser.Consume<DocumentStart>();
					data = yamlDeserializer.Deserialize<MetaData>(parser);
					parser.Consume<DocumentEnd>();
				}
			}
			catch { }
			return data;
		}

		public string Title { get => Meta?.Title ?? File?.FileName; }

		#endregion


	}
}
