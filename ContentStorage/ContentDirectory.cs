using Docomb.CommonCore;
using Docomb.ContentStorage.Workspaces;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage
{
	public class ContentDirectory : ContentItem
	{
		public override ContentItemType Type => ContentItemType.Directory;

		public override bool NeedsTrailingSlash => true;

		public ContentDirectory(Workspace workspace, string filePath, List<string> urlParts) : base(workspace, filePath, urlParts)
		{
		}


		public ActionStatus Rename(string newName, ActionContext context)
		{
			try
			{
				if (string.IsNullOrWhiteSpace(newName)) return new(ActionStatus.StatusCode.InvalidRequestData, "Folder name cannot be empty.");
				if (Path.GetInvalidFileNameChars().Any(newName.Contains)) return new(ActionStatus.StatusCode.InvalidRequestData, $"New name '{newName}' contains invalid characters.");
				string newPath = Path.Combine(Directory.GetParent(FilePath).FullName, newName);
				if (File.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"File '{newName}' already exists.");
				if (Directory.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"Folder '{newName}' already exists.");
				string oldPath = FilePath;
				Directory.Move(FilePath, newPath);
				Workspace.Content.ClearCache();
				Workspace.Git?.MoveDirectory(oldPath, newPath, context);
				return new(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				Reports.Report(e);
				return new(ActionStatus.StatusCode.Error, exception: e);
			}
		}

		public ActionStatus Move(string newParentPath, ActionContext context)
		{
			try
			{
				ContentDirectory parent = Workspace.Content.FindItem(newParentPath, MatchType.Physical)?.AsDirectory;
				if (parent == null) return new(ActionStatus.StatusCode.NotFound, $"Target path '{newParentPath}' doesn't exist.");
				string newPath = Path.Combine(parent.FilePath, UrlParts.LastOrDefault());
				if (newPath == FilePath) return new(ActionStatus.StatusCode.InvalidRequestData, $"The folder is already in '{newParentPath}'");
				if (File.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"A file with the same name already exists in '{newParentPath}'.");
				if (Directory.Exists(newPath)) return new(ActionStatus.StatusCode.Conflict, $"A folder with the same name already exists in '{newParentPath}'.");
				string oldPath = FilePath;
				Directory.Move(FilePath, newPath);
				Workspace.Content.ClearCache();
				Workspace.Git?.MoveDirectory(oldPath, newPath, context);
				return new(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				Reports.Report(e);
				return new(ActionStatus.StatusCode.Error, exception: e);
			}
		}

		public ActionStatus Delete(ActionContext context)
		{
			try
			{
				Directory.Delete(FilePath, true);
				Workspace.Content.ClearCache();
				Workspace.Git?.RemoveDirectory(FilePath, context);
				return new(ActionStatus.StatusCode.OK);
			}
			catch (Exception e)
			{
				Reports.Report(e);
				return new(ActionStatus.StatusCode.Error, exception: e);
			}
		}


	}
}
