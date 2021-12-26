using Docomb.CommonCore;
using LibGit2Sharp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.Workspaces
{
	public class GitManager
	{
		/// <summary>Git repository path</summary>
		public string RepositoryPath { get; set; }


		public string Branch { get; set; } = "main";


		[Obsolete("Use username & password with secret value")]
		public string CredentialsKey { get; set; } = null;


		public string CommiterName { get; set; }

		public string CommiterEmail { get; set; }

		public bool ShouldClone { get; set; } = false;

		public int? AutoSyncInterval { get; set; } = null;


		public Workspace Workspace { get; internal set; }


		public string UsernameSecret { get; set; }
		public string PasswordSecret { get; set; }

		public string Username
		{
			get
			{
				if (!_accessWasRetrieved) RetrieveAccess();
				return _username;
			}
			set => _username = value;
		}
		private string _username = null;
		public string Password
		{
			private get
			{
				if (!_accessWasRetrieved) RetrieveAccess();
				return _password;
			}
			set => _password = value;
		}
		private string _password = null;
		private bool _accessWasRetrieved = false;
		private void RetrieveAccess()
		{
			_username = CommonCore.Secrets.Manager.GetValue(UsernameSecret);
			_password = CommonCore.Secrets.Manager.GetValue(PasswordSecret);
			_accessWasRetrieved = true;
		}


		public bool IsValid
		{
			get
			{
				if (_isValid == null)
				{
					_isValid = Workspace != null && !string.IsNullOrWhiteSpace(RepositoryPath);
				}
				return _isValid.Value;
			}
		}
		private bool? _isValid = null;


		public Repository Repository
		{
			get
			{
				if (_repository == null && IsValid)
				{
					_repository = new Repository(Workspace?.ContentStoragePath);
				}
				return _repository;
			}
		}
		private Repository _repository = null;






		private readonly object _localLock = new();
		private readonly object _originLock = new();



		public void CloneIfEmpty()
		{
			string path = Workspace.ContentStoragePath;
			#region Check path & create directory
			{
				if (!Directory.Exists(path))
				{
					try
					{
						Directory.CreateDirectory(path);
					}
					catch (Exception e)
					{
						Reports.Report(e);
						return;
					}
				}
			}
			#endregion


			#region Clone
			if (!Repository.IsValid(path))
			{
				try
				{
					CloneOptions options = new() { CredentialsProvider = CredentialsProvider, BranchName = Branch };
					Repository.Clone(RepositoryPath, path, options);
				}
				catch (Exception e)
				{
					Reports.Report(e);
				}
			}
			#endregion
		}



		public void AddFile(string path, ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			lock (_localLock)
			{
				string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
				Commands.Stage(Repository, relativePath);
				Commit($"Add '{relativePath}'", context, push);
			}
		}

		[System.Diagnostics.CodeAnalysis.SuppressMessage("Performance", "CA1822:Mark members as static", Justification = "<Pending>")]
		[System.Diagnostics.CodeAnalysis.SuppressMessage("Style", "IDE0060:Remove unused parameter", Justification = "<Pending>")]
		public void AddDirectory(string path, ActionContext context, bool push = true)
		{
		}

		public void UpdateFile(string path, ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			lock (_localLock)
			{
				string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
				Commands.Stage(Repository, relativePath);
				Commit($"Update '{relativePath}'", context, push);
			}
		}

		public void RemoveFile(string path, ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			lock (_localLock)
			{
				string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
				Commands.Stage(Repository, relativePath);
				Commit($"Remove '{relativePath}'", context, push);
			}
		}

		public void RemoveDirectory(string path, ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			lock (_localLock)
			{
				string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
				RepositoryStatus status = Repository.RetrieveStatus(new StatusOptions()
				{
					DetectRenamesInWorkDir = false,
					DetectRenamesInIndex = false,
					PathSpec = new string[] { relativePath },
					IncludeUntracked = true,
					RecurseUntrackedDirs = true
				});
				if (status?.Count() > 0)
				{
					Commands.Stage(Repository, status.Select(x => x.FilePath));
				}
				Commit($"Remove '{relativePath}'", context, push);
			}
		}

		public bool MoveFile(string oldPath, string newPath, ActionContext context, bool push = true)
		{
			if (!IsValid) return false;
			lock (_localLock)
			{
				try
				{
					string relativeOldPath = Path.GetRelativePath(Workspace.ContentStoragePath, oldPath);
					string relativeNewPath = Path.GetRelativePath(Workspace.ContentStoragePath, newPath);
					Commands.Move(Repository, relativeOldPath, relativeNewPath);
					Commit($"Move '{relativeOldPath}' -> '{relativeNewPath}'", context, push);
					return true;
				}
				catch (Exception e)
				{
					Reports.Report(e);
					return false;
				}
			}
		}

		public void MoveDirectory(string oldPath, string newPath, ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			lock (_localLock)
			{
				string relativeOldPath = Path.GetRelativePath(Workspace.ContentStoragePath, oldPath);
				string relativeNewPath = Path.GetRelativePath(Workspace.ContentStoragePath, newPath);
				RepositoryStatus status = Repository.RetrieveStatus(new StatusOptions()
				{
					DetectRenamesInWorkDir = false,
					DetectRenamesInIndex = false,
					PathSpec = new string[] { relativeOldPath, relativeNewPath },
					IncludeUntracked = true,
					RecurseUntrackedDirs = true
				});
				if (status?.Count() > 0)
				{
					Commands.Stage(Repository, status.Select(x => x.FilePath));
				}
				Commit($"Move '{relativeOldPath}' -> '{relativeNewPath}'", context, push);
			}
		}

		public void CommitAll(ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			lock (_localLock)
			{
				Commands.Stage(Repository, "*");
				Commit($"Sync", context, push);
			}
		}


		public void Commit(string message, ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			try
			{
				bool anyChanges = false;
				foreach (var item in Repository.RetrieveStatus())
				{
					switch (item.State)
					{
						case FileStatus.Ignored: case FileStatus.Unaltered: case FileStatus.Unreadable: break;
						default: { anyChanges = true; break; }
					}
					if (anyChanges) break;
				}
				if (!anyChanges) return;

				Signature author = new(context?.UserName ?? CommiterName, context?.UserEmail ?? CommiterEmail, DateTime.Now);
				Signature commiter = new(CommiterName, CommiterEmail, DateTime.Now);
				Repository.Commit(message, author, commiter);

				if (push)
				{
					Task.Run(() => { Pull(); Push(); });
				}
			}
			catch (Exception e) { Reports.Report(e); }
		}


		public void Pull()
		{
			if (!IsValid) return;
			lock (_originLock)
			{
				try
				{
					var branch = Repository.Branches[Branch];
					var options = new PullOptions();
					Signature merger = new(CommiterName, CommiterEmail, DateTime.Now);

					options.FetchOptions ??= new();
					options.FetchOptions.CredentialsProvider = CredentialsProvider;
					MergeResult pullResults = Commands.Pull(Repository, merger, options);
					bool anyConflicts = ResolveConflicts();
					if ((pullResults?.Status != MergeStatus.UpToDate) || (anyConflicts))
					{
						Workspace.Content.ClearCache();
					}
				}
				catch (Exception e) { Reports.Report(e); }
			}
		}

		public void Push()
		{
			lock (_originLock)
			{
				var branch = Repository.Branches[Branch];
				var options = new PushOptions();
				options.CredentialsProvider = CredentialsProvider;
				ResolveConflicts();
				Repository.Network.Push(branch, options);
			}
		}

		public bool ResolveConflicts()
		{
			ConflictCollection conflicts = Repository.Index.Conflicts;
			var result = false;
			if (conflicts?.Count() > 0)
			{
				foreach (var conflict in Repository.Index.Conflicts)
				{
					IndexEntry ours = conflict.Ours;
					Blob ourBlob = (ours != null) ? (Blob)Repository.Lookup(ours.Id) : null;
					var ourStream = (ours != null) ? ourBlob.GetContentStream(new FilteringOptions(ours.Path)) : null;
					var fullPath = Path.Combine(Workspace.ContentStoragePath, ours.Path);
					using (var oursOutputStream = File.Create(fullPath))
					{
						ourStream.CopyTo(oursOutputStream);
					}
					Commands.Stage(Repository, conflict.Ours.Path);
					result = true;
				}
				Repository.Commit("Merge conflicts (using local changes)", Committer, Committer);
			}
			return result;
		}

		private Signature Committer => new(CommiterName, CommiterEmail, DateTime.Now);

		[System.Diagnostics.CodeAnalysis.SuppressMessage("Style", "IDE0060:Remove unused parameter", Justification = "<Pending>")]
		private UsernamePasswordCredentials CredentialsProvider(string url, string usernameFromUrl, SupportedCredentialTypes types) => new() { Username = Username, Password = Password };

		public void Sync(ActionContext context)
		{
			if (!IsValid) return;
			CommitAll(context, false);
			Pull();
			Push();
		}

	}
}
