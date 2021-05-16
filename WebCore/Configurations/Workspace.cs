using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebCore.Configurations
{
	public class Workspace
	{

		/// <summary>Name of the workspace</summary>
		[JsonPropertyName("name")]
		public string Name { get; set; }

		/// <summary>Description of the workspace</summary>
		[JsonPropertyName("desc")]
		public string Description { get; set; }

		/// <summary></summary>
		[JsonPropertyName("urlPath")]
		public string UrlPath { get; set; }

		/// <summary>Path of the directory where the content is stored (.md files, images, etc.)</summary>
		[JsonPropertyName("storagePath")]
		public string ContentStoragePath { get; set; }







	}
}
