using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{

	public interface IReporter
	{

		public bool CanReportError { get; }
		public bool CanReportInfo { get; }

		public void ReportError(ActionStatus actionStatus, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null);
		public void ReportError(Exception exception, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null);

		public void ReportInfo(string info, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null);

	}

}
