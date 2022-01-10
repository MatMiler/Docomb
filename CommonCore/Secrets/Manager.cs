using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	/// <summary>
	/// Secrets store manager.
	/// Maintains a list of stores, which can retrieve values from their respective sources.
	/// </summary>
	public static class Manager
	{

		/// <summary>Available stores</summary>
		public static Dictionary<string, IStore> Stores
		{
			get
			{
				if (_stores == null)
				{
					Dictionary<string, IStore> list = new();

					// Register built-in stores
					list.Register(new JsonStore());
					list.Register(new ValueStore());

					_stores = list;
				}
				return _stores;
			}
		}
		private static Dictionary<string, IStore> _stores = null;


		/// <summary>Add a store.</summary>
		/// <param name="store">Store to add</param>
		public static void Register(IStore store)
		{
			Stores?.Register(store);
		}

		/// <summary>Add a store if its code isn't already in use.</summary>
		/// <param name="list"></param>
		/// <param name="store"></param>
		private static void Register(this Dictionary<string, IStore> list, IStore store)
		{
			if (string.IsNullOrWhiteSpace(store?.Code)) return; // Don't register stores without a code
			list.TryAdd(store.Code, store);
		}

		/// <summary>Remove a store, so that it can no longer be used.</summary>
		/// <param name="store">Store to remove</param>
		public static void Unregister(IStore store) => Unregister(store?.Code);

		/// <summary>Remove a store, so that it can no longer be used.</summary>
		/// <param name="storeCode">Code of the store to remove</param>
		public static void Unregister(string storeCode)
		{
			if (storeCode == null) return;
			_stores?.Remove(storeCode);
		}

		/// <summary>Check if <c>s</c> is a secret reference and return the value from appropriate store. Otherwise the original value is returned.</summary>
		/// <param name="s">Secret reference. <example>Example: <c>"@store1:key1"</c></example></param>
		/// <returns></returns>
		public static string GetValue(string s)
		{
			Regex regex = new("^@([^:]*):(.*)$");
			Match match = regex.Match(s);
			if (match?.Groups?.Count >= 3)
			{
				string code = match.Groups[1]?.Value?.ToLowerInvariant();
				string key = match.Groups[2]?.Value;
				if ((Stores.TryGetValue(code, out IStore store)) && (store != null))
					return store.GetValue(key);
			}

			return s;
		}

	}
}
