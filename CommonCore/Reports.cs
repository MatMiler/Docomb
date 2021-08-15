using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{

	/// <summary>Call point and manager for reporters</summary>
	public static class Reports
	{
		public static Dictionary<string, IReporter> Reporters { get => _reporters; }
		private static Dictionary<string, IReporter> _reporters = new();


		public static void AddReporter(string key, IReporter reporter)
		{
			_reporters ??= new Dictionary<string, IReporter>();
			if (!_reporters.ContainsKey(key))
				_reporters.Add(key, reporter);
		}

		public static void RemoveReporter(string key)
		{
			_reporters?.Remove(key);
		}


		public static bool HasReporter(string key) => _reporters?.ContainsKey(key) ?? false;

		public static bool HasReporter(Type type)
		{
			if (_reporters?.Count > 0)
			{
				foreach (IReporter reporter in _reporters.Values)
				{
					if (reporter == null) continue;
					if (type.IsAssignableFrom(reporter.GetType()))
						return true;
				}
			}
			return false;
		}

		public static bool HasReporter(IReporter reporter) => _reporters?.Values.Any(x => x == reporter) ?? false;



		public static void ReportError(string message, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
			=> ReportError(new Exception(message), properties, metrics);

		public static void ReportError(ActionStatus actionStatus, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			foreach (IReporter reporter in _reporters?.Values)
				if (reporter?.CanReportError == true)
					reporter.ReportError(actionStatus, properties, metrics);
		}

		public static void ReportError(Exception exception, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			foreach (IReporter reporter in _reporters?.Values)
				if (reporter?.CanReportError == true)
					reporter.ReportError(exception, properties, metrics);
		}

		public static void ReportInfo(string message, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			foreach (IReporter reporter in _reporters?.Values)
				if (reporter?.CanReportInfo == true)
					reporter.ReportInfo(message, properties, metrics);
		}


		public static void Report(this ActionStatus actionStatus, bool reportIfOk = false, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			if ((actionStatus != null) && ((!actionStatus.IsOk) || (reportIfOk)))
				ReportError(actionStatus, properties, metrics);
		}

		public static void Report(this Exception exception, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			if (exception != null)
				ReportError(exception, properties, metrics);
		}





		public static void UnhandledExceptionTrapper(object sender, UnhandledExceptionEventArgs e)
		{
			try
			{
				((Exception)e.ExceptionObject).Report();
			}
			catch
			{
				Report(new Exception(e.ExceptionObject.ToString()));
			}
		}


	}
}
