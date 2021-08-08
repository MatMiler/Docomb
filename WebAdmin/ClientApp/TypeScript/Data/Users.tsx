import { Apis } from "./Apis";
import { SessionCache } from "./SessionCache";
import { Utils } from "./Utils";


export module Users {

	export enum UserAccessLevel {
		None = "None",
		Reader = "Reader",
		Editor = "Editor",
		Admin = "Admin"
	}
	export function getUserAccessLevelName(level: UserAccessLevel): string {
		switch (level) {
			case UserAccessLevel.Admin: return "Administrator";
			case UserAccessLevel.Editor: return "Editor";
			case UserAccessLevel.Reader: return "Reader";
			case UserAccessLevel.Admin: return "Admin";
			case UserAccessLevel.None: return "No access";
			default: return level;
		}
	}

	export class UserInfo {
		public username: string;
		public name: string;
		public globalAccess: UserAccessLevel;

		public constructor(source: string) {
			this.username = Utils.tryGetString(source, "username");
			this.name = Utils.tryGetString(source, "name");
			this.globalAccess = Utils.tryGetEnum(source, "globalAccess", UserAccessLevel, UserAccessLevel.None);
		}
	}

	export async function loadUserInfo(): Promise<UserInfo> {
		let data: any = await Apis.fetchJsonAsync("api/users/userInfo", true, { expiry: 120000 });
		let item: UserInfo = new UserInfo(data);
		return (item != null) ? item : null;
	}


	export type UserLevels = { [key: string]: UserAccessLevel };

	export async function loadGlobalUsers(): Promise<Apis.DataWithStatus<UserLevels>> {
		let source: any = await Apis.fetchJsonAsync("api/users/globalUsers/list", false);
		let actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
		let list: UserLevels = Utils.mapObjectValues<UserAccessLevel>(Utils.tryGet(source, "data"), x => Utils.parseEnum(x, UserAccessLevel, UserAccessLevel.None), null, false);
		return new Apis.DataWithStatus(actionStatus, list);
	}


	export class UserChange {
		public username: string;
		public accessLevel: UserAccessLevel;
		public change: UserChangeCommand;

		public constructor(username: string, accessLevel: UserAccessLevel, change: UserChangeCommand) {
			this.username = username;
			this.accessLevel = accessLevel;
			this.change = change;
		}
	}

	export enum UserChangeCommand {
		None = "None",
		Add = "Add",
		Update = "Update",
		Remove = "Remove"
	}


	export async function changeGlobalUsers(changes: UserChange[]): Promise<Apis.DataWithStatus<UserLevels>> {
		let source = await Apis.postJsonAsync("api/users/globalUsers/update", changes);
		let actionStatus = new Apis.ActionStatus(Utils.tryGet(source, "actionStatus"));
		let list: UserLevels = Utils.mapObjectValues<UserAccessLevel>(Utils.tryGet(source, "data"), x => Utils.parseEnum(x, UserAccessLevel, UserAccessLevel.None), null, false);
		//SessionCache.remove("api/users/globalUsers/list");
		return new Apis.DataWithStatus(actionStatus, list);
	}

}