var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ContextualMenu, DirectionalHint, FontIcon } from "@fluentui/react";
import React, { useState } from "react";
import { Users } from "../Data/Users";
const SideBarUser = () => {
    const [username, setUsername] = useState("User");
    const [menuIsVisible, setMenuIsVisible] = React.useState(false);
    const showMenu = React.useCallback(() => setMenuIsVisible(true), []);
    const hideMenu = React.useCallback(() => setMenuIsVisible(false), []);
    const linkRef = React.useRef(null);
    SideBarUserController.prepData(setUsername);
    return SideBarUserController.hasUser() ? (React.createElement("div", { className: "sideBarItem", title: SideBarUserController.name + "\n" + SideBarUserController.username },
        React.createElement("a", { ref: linkRef, onClick: showMenu },
            React.createElement("span", { className: "icon", "aria-hidden": "true" },
                React.createElement(FontIcon, { iconName: "Contact" })),
            React.createElement("span", { className: "name" }, SideBarUserController.name)),
        React.createElement(ContextualMenu, { items: SideBarUserController.getMenuItems(), hidden: !menuIsVisible, target: linkRef, onItemClick: hideMenu, onDismiss: hideMenu, isBeakVisible: true, directionalHint: DirectionalHint.topCenter }))) : null;
};
export default SideBarUser;
var SideBarUserController;
(function (SideBarUserController) {
    let setUsernameCallback = null;
    SideBarUserController.username = "User";
    SideBarUserController.name = "User";
    SideBarUserController.userInfo = null;
    function prepData(setUsername) {
        setUsernameCallback = setUsername;
        load();
    }
    SideBarUserController.prepData = prepData;
    function hasUser() {
        switch (SideBarUserController.userInfo === null || SideBarUserController.userInfo === void 0 ? void 0 : SideBarUserController.userInfo.globalAccess) {
            case Users.UserAccessLevel.Admin: return true;
            case Users.UserAccessLevel.Editor: return true;
            case Users.UserAccessLevel.Reader: return true;
            case Users.UserAccessLevel.None: return false;
            default: return false;
        }
    }
    SideBarUserController.hasUser = hasUser;
    function getMenuItems() {
        let items = [
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
    SideBarUserController.getMenuItems = getMenuItems;
    function load() {
        return __awaiter(this, void 0, void 0, function* () {
            SideBarUserController.userInfo = yield Users.loadUserInfo();
            SideBarUserController.username = SideBarUserController.userInfo === null || SideBarUserController.userInfo === void 0 ? void 0 : SideBarUserController.userInfo.username;
            SideBarUserController.name = SideBarUserController.userInfo === null || SideBarUserController.userInfo === void 0 ? void 0 : SideBarUserController.userInfo.name;
            setUsernameCallback(SideBarUserController.username);
        });
    }
})(SideBarUserController || (SideBarUserController = {}));
//# sourceMappingURL=SideBarUser.js.map