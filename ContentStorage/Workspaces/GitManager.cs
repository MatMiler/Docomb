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


		public string CredentialsKey { get; set; } = null;


		public string CommiterName { get; set; }

		public string CommiterEmail { get; set; }

		public bool ShouldClone { get; set; } = false;

		public int? AutoSyncInterval { get; set; } = null;


		public Workspace Workspace { get; internal set; }


		public string Username { get; set; }
		public string Password { private get; set; }


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
				Commit($"Added '{relativePath}'", context, push);
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
				Commit($"Updated '{relativePath}'", context, push);
			}
		}

		public void RemoveFile(string path, ActionContext context, bool push = true)
		{
			if (!IsValid) return;
			lock (_localLock)
			{
				string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
				Commands.Stage(Repository, relativePath);
				Commit($"Removed '{relativePath}'", context, push);
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
				Commit($"Removed '{relativePath}'", context, push);
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
					Commit($"Moved '{relativeOldPath}' -> '{relativeNewPath}'", context, push);
					return true;
				}
				catch
				{
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
				Commit($"Moved '{relativeOldPath}' -> '{relativeNewPath}'", context, push);
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
				Signature author = new(context?.UserName ?? CommiterName, context?.UserEmail ?? CommiterEmail, DateTime.Now);
				Signature commiter = new(CommiterName, CommiterEmail, DateTime.Now);
				Repository.Commit(message, author, commiter);

				if (push)
				{
					Task.Run(() => { Pull(); Push(); });
				}
			}
			catch { }
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
					Commands.Pull(Repository, merger, options);
					ResolveConflicts();
				}
				catch { }
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

		public void ResolveConflicts()
		{
			ConflictCollection conflicts = Repository.Index.Conflicts;
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
				}
				Repository.Commit("Merge conflicts (using local changes)", Committer, Committer);
			}
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
