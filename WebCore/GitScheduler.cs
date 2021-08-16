using Docomb.CommonCore;
using Docomb.ContentStorage.Workspaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Docomb.WebCore
{
	class GitScheduler: IHostedService, IDisposable
	{

		#region Instance

		private Timer _timer;

		public GitScheduler(Workspace workspace)
		{
			Instances.Add(this);
			Workspace = workspace;
			int interval = workspace.Git.AutoSyncInterval.Value;
			if (interval < 5) interval = 5;
			RepeatInterval = new TimeSpan(0, interval, 0);
		}

		public Workspace Workspace { get; set; }

		public TimeSpan RepeatInterval { get; set; }

		public Task StartAsync(CancellationToken stoppingToken)
		{
			_timer = new Timer(DoWork, null, TimeSpan.Zero, RepeatInterval);
			return Task.CompletedTask;
		}

		private void DoWork(object state)
		{
			try
			{
				if (Workspace?.Git?.IsValid == true)
				{
					Workspace.Git.Sync(new ContentStorage.ActionContext() { UserEmail = Workspace.Git.CommiterEmail, UserName = Workspace.Git.CommiterName });
				}
			}
			catch (Exception e)
			{
				Reports.Report(e);
			}
		}

		public Task StopAsync(CancellationToken stoppingToken)
		{
			_timer?.Change(Timeout.Infinite, 0);
			return Task.CompletedTask;
		}

		public void Dispose()
		{
			_timer?.Dispose();
		}

		#endregion





		#region Factory

		public static List<GitScheduler> Instances { get; } = new();

		#endregion

	}
}
