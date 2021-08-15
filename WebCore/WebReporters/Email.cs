using Docomb.CommonCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebCore.WebReporters
{
	class Email : IReporter
	{

		public string SmtpHost { get; set; }
		public int SmtpPort { get; set; }
		public string SmtpUsername { get; set; }
		public string SmtpPassword { private get; set; }

		public string EmailRecipients { get; set; }

		public bool HasConfig => ((!string.IsNullOrWhiteSpace(SmtpHost)) && (SmtpPort > 0) && (!string.IsNullOrWhiteSpace(EmailRecipients)));

		public Email(string recipients, string smtpHost, int smtpPort, string smtpUsername, string smtpPassword)
		{
			EmailRecipients = recipients;
			SmtpHost = smtpHost;
			SmtpPort = smtpPort;
			SmtpUsername = smtpUsername;
			SmtpPassword = smtpPassword;
		}





		public bool IsActive { get; set; } = true;

		public bool CanReportError => true;

		public bool CanReportInfo => false;

		public void ReportError(ActionStatus actionStatus, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			if ((actionStatus?.Exception == null) || (!HasConfig)) return;
			List<(string Label, string Value)> data = new()
			{
				("status", actionStatus?.Status.ToString()),
				("message", actionStatus?.Message)
			};
			if (properties?.Count > 0) data.AddRange(properties.Select(x => (x.Key, x.Value)));
			if (metrics?.Count > 0) data.AddRange(metrics.Select(x => (x.Key, x.Value.ToString())));
			Exception exception = actionStatus.Exception ?? new Exception(actionStatus.GetStatusDescription());
			Report(exception, data);
		}

		public void ReportError(Exception exception, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null)
		{
			if ((exception == null) || (!HasConfig)) return;
			List<(string Label, string Value)> data = new()
			{
				("message", exception?.Message)
			};
			if (properties?.Count > 0) data.AddRange(properties.Select(x => (x.Key, x.Value)));
			if (metrics?.Count > 0) data.AddRange(metrics.Select(x => (x.Key, x.Value.ToString())));
			Report(exception, data);
		}

		public void ReportInfo(string info, IDictionary<string, string> properties = null, IDictionary<string, double> metrics = null) { }



		private void Report(Exception exception, List<(string Label, string Value)> additionalData = null)
		{
			string subject = "Docomb ERROR";
			string body = PrepareContent(exception, additionalData);

			try
			{

				MailMessage message = new();
				message.From = new MailAddress(SmtpUsername);
				message.To.Add(EmailRecipients?.Replace(";", ","));

				message.Subject = subject;
				message.SubjectEncoding = Encoding.UTF8;

				message.Body = body;
				message.BodyEncoding = Encoding.UTF8;
				message.IsBodyHtml = false;

				SmtpClient client = new(SmtpHost, SmtpPort);
				client.UseDefaultCredentials = false;
				client.Credentials = new NetworkCredential(SmtpUsername, SmtpPassword);
				client.EnableSsl = true;

				client.Send(message);
			}
			catch (Exception e)
			{
				Type emailType = this.GetType();
				foreach (var reporter in Reports.Reporters)
				{
					if ((reporter.Value?.CanReportError == true) && (!emailType.IsAssignableFrom(reporter.Value.GetType())))
					{
						reporter.Value?.ReportError(e);
					}
				}
			}

		}

		private string PrepareContent(Exception exception, List<(string Label, string Value)> additionalData = null)
		{
			StringBuilder s = new();

			s.AppendLine(exception.Message);

			#region Summary
			{
				var appName = System.Reflection.Assembly.GetEntryAssembly()?.GetName();

				s.AppendLine("----------");
				s.AppendLine("Summary:");
				s.AppendLine("    Application: " + (appName?.Name + " " + appName?.Version?.ToString()).Trim());
				s.AppendLine("    Time: " + DateTime.Now.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ssZ"));
				s.AppendLine("    OS: " + System.Runtime.InteropServices.RuntimeInformation.OSDescription);
			}
			#endregion


			#region Exception
			{
				s.AppendLine("----------");
				if (additionalData?.Count > 0)
				{
					foreach (var (label, value) in additionalData)
					{
						if (!string.IsNullOrWhiteSpace(value))
							s.AppendLine("    " + label + ": " + value);
					}
				}
				if (!string.IsNullOrWhiteSpace(exception.Source)) s.AppendLine("    Exception source: " + exception.Source);
				if (exception.StackTrace != null && !string.IsNullOrWhiteSpace(exception.StackTrace))
				{
					s.AppendLine("----------");
					s.AppendLine("Trace:");
					s.AppendLine(exception.StackTrace);
				}
			}
			#endregion


			#region Inner exceptions
			{
				int innerLimit = 10;
				Exception inner = exception.InnerException;

				while (innerLimit-- > 0 && inner != null)
				{
					s.AppendLine();
					s.AppendLine("----------");
					s.AppendLine();
					s.AppendLine("Inner exception");
					s.AppendLine("    Message: " + inner.Message);
					if (!string.IsNullOrWhiteSpace(inner.Source)) s.AppendLine("    Source: " + inner.Source);
					s.AppendLine("    Trace:");
					s.AppendLine(inner.StackTrace);
					inner = inner.InnerException;
				}
			}
			#endregion


			return s.ToString();
		}



	}
}
