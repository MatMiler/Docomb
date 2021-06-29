import { ContextualMenu, DirectionalHint, FontIcon, IContextualMenuItem } from "@fluentui/react";
import React, { FC, ReactElement, useState } from "react";
import { Users } from "../Data/Users";


const SideBarUser: FC<{}> = (): ReactElement => {

	const [username, setUsername] = useState("User");
	const [menuIsVisible, setMenuIsVisible] = React.useState(false);
	const showMenu = React.useCallback(() => setMenuIsVisible(true), []);
	const hideMenu = React.useCallback(() => setMenuIsVisible(false), []);
	const linkRef = React.useRef(null);

	SideBarUserController.prepData(setUsername);

	return (
		<div className="sideBarItem" title={SideBarUserController.name + "\n" + SideBarUserController.username}>
			<a ref={linkRef} onClick={showMenu}>
				<span className="icon" aria-hidden="true"><FontIcon iconName="Contact" /></span>
				<span className="name">{SideBarUserController.name}</span>
			</a>
			<ContextualMenu items={SideBarUserController.getMenuItems()} hidden={!menuIsVisible} target={linkRef} onItemClick={hideMenu} onDismiss={hideMenu} isBeakVisible={true} directionalHint={DirectionalHint.topCenter} />
		</div>
	);
};

export default SideBarUser;


module SideBarUserController {

	let setUsernameCallback: React.Dispatch<React.SetStateAction<string>> = null;

	export let username: string = "User";
	export let name: string = "User";
	export let userInfo: Users.UserInfo = null;

	export function prepData(
		setUsername: React.Dispatch<React.SetStateAction<string>>
	): void {

		setUsernameCallback = setUsername;

		load();
	}


	export function getMenuItems(): IContextualMenuItem[] {
		let items: IContextualMenuItem[] = [
			{
				key: "switchUser",
				text: "Switch user",
				href: "account/switch",
				iconProps: { iconName: "Switch" }
			},
			{
				key: "logout",
				text: "Log out",
				href: "account/logout",
				iconProps: { iconName: "SignOut" }
			}
		];

		return items;
	}


	async function load(): Promise<void> {
		userInfo = await Users.loadUserInfo();
		username = userInfo?.username;
		name = userInfo?.name;
		setUsernameCallback(username);
	}

}
