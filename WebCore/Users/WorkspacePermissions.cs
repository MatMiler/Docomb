using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.Users
{
	public class WorkspacePermissions
	{

		public bool CanRead { get; set; } = false;
		public bool CanAddNew { get; set; } = false;
		public bool CanEdit { get; set; } = false;
		public bool CanDelete { get; set; } = false;

	}
}
