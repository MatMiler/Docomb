using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using NUnit.Framework;

namespace UnitTests.CommonCoreTests
{
	[TestFixture]
	class SecretsTests
	{

		[Test]
		[TestCase("Lorem ipsum", "Lorem ipsum")]
		[TestCase("@value:Lorem ipsum", "Lorem ipsum")]
		[TestCase("@Value:Lorem ipsum", "Lorem ipsum")]
		public void TestStore(string input, string expectedOutput)
		{
			string output = Docomb.CommonCore.Secrets.Manager.GetValue(input);
			Assert.AreEqual(expectedOutput, output);
		}




	}
}
