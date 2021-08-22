using Docomb.CommonCore;
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
				using TextReader reader = (File?.TextContentWasLoaded == true) ? new StringReader(File?.TextContent) : new StreamReader(File?.FilePath);
				string line = reader.ReadLine();
				var parser = new YamlDotNet.Core.Parser(reader);
				parser.Consume<StreamStart>();
				parser.Consume<DocumentStart>();
				data = FrontMatterDeserializer.Deserialize<MetaData>(parser);
				parser.Consume<DocumentEnd>();
			}
			catch { }
			//catch (Exception e) { Reports.Report(new ActionStatus(ActionStatus.StatusCode.DataNotSupported, message: e.Message, exception: e)); }
			return data;
		}

		protected static IDeserializer FrontMatterDeserializer => _frontMatterDeserializer ??= new DeserializerBuilder().WithNamingConvention(CamelCaseNamingConvention.Instance).Build();
		private static IDeserializer _frontMatterDeserializer = null;

		public string Title { get => Meta?.Title; }

		#endregion


	}
}
