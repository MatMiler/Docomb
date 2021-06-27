using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Authentication
{
	public interface IScheme
	{

		/// <summary>Unique code of the scheme, used for internal references</summary>
		public string Code { get; set; }

		/// <summary>Name of the scheme, used on e.g. sign in buttons</summary>
		public string Name { get; }

		/// <summary>Icon code for the sign in button</summary>
		public string ButtonIcon { get; }

		/// <summary>Background color of the sign in button</summary>
		public Color? ButtonBgColor { get; }

		/// <summary>Text color of the sign in button</summary>
		public Color? ButtonFgColor { get; }

		public bool IsValid { get; }

		/// <summary></summary>
		/// <param name="builder"></param>
		public void AddToBuilder(Microsoft.AspNetCore.Authentication.AuthenticationBuilder builder);
	}
}
