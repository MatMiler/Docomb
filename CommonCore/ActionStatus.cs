using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	/// <summary>Summarized status of the requested/executed action</summary>
	public class ActionStatus
	{
		#region Instance values

		/// <summary>Status of the action</summary>
		[JsonConverter(typeof(JsonStringEnumConverter))]
		[JsonPropertyName("status")]
		public StatusCode Status { get; set; } = StatusCode.OK;

		/// <summary>Simplified category of the status (for situations where not all status codes are supported by client)</summary>
		[JsonConverter(typeof(JsonStringEnumConverter))]
		[JsonPropertyName("category")]
		public StatusCategory Category => Status.GetCategory();


		/// <summary>Detailed message</summary>
		[JsonPropertyName("message")]
		public string Message { get; set; } = null;

		/// <summary>Any exception that might have been triggered</summary>
		[JsonIgnore]
		public Exception Exception { get; set; } = null;

		[JsonIgnore]
		public List<ActionStatus> Inner { get; set; } = null;


		#endregion


		public ActionStatus() { }
		public ActionStatus(StatusCode status, string message = null, Exception exception = null)
		{
			Status = status;
			Message = message;
			Exception = exception;
		}





		public void AddInner(ActionStatus inner)
		{
			if (inner != null) (Inner ??= new List<ActionStatus>()).Add(inner);
		}

		/// <summary>Whether the action succeeded</summary>
		[JsonPropertyName("isOk")]
		public bool IsOk => Status.IsOk();

		public string GetStatusDescription() => Status.GetDescription();
		public int GetHttpStatusCode() => Status.GetHttpStatusCode();





		public enum StatusCategory
		{
			OK,
			ClientIssue,
			ServerIssue,
			SecurityIssue,
			UnknownIssue
		}


		public enum StatusCode
		{
			[StatusCode("OK", StatusCategory.OK, 200, isOk: true)]
			OK,
			[StatusCode("An unknown error has occurred", StatusCategory.ServerIssue, 500)]
			Error,
			[StatusCode("The requested resource could not be found", StatusCategory.ClientIssue, 404)]
			NotFound,
			[StatusCode("Insufficient data given", StatusCategory.ClientIssue, 400)]
			MissingRequestData,
			[StatusCode("Given data is not valid", StatusCategory.ClientIssue, 400)]
			InvalidRequestData,
			[StatusCode("Requested action is not supported", StatusCategory.ClientIssue, 400)]
			ActionNotSupported,
			[StatusCode("Data is not supported", StatusCategory.ClientIssue, 400)]
			DataNotSupported,
			[StatusCode("Resources are in conflict", StatusCategory.ClientIssue, 409)]
			Conflict
		}


		[AttributeUsage(AttributeTargets.Field)]
		public class StatusCodeAttribute : Attribute
		{
			public bool IsOk { get; private set; }
			public StatusCategory Category { get; private set; }
			public string Description { get; private set; }
			public int HttpStatusCode { get; private set; }

			public StatusCodeAttribute(string description, StatusCategory category, int httpStatusCode, bool isOk = false)
			{
				IsOk = isOk;
				Category = category;
				Description = description;
				HttpStatusCode = httpStatusCode;
			}
		}
	}

	public static class ActionStatusCodeMethods
		{
			public static string GetDescription(this ActionStatus.StatusCode code)
			{
				var type = code.GetType();
				try
				{ return type.GetField(Enum.GetName(type, code)).GetCustomAttributes(false).OfType<ActionStatus.StatusCodeAttribute>().SingleOrDefault()?.Description; }
				catch
				{ return null; }
			}
			public static ActionStatus.StatusCategory GetCategory(this ActionStatus.StatusCode code)
			{
				var type = code.GetType();
				try
				{ return type.GetField(Enum.GetName(type, code)).GetCustomAttributes(false).OfType<ActionStatus.StatusCodeAttribute>().SingleOrDefault()?.Category ?? ActionStatus.StatusCategory.UnknownIssue; }
				catch
				{ return ActionStatus.StatusCategory.UnknownIssue; }
			}

			public const int DefaultHttpStatusCode = 0;
			public static int GetHttpStatusCode(this ActionStatus.StatusCode code)
			{
				var type = code.GetType();
				try
				{ return type.GetField(Enum.GetName(type, code)).GetCustomAttributes(false).OfType<ActionStatus.StatusCodeAttribute>().SingleOrDefault()?.HttpStatusCode ?? DefaultHttpStatusCode; }
				catch
				{ return DefaultHttpStatusCode; }
			}

			public static bool IsOk(this ActionStatus.StatusCode code)
			{
				var type = code.GetType();
				try
				{ return type.GetField(Enum.GetName(type, code)).GetCustomAttributes(false).OfType<ActionStatus.StatusCodeAttribute>().SingleOrDefault()?.IsOk ?? false; }
				catch
				{ return false; }
			}

		}


}
