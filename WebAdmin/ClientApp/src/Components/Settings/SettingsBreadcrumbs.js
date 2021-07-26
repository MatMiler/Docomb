import { Breadcrumb } from '@fluentui/react';
import React from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { EventBus } from '../../EventBus';
const SettingsBreadcrumbs = ({ path }) => {
    const history = useHistory();
    function onClick(ev, item) {
        ev.preventDefault();
        history.push(Utils.padWithSlash(item.href, true, false));
        EventBus.dispatch("navChange");
    }
    let breadcrumbs = [];
    path = [{ name: "Settings", url: "" }].concat(path);
    if (Utils.arrayHasValues(path)) {
        for (let x = 0; x < path.length; x++) {
            let item = path[x];
            let isCurrent = (x == path.length - 1);
            let crumb = {
                text: item.name,
                key: item.url,
                isCurrentItem: isCurrent
            };
            if (!isCurrent) {
                crumb.href = "settings" + item.url;
                crumb.onClick = onClick;
            }
            breadcrumbs.push(crumb);
        }
    }
    return (React.createElement("div", null,
        React.createElement(Breadcrumb, { items: breadcrumbs, overflowAriaLabel: "More breadcrumbs" })));
};
export default SettingsBreadcrumbs;
//# sourceMappingURL=SettingsBreadcrumbs.js.map