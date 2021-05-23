using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class Article : ContentFile
	{

		public Article(string filePath, List<string> urlParts) : base(filePath, urlParts)
		{
		}

	}
}
