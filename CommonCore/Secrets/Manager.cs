using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	public static class Manager
	{


		public static Dictionary<string, Store> Stores
		{
			get
			{
				if (_stores == null)
				{
					Dictionary<string, Store> list = new();

					// Register built-in stores
					list.Register(new JsonStore());
					list.Register(new ValueStore());

					_stores = list;
				}
				return _stores;
			}
		}
		private static Dictionary<string, Store> _stores = null;



		public static void Register(Store store)
		{
			Stores?.Register(store);
		}

		public static void Register(this Dictionary<string, Store> list, Store store)
		{
			if (string.IsNullOrWhiteSpace(store?.Code)) return; // Don't register stores without a code
			list.TryAdd(store.Code, store);
		}

		public static void Unregister(Store store) => Unregister(store?.Code);

		public static void Unregister(string storeCode)
		{
			if (storeCode == null) return;
			_stores.Remove(storeCode);
		}

		public static string GetValue(string s)
		{
			Regex regex = new("^@([^:]*):(.*)$");
			Match match = regex.Match(s);
			if (match?.Groups?.Count >= 3)
			{
				string code = match.Groups[1]?.Value?.ToLowerInvariant();
				string key = match.Groups[2]?.Value;
				if ((Stores.TryGetValue(code, out Store store)) && (store != null))
					return store.GetValue(key);
			}

			return s;
		}

	}
}
