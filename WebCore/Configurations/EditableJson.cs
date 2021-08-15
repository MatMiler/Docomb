using Docomb.CommonCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Docomb.WebCore.Configurations
{
	/// <summary>Handler for an editable JSON file with backups</summary>
	/// <typeparam name="T">Class into which the content deserializes</typeparam>
	internal class EditableJson<T>
		where T : class
	{

		public EditableJson(string fileName, int? backupVersions = null)
		{
			FileName = fileName;
			if (backupVersions.HasValue) BackupVersions = backupVersions.Value;
		}



		public string FileName { get; private set; } = null;
		public int BackupVersions { get; private set; } = 3;

		public static readonly JsonSerializerOptions JsonOptions = new()
		{
			WriteIndented = true,
			PropertyNameCaseInsensitive = true,
			NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString,
			IncludeFields = false
		};

		protected List<string> FileNameBackupQueue
		{
			get
			{
				if (_fileNameBackupQueue?.Count > 0) return _fileNameBackupQueue;
				_fileNameBackupQueue = new List<string>() { FileName };
				if (BackupVersions <= 1) return _fileNameBackupQueue;
				string fileNameRoot = Path.GetFileNameWithoutExtension(FileName);
				if (BackupVersions == 2)
				{
					_fileNameBackupQueue.Add(fileNameRoot + ".bak");
				}
				else if (BackupVersions >= 3)
				{
					for (int x = 1; x < BackupVersions; x++)
					{
						_fileNameBackupQueue.Add($"{fileNameRoot}-{x}.bak");
					}
				}
				return _fileNameBackupQueue;
			}
		}
		private List<string> _fileNameBackupQueue = null;


		public T Read()
		{
			string runtimeDirectory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
			// Get the content out of the first viable file (first the main file, then the more recent backup versions)
			foreach (string fileName in FileNameBackupQueue)
			{
				try
				{
					string fullPath = Path.Combine(runtimeDirectory, fileName);
					string content = File.ReadAllText(fullPath);
					T data = JsonSerializer.Deserialize<T>(content, options: JsonOptions);
					if (data != null)
						return data;
				}
				catch (Exception e) { Reports.Report(e); }
			}
			return null;
		}

		public void Write(T data)
		{
			string content = JsonSerializer.Serialize(data, options: JsonOptions);

			/* 
			 * 1. Delete the last backup file in the queue
			 * 2. Rename the remaining files, including the main config file
			 * 3. Create a new main config file and save content into it
			 */

			string runtimeDirectory = Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location);
			string renameTo = null;
			bool isLastBackupFile = true;

			for (int x = FileNameBackupQueue.Count - 1; x >= 0; x--)
			{
				string filePath = Path.Combine(runtimeDirectory, FileNameBackupQueue[x]);
				if (File.Exists(filePath))
				{
					if (isLastBackupFile)
					{ File.Delete(filePath); }
					else if (renameTo != null)
					{ File.Move(filePath, renameTo); }
				}
				renameTo = filePath;
				isLastBackupFile = false;
			}

			string fullPath = Path.Combine(runtimeDirectory, FileName);
			File.WriteAllText(fullPath, content, Encoding.UTF8);
		}


	}
}
