import { Breadcrumb } from '@fluentui/react';
import React from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { EventBus } from '../../EventBus';
import { LayoutUtils } from '../../LayoutUtils';
const OptionsBreadcrumbs = ({ path }) => {
    const history = useHistory();
    function onClick(ev, item) {
        ev.preventDefault();
        history.push(Utils.padWithSlash(item.href, true, false));
        EventBus.dispatch("navChange");
    }
    let workspace = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspaceData);
    let breadcrumbs = [];
    path = [{ name: workspace.name, url: null }].concat(path);
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
                crumb.href = "workspace" + (workspace === null || workspace === void 0 ? void 0 : workspace.reactLocalUrl) + Utils.parseString(item.url, "");
                crumb.onClick = onClick;
            }
            breadcrumbs.push(crumb);
        }
    }
    return (React.createElement("div", null,
        React.createElement(Breadcrumb, { items: breadcrumbs, overflowAriaLabel: "More breadcrumbs" })));
};
export default OptionsBreadcrumbs;
//# sourceMappingURL=OptionsBreadcrumbs.js.map