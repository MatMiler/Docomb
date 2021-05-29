using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.ContentStorage.MarkdownEngines
{
	public static class Manager
	{

		public static Dictionary<string, MarkdownEngine> Engines => _engines ??= FindAvailableEngines();
		private static Dictionary<string, MarkdownEngine> _engines = null;

		public static MarkdownEngine DefaultEngine => _defaultEngine ??= Engines?.Values?.OrderBy(x => x.Code).FirstOrDefault();
		private static MarkdownEngine _defaultEngine = null;



		public static Dictionary<string, MarkdownEngine> FindAvailableEngines()
		{
			try
			{
				IEnumerable<MarkdownEngine> engines = Assembly.GetExecutingAssembly().GetTypes()
					.Where(x => (x.IsClass) && (!x.IsAbstract) && (x.IsSubclassOf(typeof(MarkdownEngine))))
					.Select(x => Activator.CreateInstance(x) as MarkdownEngine).Where(x => x.IsActive);
				Dictionary<string, MarkdownEngine> dict = engines.ToDictionary(x => x.Code);
				return dict;
			}
			catch (Exception e)
			{

			}
			//foreach (var engine in engines)
			//{

			//}
			return null;
		}




		public static MarkdownEngine GetEngine(Workspace workspace)
		{
			if ((!string.IsNullOrWhiteSpace(workspace?.MarkdownEngineCode)) && (Engines?.Count >= 1))
			{
				string code = workspace?.MarkdownEngineCode?.Trim();
				if (Engines.ContainsKey(code)) return Engines[code];
				var dictLower = Engines.Values.ToDictionary(x => x.Code?.ToLower());
				if (dictLower.ContainsKey(code.ToLower())) return dictLower[code];
			}
			return DefaultEngine;
		}






	}
}
