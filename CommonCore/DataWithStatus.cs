using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public class DataWithStatus<T>
	{
		[JsonPropertyName("actionStatus")]
		public ActionStatus ActionStatus { get; set; }

		[JsonPropertyName("data")]
		public T Data { get; set; }


		public DataWithStatus() { }
		public DataWithStatus(ActionStatus actionStatus, T data)
		{
			ActionStatus = actionStatus;
			Data = data;
		}
	}
}
