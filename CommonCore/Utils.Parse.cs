using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.CommonCore
{
	public static partial class Utils
	{

		/// <summary>Converts the value to string (using its ToString() function) or returns default value</summary>
		/// <param name="value">Value to convert</param>
		/// <param name="defaultValue">Default value to return if object is null</param>
		/// <returns></returns>
		public static string ParseString(object value, string defaultValue = null)
		{ return ((value == DBNull.Value) || (value == null)) ? defaultValue : value.ToString(); }





		/// <summary>Attempts to find and return an appropriate value in the enumerator</summary>
		/// <typeparam name="T">Enumerator</typeparam>
		/// <param name="value">Value to find</param>
		/// <param name="defaultValue">Default return value if no match is found</param>
		/// <returns></returns>
		public static T StringToEnum<T>(string value, T defaultValue)
		{
			T result = defaultValue;
			try { result = (T)Enum.Parse(typeof(T), value); }
			catch { }
			return result;
		}





		public static decimal ParseDecimal(object value, decimal defaultValue = 0)
		{
			if ((value == DBNull.Value) || (value == null)) return defaultValue;
			try
			{ return Convert.ToDecimal(value); }
			catch
			{ return defaultValue; }
		}
		public static decimal? ParseDecimalNull(object value, decimal? defaultValue = null)
		{
			if ((value == DBNull.Value) || (value == null)) return defaultValue;
			try
			{ return Convert.ToDecimal(value); }
			catch
			{ return defaultValue; }
		}

		public static double ParseDouble(object value, double defaultValue = 0)
		{
			if ((value == DBNull.Value) || (value == null)) return defaultValue;
			try
			{ return Convert.ToDouble(value); }
			catch
			{ return defaultValue; }
		}
		public static double? ParseDoubleNull(object value, double? defaultValue = null)
		{
			if ((value == DBNull.Value) || (value == null)) return defaultValue;
			try
			{ return Convert.ToDouble(value); }
			catch
			{ return defaultValue; }
		}

		public static int ParseInt(object o, int defaultValue = 0)
		{
			if ((o == DBNull.Value) || (o == null)) return defaultValue;
			try
			{ return Convert.ToInt32(o); }
			catch
			{ return defaultValue; }
		}
		public static int? ParseIntNull(object o, int? defaultValue = null)
		{
			if ((o == DBNull.Value) || (o == null)) return defaultValue;
			try
			{ return Convert.ToInt32(o); }
			catch
			{ return defaultValue; }
		}





		public static bool ParseBool(object o, bool defaultValue = false)
		{
			if ((o == DBNull.Value) || (o == null)) return defaultValue;
			try
			{ return Convert.ToBoolean(o); }
			catch
			{ return defaultValue; }
		}

		public static bool? ParseBoolNull(object o, bool? defaultValue = null)
		{
			if ((o == DBNull.Value) || (o == null)) return defaultValue;
			try
			{ return Convert.ToBoolean(o); }
			catch
			{ return defaultValue; }
		}

		public static bool ParseBool(string s, bool defaultValue = false)
		{
			return s?.ToLower() switch
			{
				"true" => true,
				"yes" => true,
				"1" => true,
				"false" => false,
				"no" => false,
				"0" => false,
				_ => defaultValue
			};
		}





		public static DateTime ParseDate(object o) => ParseDate(o, DateTime.MinValue);
		public static DateTime ParseDate(object o, DateTime defaultValue)
		{
			DateTime? value = ParseDateNull(o);
			return value.HasValue ? value.Value : defaultValue;
		}

		public static DateTime? ParseDateNull(object o)
		{
			if ((o == DBNull.Value) || (o == null)) return null;
			try { return Convert.ToDateTime(o); }
			catch { }
			return null;
		}



	}
}
