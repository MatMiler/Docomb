import { Apis } from "./Apis";
import { Utils } from "./Utils";


export module Users {

	export enum UserAccessLevel {
		None = "None",
		Reader = "Reader",
		Editor = "Editor",
		Admin = "Admin"
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
		let data: any = await Apis.fetchJsonAsync("api/general/userInfo", true);
		let item: UserInfo = new UserInfo(data);
		return (item != null) ? item : null;
	}

}