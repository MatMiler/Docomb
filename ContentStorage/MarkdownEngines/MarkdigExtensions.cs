using ColorCode;
using Markdig;
using Markdig.Parsers;
using Markdig.Renderers;
using Markdig.Renderers.Html;
using Markdig.Syntax;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.MarkdownEngines
{
	public static class MarkdigExtensions
	{
		public static MarkdownPipelineBuilder UseColorCodeSyntaxHighlighting(this MarkdownPipelineBuilder pipeline, IStyleSheet customCss = null)
		{
			pipeline.Extensions.Add(new SyntaxHighlightingExtension(customCss));
			return pipeline;
		}




		public class SyntaxHighlightingExtension : IMarkdownExtension
		{
			private readonly IStyleSheet _customCss;

			public SyntaxHighlightingExtension(IStyleSheet customCss = null)
			{
				_customCss = customCss;
			}

			public void Setup(MarkdownPipelineBuilder pipeline) { }

			public void Setup(MarkdownPipeline pipeline, IMarkdownRenderer renderer)
			{
				if (renderer == null)
				{
					throw new ArgumentNullException(nameof(renderer));
				}

				var htmlRenderer = renderer as TextRendererBase<HtmlRenderer>;
				if (htmlRenderer == null) return;

				var originalCodeBlockRenderer = htmlRenderer.ObjectRenderers.FindExact<CodeBlockRenderer>();
				if (originalCodeBlockRenderer != null)
				{
					htmlRenderer.ObjectRenderers.Remove(originalCodeBlockRenderer);
				}

				htmlRenderer.ObjectRenderers.AddIfNotAlready(
					new SyntaxHighlightingCodeBlockRenderer(originalCodeBlockRenderer, _customCss));
			}
		}



		public class SyntaxHighlightingCodeBlockRenderer : HtmlObjectRenderer<CodeBlock>
		{
			private readonly CodeBlockRenderer _underlyingRenderer;
			private readonly IStyleSheet _customCss;

			public SyntaxHighlightingCodeBlockRenderer(CodeBlockRenderer underlyingRenderer = null, IStyleSheet customCss = null)
			{
				_underlyingRenderer = underlyingRenderer ?? new CodeBlockRenderer();
				_customCss = customCss;
			}

			protected override void Write(HtmlRenderer renderer, CodeBlock obj)
			{
				var fencedCodeBlock = obj as FencedCodeBlock;
				var parser = obj.Parser as FencedCodeBlockParser;
				if (fencedCodeBlock == null || parser == null)
				{
					_underlyingRenderer.Write(renderer, obj);
					return;
				}

				var attributes = obj.TryGetAttributes() ?? new HtmlAttributes();

				var languageMoniker = fencedCodeBlock.Info.Replace(parser.InfoPrefix, string.Empty);
				string firstLine;
				var code = GetCode(obj, out firstLine);
				ILanguage language = (!string.IsNullOrEmpty(languageMoniker)) ? ParseLanguage(languageMoniker, firstLine) : null;
				if ((string.IsNullOrEmpty(languageMoniker)) || (language == null))
				{
					_underlyingRenderer.Write(renderer, obj);
					return;
				}

				attributes.AddClass($"lang-{languageMoniker}");
				attributes.Classes.Remove($"language-{languageMoniker}");

				attributes.AddClass("editor-colors");


				renderer
					.Write("<div")
					.WriteAttributes(attributes)
					.Write(">");

				var markup = ApplySyntaxHighlighting(language, firstLine, code);

				renderer.WriteLine(markup);
				renderer.WriteLine("</div>");
			}

			private string ApplySyntaxHighlighting(ILanguage language, string firstLine, string code)
			{
				//var languageTypeAdapter = new LanguageTypeAdapter();

				if (language == null) return code;

				var codeBuilder = new StringBuilder();
				var codeWriter = new StringWriter(codeBuilder);
				var styleSheet = _customCss ?? StyleSheets.Default;
				var colourizer = new CodeColorizer();
				colourizer.Colorize(code, language, HtmlClassFormatter, styleSheet, codeWriter);
				return codeBuilder.ToString();
			}

			private ILanguage ParseLanguage(string id, string firstLine = null)
			{
				if (id == null) return null;

				if (id == "csharp") return Languages.CSharp;
				if (id == "cplusplus") return Languages.Cpp;

				if (!string.IsNullOrWhiteSpace(firstLine))
				{
					foreach (var lang in Languages.All)
					{
						if (lang.FirstLinePattern == null) continue;
						if (new Regex(lang.FirstLinePattern, RegexOptions.IgnoreCase).IsMatch(firstLine))
							return lang;
					}
				}

				var byIdCanidate = Languages.FindById(id);

				return byIdCanidate;
			}


			private static string GetCode(LeafBlock obj, out string firstLine)
			{
				var code = new StringBuilder();
				firstLine = null;
				if (obj?.Lines.Lines?.Length > 0)
				{
					foreach (var line in obj.Lines.Lines)
					{
						var slice = line.Slice;
						if (slice.Text == null) continue;

						var lineText = slice.Text.Substring(slice.Start, slice.Length);

						if (firstLine == null)
							firstLine = lineText;
						else
							code.AppendLine();

						code.Append(lineText);
					}
				}
				return code.ToString();
			}
		}



		public static readonly IFormatter HtmlClassFormatter = new ColorCode.Formatting.HtmlClassFormatter();


	}
}
