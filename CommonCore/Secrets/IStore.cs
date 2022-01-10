using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore.Secrets
{
	public interface IStore
	{

		/// <summary>
		/// Unique code of a store.
		/// <example>For example, if code is <c>"store1"</c>, this store will load values for secret references like <c>"@store1:key1"</c>.</example>
		/// </summary>
		public string Code { get; }

		/// <summary>Retrieves a value from the store with a given key.</summary>
		/// <param name="key">Key to retrieve</param>
		/// <returns></returns>
		public string GetValue(string key);

	}
}
