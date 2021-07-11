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


		[JsonPropertyName("credentialsKey")]
		public string CredentialsKey { get; set; }

		[JsonPropertyName("commiterName")]
		public string CommiterName { get; set; }

		[JsonPropertyName("commiterEmail")]
		public string CommiterEmail { get; set; }


		public GitManager ToGitManager()
		{
			GitManager manager = new()
			{
				RepositoryPath = RepositoryPath,
				Branch = Branch,
				CredentialsKey = CredentialsKey,
				CommiterName = CommiterName,
				CommiterEmail = CommiterEmail
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
				CommiterName = manager.CommiterName,
				CommiterEmail = manager.CommiterEmail
			};
		}

	}
}
