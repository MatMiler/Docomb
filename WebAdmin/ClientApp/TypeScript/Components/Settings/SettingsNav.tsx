import { INavLink, INavLinkGroup, Nav } from "@fluentui/react";
import React, { FC, ReactElement } from "react";
import { useHistory } from "react-router-dom";
import { Utils } from "../../Data/Utils";
import { EventBus } from "../../EventBus";



const SettingsNav: FC<{}> = (): ReactElement => {
	const history = useHistory();
	SettingsNavController.prepData(history);

	return (
		<Nav groups={SettingsNavController.getLinkGroups()} selectedKey={SettingsNavController.getSelectedKey()} onLinkClick={SettingsNavController.onClick} />
	);
};

export default SettingsNav;


module SettingsNavController {

	let historyHandler: any = null;

	export function prepData(history: any): void {
		historyHandler = history;
	}


	let _linkGroups: INavLinkGroup[] = null;
	export function getLinkGroups(): INavLinkGroup[] {
		if (_linkGroups == null) {
			_linkGroups = [
				{
					name: "Security",
					links: [
						{ name: "Users", key: "users", url: "settings/users", icon: "People" }
					]
				}
			];
		}
		return _linkGroups;
	}


	export function getSelectedKey(): string {
		let path = Utils.tryGetTrimmedString(historyHandler, ["location", "pathname"]);
		if (path == null) return null;
		let groups = getLinkGroups();
		if (groups != null) {
			for (let x = 0; x < groups.length; x++) {
				let links = groups[x].links;
				if (links != null) {
					for (let y = 0; y < links.length; y++) {
						if (path == "/" + links[y]?.url)
							return links[y]?.key;
					}
				}
			}
		}

		return null;
	}


	export function onClick(ev: React.MouseEvent<HTMLElement>, item: INavLink) {
		ev.preventDefault();
		historyHandler.push(Utils.padWithSlash(item.url, true, false));
		EventBus.dispatch("navChange");
	}


}
