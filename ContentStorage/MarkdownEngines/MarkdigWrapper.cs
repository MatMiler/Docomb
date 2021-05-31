using Markdig;
using Markdig.Parsers;
using Markdig.Renderers;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.MarkdownEngines
{
	public class MarkdigWrapper : MarkdownEngine
	{
		public override string Code => "Markdig";

		public override string Name => "Markdig";

		public override string Description => "Markdig is a fast, powerful, CommonMark compliant, extensible Markdown processor for .NET.";

		public override string Version => Markdig.Markdown.Version;

		public override string WebsiteUrl => "https://github.com/StackExchange/MarkdownSharp/";




		public override string RenderHtml(ContentFile file)
		{
			string source = file?.TextContent;
			if (string.IsNullOrWhiteSpace(source)) return "";
			var writer = new StringWriter();
			var renderer = new HtmlRenderer(writer);
			//renderer.BaseUrl = new Uri(AbsoluteUrl);
			RenderPipeline.Setup(renderer);

			var document = MarkdownParser.Parse(source, RenderPipeline);
			renderer.Render(document);
			writer.Flush();

			return writer.ToString();
		}


		#region Markdown pipeline

		private MarkdownPipeline _renderPipeline = null;
		public MarkdownPipeline RenderPipeline { get => _renderPipeline ??= DefaultRenderPipeline; set => _renderPipeline = value; }


		private static MarkdownPipeline _defaultRenderPipeline = null;
		public static MarkdownPipeline DefaultRenderPipeline { get => _defaultRenderPipeline ??= CreateDefaultRenderPipeline(); }

		public static MarkdownPipeline CreateDefaultRenderPipeline()
		{
			//MarkdownPipelineBuilder builder = new MarkdownPipelineBuilder()
			//	.UseYamlFrontMatter()
			//	.UseAutoIdentifiers()
			//	.UseGridTables()
			//	.UsePipeTables()
			//	.UseFootnotes()
			//	.UseGenericAttributes();
			//return builder.Build();
			return new MarkdownPipelineBuilder()
				.UseAdvancedExtensions()
				.UseYamlFrontMatter()
				.UseColorCodeSyntaxHighlighting()
				.UseGenericAttributes()
				.Build();
		}

		#endregion


	}
}
