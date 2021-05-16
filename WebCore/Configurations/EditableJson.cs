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

		public static readonly JsonSerializerOptions JsonOptions = new JsonSerializerOptions
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
			string runtimeDirectory = Path.GetDirectoryName(System.Diagnostics.Process.GetCurrentProcess().MainModule.FileName);
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
				catch (Exception e) { }
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

			string renameTo = null;
			bool isLastBackupFile = true;

			for (int x = FileNameBackupQueue.Count - 1; x >= 0; x--)
			{
				string fileName = FileNameBackupQueue[x];
				if (File.Exists(fileName))
				{
					if (isLastBackupFile)
					{ File.Delete(fileName); }
					else if (renameTo != null)
					{ File.Move(fileName, renameTo); }
				}
				renameTo = fileName;
				isLastBackupFile = false;
			}

			File.WriteAllText(FileName, content, Encoding.UTF8);
		}


	}
}
