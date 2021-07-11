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


		public void AddFile(string path, ActionContext context)
		{
			if (!IsValid) return;
			string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
			Commands.Stage(Repository, relativePath);
			Commit($"Added '{relativePath}'", context);
		}

		public void AddDirectory(string path, ActionContext context)
		{
			if (!IsValid) return;
			string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
			Commands.Stage(Repository, "*");
			Commit($"Added '{relativePath}'", context);
		}

		public void UpdateFile(string path, ActionContext context)
		{
			if (!IsValid) return;
			string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
			Commands.Stage(Repository, relativePath);
			Commit($"Updated '{relativePath}'", context);
		}

		public void RemoveFile(string path, ActionContext context)
		{
			if (!IsValid) return;
			string relativePath = Path.GetRelativePath(Workspace.ContentStoragePath, path);
			Commands.Stage(Repository, relativePath);
			Commit($"Removed '{relativePath}'", context);
		}

		public void RemoveDirectory(string path, ActionContext context)
		{
			if (!IsValid) return;
		}

		public void MoveFile(string oldPath, string newPath, ActionContext context)
		{
			if (!IsValid) return;
			string relativeOldPath = Path.GetRelativePath(Workspace.ContentStoragePath, oldPath);
			string relativeNewPath = Path.GetRelativePath(Workspace.ContentStoragePath, newPath);
			Commands.Move(Repository, relativeOldPath, relativeNewPath);
			Commit($"Moved '{relativeOldPath}' -> '{relativeNewPath}'", context);
		}

		public void RenameDirectory(string path)
		{
			if (!IsValid) return;
		}


		public void Commit(string message, ActionContext context)
		{
			if (!IsValid) return;
			try
			{
				Signature author = new(context?.UserName ?? CommiterName, context?.UserEmail ?? CommiterEmail, DateTime.Now);
				Signature commiter = new(CommiterName, CommiterEmail, DateTime.Now);
				Repository.Commit(message, author, commiter);

				var branch = Repository.Branches[Branch];
				var options = new PushOptions();

				var credentials = new UsernamePasswordCredentials { Username = Username, Password = Password };
				options.CredentialsProvider = (url, user, cred) => credentials;
				Repository.Network.Push(branch, options);
			}
			catch (Exception e)
			{
				int a = 1;
			}
		}


	}
}
