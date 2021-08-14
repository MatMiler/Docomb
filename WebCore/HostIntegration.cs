using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore
{
	public static class HostIntegration
	{





		private static bool _wasAdded = false;

		public static void AddDocombCore(this IServiceCollection services)
		{
			if (_wasAdded) return;

			List<ContentStorage.Workspaces.Workspace> workspaces = Configurations.WorkspacesConfig.Workspaces;
			if (workspaces?.Count > 0)
			{
				foreach (ContentStorage.Workspaces.Workspace workspace in workspaces)
				{
					if ((workspace?.Git?.IsValid == true) && (workspace.Git?.AutoSyncInterval > 0))
					{
						services.AddHostedService((service) => new GitScheduler(workspace));
					}
				}
			}

			_wasAdded = true;
		}





		private static bool _wasUsed = false;

		public static void UseDocomb(this IApplicationBuilder app)
		{
			if (_wasUsed) return;

			Configurations.MainConfig.Instance?.Authentication?.UseAuthentication(app);

			_wasUsed = true;
		}





	}
}
