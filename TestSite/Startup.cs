using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Docomb.WebReader;
using Docomb.WebAdmin;
//using Microsoft.Net.Http.Headers;

namespace TestSite
{
	public class Startup
	{
		// This method gets called by the runtime. Use this method to add services to the container.
		// For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
		public void ConfigureServices(IServiceCollection services)
		{
			services.AddRazorPages();
			services.AddDocombAdmin();
			services.AddDocombReader();
			services.AddMvc();

			//services.AddCors(options =>
			//{
			//	options.AddPolicy("CorsPolicy1", builder =>
			//	{
			//		builder.WithMethods("POST", "GET", "PUT", "DELETE").WithHeaders(HeaderNames.ContentType);
			//	});
			//});
		}

		// This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
		public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
		{
			if (env.IsDevelopment())
			{
				app.UseDeveloperExceptionPage();
			}

			//app.UseCors("CorsPolicy1");

			app.UseDocombAdmin();

			app.UseStaticFiles();

			app.UseRouting();
			app.UseEndpoints(endpoints =>
			{
				endpoints.MapControllers();
				endpoints.MapRazorPages();
			});


			//app.UseEndpoints(endpoints =>
			//{
			//	endpoints.MapGet("/", async context =>
			//	{
			//		await context.Response.WriteAsync("Hello World!");
			//	});
			//});
		}
	}
}
