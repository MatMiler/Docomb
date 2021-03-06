using Docomb.WebCore;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Docomb.WebAdmin
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
		public static void AddDocombAdmin(this IServiceCollection services)
		{
			services.AddMvc().AddJsonOptions(options =>
			{
				options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
			});
			services.ConfigureOptions(typeof(ConfigureOptions));

			if (WebCore.Configurations.MainConfig.Instance?.Authentication?.AuthorizeAdmin == true)
				WebCore.Configurations.MainConfig.Instance?.Authentication?.AddAuthentications(services, $"/{WebCore.Configurations.UiConfig.UrlPathPrefix}/account/login");

			WebCore.Configurations.UiConfig.SetHasAdmin(true);

			services.AddDocombCore();
		}

		public static void UseDocombAdmin(this IApplicationBuilder app)
		{
			app.UseDocomb();
		}
	}

}
