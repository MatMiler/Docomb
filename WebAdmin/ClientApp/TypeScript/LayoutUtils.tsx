import { Utils } from "./Data/Utils";

export module LayoutUtils {
	export module NavBar {
		export enum ItemKey {
			Home = "home",
			Settings = "settings"
		}

		export function updateNavBar() {
			this.setState();
		}
	}


	export module WindowData {

		export const windowProperty: string = "docombProp";

		export enum ItemKey {
			SelectedSideBarItem = "selectedSideBarItem"
		}


		export function get(key: ItemKey): string {
			return Utils.TryGetString(window, [windowProperty, key]);
		}

		export function set(key: ItemKey, value: string): void {
			if (window[windowProperty] == null)
				window[windowProperty] = {};
			window[windowProperty][key] = value;
		}


	}

}

