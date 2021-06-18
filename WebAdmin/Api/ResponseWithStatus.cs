using Docomb.CommonCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebAdmin.Api
{
	public class ResponseWithStatus<T>
	{
		[JsonPropertyName("actionStatus")]
		public ActionStatus ActionStatus { get; set; }
		
		[JsonPropertyName("data")]
		public T Data { get; set; }


		public ResponseWithStatus() { }
		public ResponseWithStatus(ActionStatus actionStatus, T data)
		{
			ActionStatus = actionStatus;
			Data = data;
		}
	}
}
