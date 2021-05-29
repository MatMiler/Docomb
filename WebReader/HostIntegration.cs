using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Docomb.WebReader
{
	class ConfigureOptions : IPostConfigureOptions<StaticFileOptions>
	{
		private readonly IWebHostEnvironment _environment;

		public ConfigureOptions(IWebHostEnvironment environment)
		{
			_environment = environment;
		}

		public void PostConfigure(string name, StaticFileOptions options)
		{

			// Basic initialization in case the options weren't initialized by any other component
			options.ContentTypeProvider ??= new FileExtensionContentTypeProvider();

			if (options.FileProvider == null && _environment.WebRootFileProvider == null)
			{
				throw new InvalidOperationException("Missing FileProvider.");
			}

			options.FileProvider ??= _environment.WebRootFileProvider;


			// Add our provider
			var filesProvider = new ManifestEmbeddedFileProvider(GetType().Assembly, "wwwroot");
			options.FileProvider = new CompositeFileProvider(options.FileProvider, filesProvider);
		}
	}


	public static class ServiceCollectionExtensions
	{
		public static void AddDocomReader(this IServiceCollection services)
		{
			services.ConfigureOptions(typeof(ConfigureOptions));
		}
	}

}
