import { Nav } from "@fluentui/react";
import React from "react";
import { useHistory } from "react-router-dom";
import { Utils } from "../../Data/Utils";
import { EventBus } from "../../EventBus";
const SettingsNav = () => {
    const history = useHistory();
    SettingsNavController.prepData(history);
    return (React.createElement(Nav, { groups: SettingsNavController.getLinkGroups(), selectedKey: SettingsNavController.getSelectedKey(), onLinkClick: SettingsNavController.onClick }));
};
export default SettingsNav;
var SettingsNavController;
(function (SettingsNavController) {
    let historyHandler = null;
    function prepData(history) {
        historyHandler = history;
    }
    SettingsNavController.prepData = prepData;
    let _linkGroups = null;
    function getLinkGroups() {
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
    SettingsNavController.getLinkGroups = getLinkGroups;
    function getSelectedKey() {
        var _a, _b;
        let path = Utils.tryGetTrimmedString(historyHandler, ["location", "pathname"]);
        if (path == null)
            return null;
        let groups = getLinkGroups();
        if (groups != null) {
            for (let x = 0; x < groups.length; x++) {
                let links = groups[x].links;
                if (links != null) {
                    for (let y = 0; y < links.length; y++) {
                        if (path == "/" + ((_a = links[y]) === null || _a === void 0 ? void 0 : _a.url))
                            return (_b = links[y]) === null || _b === void 0 ? void 0 : _b.key;
                    }
                }
            }
        }
        return null;
    }
    SettingsNavController.getSelectedKey = getSelectedKey;
    function onClick(ev, item) {
        ev.preventDefault();
        historyHandler.push(Utils.padWithSlash(item.url, true, false));
        EventBus.dispatch("navChange");
    }
    SettingsNavController.onClick = onClick;
})(SettingsNavController || (SettingsNavController = {}));
//# sourceMappingURL=SettingsNav.js.map