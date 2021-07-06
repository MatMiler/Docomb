using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public class WildcardUserDefinition
	{

		public WildcardUserDefinition(string sourcePattern)
		{
			SourcePattern = sourcePattern;
		}


		public string SourcePattern
		{
			get => _sourcePattern;
			set
			{
				_sourcePattern = value;
				_pattern = null;
			}
		}
		private string _sourcePattern = null;

		public Regex Pattern { get => _pattern ??= GetRegexPattern(SourcePattern); }
		private Regex _pattern = null;


		public static Regex GetRegexPattern(string source)
		{
			string pattern = string.Empty;
			string asIs = string.Empty;

			foreach (char c in source)
			{
				switch (c)
				{
					case '*':
						{
							if (asIs?.Length > 0) pattern += Regex.Escape(asIs);
							asIs = string.Empty;
							pattern += "(.+)";
							break;
						}
					case '?':
						{
							if (asIs?.Length > 0) pattern += Regex.Escape(asIs);
							asIs = string.Empty;
							pattern += "(.)";
							break;
						}
					default:
						{
							asIs += c;
							break;
						}
				}
			}
			if (asIs?.Length > 0) pattern += Regex.Escape(asIs);

			return new Regex(pattern);
		}


	}
}
