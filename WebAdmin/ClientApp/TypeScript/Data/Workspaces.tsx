import { Apis } from './Apis';
import { Utils } from './Utils';

export module Workspaces {
	/** Load a list of workspaces */
	export async function load(): Promise<Array<Workspace>> {
		let list: Array<Workspace> = [];
		let data = await Apis.fetchJsonAsync("api/general/workspaces", true);
		if (Utils.ArrayHasValues(data)) {
			for (let x = 0; x < data.length; x++) {
				let item: Workspace = new Workspace(data[x]);
				if ((item != null) && (item.isValid() == true))
					list.push(item);
			}
		}

		return list;
	}
}





/** Workspace information */
export class Workspace {
	/** Name of the workspace (site name) */
	public name: string = null;
	/** URL of the workspace */
	public url: string = null;
	/** Local URL of the workspace for React */
	public localUrl: string = null;
	/** Initials to display as icon if icon is missing */
	public initials: string = null;
	/** Representation of the workspace */
	public icon: string = null;

	/** Quick check if data is valid */
	public isValid(): boolean {
		return ((typeof this.name == "string") && (this.name.length > 0) && (typeof this.url == "string") && (this.url.length > 0));
	}

	public constructor(source: any) {
		this.name = Utils.TryGetString(source, "name");
		this.url = Utils.TryGetString(source, "url");
		this.localUrl = Utils.TryGetString(source, "localUrl");
		this.initials = Utils.TryGetString(source, "initials");
		this.icon = Utils.TryGetString(source, "icon");
	}
}