using Docomb.ContentStorage.Workspaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebCore.Dtos
{
	public class GitConfigDto
	{
		/// <summary>Git repository path</summary>
		[JsonPropertyName("repository")]
		public string RepositoryPath { get; set; }


		[JsonPropertyName("branch")]
		public string Branch { get; set; }


		[Obsolete("Use Username & Password with secret value")]
		[JsonPropertyName("credentialsKey")]
		public string CredentialsKey { get; set; }

		[JsonPropertyName("username")]
		public string UsernameSecret { get; set; }
		[JsonPropertyName("password")]
		public string PasswordSecret { get; set; }


		[JsonPropertyName("commiterName")]
		public string CommiterName { get; set; }

		[JsonPropertyName("commiterEmail")]
		public string CommiterEmail { get; set; }


		[JsonPropertyName("clone")]
		public bool ShouldClone { get; set; } = false;


		[JsonPropertyName("syncInterval")]
		public int? AutoSyncInterval { get; set; } = null;


		public GitManager ToGitManager()
		{
			GitManager manager = new()
			{
				RepositoryPath = RepositoryPath,
				Branch = Branch,
				CredentialsKey = CredentialsKey,
				UsernameSecret = UsernameSecret,
				PasswordSecret = PasswordSecret,
				CommiterName = CommiterName,
				CommiterEmail = CommiterEmail,
				ShouldClone = ShouldClone,
				AutoSyncInterval = AutoSyncInterval
			};
			return manager;
		}

		public static GitConfigDto FromGitManager(GitManager manager)
		{
			if (manager == null) return null;
			return new()
			{
				RepositoryPath = manager.RepositoryPath,
				Branch = manager.Branch,
				CredentialsKey = manager.CredentialsKey,
				UsernameSecret = manager.UsernameSecret,
				PasswordSecret = manager.PasswordSecret,
				CommiterName = manager.CommiterName,
				CommiterEmail = manager.CommiterEmail,
				ShouldClone = manager.ShouldClone,
				AutoSyncInterval = manager.AutoSyncInterval
			};
		}

	}
}
