using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Configurations
{
	public static class UiConfig
	{

		public const string UrlPathPrefix = "_admin";

		public static bool HasAdmin { get; private set; } = false;
		public static void SetHasAdmin(bool value) => HasAdmin = value;

		public static bool HasReader { get; private set; } = false;
		public static void SetHasReader(bool value) => HasReader = value;

	}
}
