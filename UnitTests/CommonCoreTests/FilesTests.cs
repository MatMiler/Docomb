using NUnit.Framework;
using System.Globalization;
using static Docomb.CommonCore.Utils;

namespace UnitTests.CommonCoreTests
{
	[TestFixture]
	class FilesTests
	{

		[Test]
		[TestCase("", null)]
		[TestCase("file.txt", "txt")]
		[TestCase(@"c:\directory\file.txt", "txt")]
		[TestCase("/directory/file.txt", "txt")]
		[TestCase(@"http://domain/file.txt", "txt")]
		[TestCase(@"c:\directory\.txt", "txt")]
		[TestCase("/directory/.txt", "txt")]
		[TestCase(@".file", "file")]
		public void TestGetFileExtension(string path, string extension)
		{
			Assert.AreEqual(extension, GetFileExtension(path));
		}

		[Test]
		[TestCase("", null)]
		[TestCase("file.txt", "file")]
		[TestCase(@"c:\directory\file.txt", "file")]
		[TestCase("/directory/file.txt", "file")]
		[TestCase(@"http://domain/file.txt", "file")]
		[TestCase(@"c:\directory\.txt", null)]
		[TestCase("/directory/.txt", null)]
		[TestCase("/directory/.", null)]
		[TestCase(@".file", null)]
		public void TestGetFileNameWithoutExtension(string path, string extension)
		{
			Assert.AreEqual(extension, GetFileNameWithoutExtension(path));
		}



	}
}
