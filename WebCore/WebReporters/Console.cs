using Docomb.CommonCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.WebReporters
{
	public class Console : IReporter
	{
		public bool IsActive { get; set; } = true;

		public bool CanReportError => true;

		public bool CanReportInfo => true;

		public void ReportError(ActionStatus actionStatus, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			if (actionStatus?.Exception != null) ReportError(actionStatus.Exception);
		}

		public bool IncludeDate { get; set; } = true;

		public string DateFormat { get; set; } = "yyyy-MM-ddTHH:mm:ssZ";

		public void ReportError(Exception exception, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			if (exception == null) return;
			StringBuilder s = new();
			if (IncludeDate) s.Append($"{DateTime.Now.ToUniversalTime().ToString(DateFormat)} - ");
			s.AppendLine(exception.Message);
			string trace = exception.StackTrace;
			if (trace != null) s.AppendLine($"	Trace: {trace}");
			System.Console.Write(s.ToString());
		}

		public void ReportInfo(string info, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			StringBuilder s = new();
			s.AppendLine(IncludeDate ? $"{DateTime.Now.ToUniversalTime().ToString(DateFormat)} - {info}" : info);
			if (properties?.Count > 0) s.AppendLine($"	Properties: {string.Join(", ", properties.Select(x => $"'{x.Key}': '{x.Value}'"))}");
			if (metrics?.Count > 0) s.AppendLine($"	Metrics: {string.Join(", ", metrics.Select(x => $"'{x.Key}': '{x.Value}'"))}");
			System.Console.Write(s.ToString());
		}


	}
}
