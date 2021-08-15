# Docomb [![Admin NuGet](https://img.shields.io/nuget/v/Docomb.WebAdmin.svg?label=admin+nuget)](https://www.nuget.org/packages/Docomb.WebAdmin/) [![Admin NuGet](https://img.shields.io/nuget/v/Docomb.WebReader.svg?label=reader+nuget)](https://www.nuget.org/packages/Docomb.WebReader/)

Docomb is a simple content management system for Markdown files, intended primarily for managing documentations. It is packaged as a library, rather than a finished solution, so it is easier to adapt to specific requirements.


## Characteristics
- Separate reader & admin interfaces
- File management with editor for Markdown and TXT files
- Multiple document workspaces
- External authentication with Facebook, Google, and Microsoft account
- Saves changes to Git


---

## Installation & Configuration

### Basic implementation
1. Create a new empty ASP.NET 5.0 project.
2. Add [Docomb.WebReader](https://www.nuget.org/packages/Docomb.WebReader/) and [Docomb.WebAdmin](https://www.nuget.org/packages/Docomb.WebAdmin/) NuGet packages to the project. (The packages can be used either together or alone.)
3. In `Startup.cs` file add the following:
	- Among the using statements:
		```
		using Docomb.WebAdmin;
		using Docomb.WebReader;
		```
	- In `ConfigureServices` function:
		```
		services.AddDocombAdmin();
		services.AddDocombReader();
		```
	- In `Configure` function:
		```
		app.UseDocombAdmin();
		app.UseDocombReader();
		app.UseRouting();
		app.UseStaticFiles();
		app.UseEndpoints(endpoints =>
		{
			endpoints.MapControllers();
			endpoints.MapRazorPages();
		});
		```
4. Prepare configuration files and save them to the directory from where the project will run.

### Configuration: `config.json`
Example:
```
{
	"name": "Site title",
	"authentication":
	{
		"authorizeAdmin": true,
		"authorizeReader": true,
		"schemes":
		[
			{
				"type": "MicrosoftAccount",
				"name": null,
				"clientId": "••••••••",
				"clientSecret": "••••••••"
			},
			{
				"type": "Facebook",
				"appId": "••••••••",
				"appSecret": "••••••••"
			},
			{
				"type": "Google",
				"clientId": "••••••••",
				"clientSecret": "••••••••"
			}
		],
		"users":
		{
			"admin": [ "email@example.com" ],
			"editor": [],
			"reader": []
		}
	},
	"credentials": [
		{
			"key": "GitCredentials1",
			"username": "••••••••",
			"password": "••••••••"
		}
	]
}
```

| Value                            | Type         | Description |
| -------------------------------- | ------------ | --- |
| `name`                           | string       | Displayed name of the web site. |
| `authentication`                 | object      | Configiration for external authentication. |
| `authentication.authorizeAdmin`  | boolean      | Whether admin interface requires authorization. |
| `authentication.authorizeReader` | boolean      | Whether reader interface requires authorization. |
| `authentication.schemes`         | object array | Authentication schemes. |
| `authentication.schemes[].type`  | `"MicrosoftAccount"`, `"Facebook"`, `"Google"` | Identity provider to use. |
| `authentication.schemes[].name`  | string       | (Optional) Button label for the authentication, if using two or more schemes with the same identity provider. |
| `authentication.schemes[].clientId`<br/>`authentication.schemes[].clientSecret`  | string | App authentication for Microsoft and Google accounts |
| `authentication.schemes[].appId`<br/>`authentication.schemes[].appSecret`  | string | App authentication for Facebook accounts |
| `authentication.users`           | object       | Hardcoded users access, which cannot be removed in admin interface. |
| `authentication.users.admin`     | string array | Hardcoded administrators |
| `authentication.users.editor`    | string array | Hardcoded editors |
| `authentication.users.reader`    | string array | Hardcoded readers |
| `credentials`                    | object array | Username & password pairs, needed for Git repository. |
| `credentials[].key`              | string       | Credential key, referenced in Git configuration in workspaces. |
| `credentials[].username`         | string       | Username. |
| `credentials[].password`         | string       | Password. |

### Configuration: `workspaces.json`
Example:
```
[
	{
		"name": "Docs",
		"urlPath": "docs1",
		"storagePath": "/file/storage/path",
		"icon": "Documentation",
		"git": {
			"repository": "https://github.com/••••••••/••••••••.git",
			"credentialsKey": "GitCredentials1",
			"branch": "main",
			"commiterName": "Docomb",
			"commiterEmail": "@Docomb",
			"clone": true,
			"syncInterval": 15
		}
	}
]
```
| Value                   | Type   | Description |
| ----------------------- | ------ | --- |
| `[].name`               | string | Display name of the workspace. |
| `[].urlPath`            | string | URL path (within the web site) of the workspace. Leave blank if the workspace is the only one or should be the default. |
| `[].storagePath`        | string | Path of the directory where the workspace's documents are saved. |
| `[].icon`               | string | Icon of the workspace, used in admin interface. If left empty, the fist character of the name will be used. |
| `[].git`                | object | Git configuration, if any. |
| `[].git.repository`     | string | Git repository |
| `[].git.credentialsKey` | string | Key of the authentication credentials to use (from `config.json`). |
| `[].git.branch`         | string | Branch to pull/push. |
| `[].git.commiterName`   | string | Name of the entity that commits to Git. |
| `[].git.commiterEmail`  | string | Email of the entity that commits to Git. |
| `[].git.clone`  | boolean | Whether the workspace should be cloned from Git if not yet locally available. |
| `[].git.syncInterval`  | integer | If specified, it represents the interval in minutes of how often the Git repository should be synchronized with the remote. Minimal value is `5`. `0`, negative value or no value will disable synchronization.  |

### Configuration: `users.json`
This file will be managed by admin interface, and does not need to be kept up-to-date manually.

Example:
```
{
	"none": [ "guest@example.com" ],
	"reader": [ "*@example.com", "user@test.org" ],
	"editor": [],
	"admin": [ "admin@example.com" ]
}
```
| Value    | Type         | Description |
| -------- | ------------ | --- |
| `none`   | string array | Users with no access. Useful as an exception to an access granted with wildcard username. |
| `reader` | string array | Users who can only read content. |
| `editor` | string array | Users who can read and edit content. |
| `admin`  | string array | Administrators, who can also manage users. |

If a user is listed in multiple groups, the highest access level will be used. An exact match will take priority over a wildcard match.

