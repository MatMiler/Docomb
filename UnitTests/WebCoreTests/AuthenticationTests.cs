using Docomb.WebCore.Authentication;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace UnitTests.WebCoreTests
{
	[TestFixture]
	class AuthenticationTests
	{



		[Test]
		[TestCase("a", "a")]
		[TestCase("a.b", "a\\.b")]
		[TestCase("a?b", "a(.)b")]
		[TestCase("a*b", "a(.+)b")]
		[TestCase("*a", "(.+)a")]
		[TestCase("a*", "a(.+)")]
		[TestCase("a*b*c", "a(.+)b(.+)c")]
		[TestCase("*@b.c", "(.+)@b\\.c")]
		public void WildcardUsernames(string source, string pattern)
		{
			Regex regex = WildcardUserDefinition.GetRegexPattern(source);

			Assert.AreEqual(pattern, regex.ToString());

		}




	}
}
