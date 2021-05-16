using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Users
{
	public class User
	{

		public string Name { get; set; }
		public string Email { get; set; }
		
		public GlobalPermissions GlobalPermissions { get; set; }
		public WorkspacePermissions WorkspacePermissions { get; set; }

	}
}
