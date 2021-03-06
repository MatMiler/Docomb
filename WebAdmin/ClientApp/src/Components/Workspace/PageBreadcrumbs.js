import { Breadcrumb } from '@fluentui/react';
import React from 'react';
import { useHistory } from "react-router-dom";
import { Utils } from '../../Data/Utils';
import { EventBus } from '../../EventBus';
import { LayoutUtils } from '../../LayoutUtils';
const PageBreadcrumbs = () => {
    let pageInfo = LayoutUtils.WindowData.get(LayoutUtils.WindowData.ItemKey.WorkspacePageInfo);
    const history = useHistory();
    function onClick(ev, item) {
        ev.preventDefault();
        history.push(Utils.padWithSlash(item.href, true, false));
        EventBus.dispatch("navChange");
    }
    let breadcrumbs = [];
    if (Utils.arrayHasValues(pageInfo === null || pageInfo === void 0 ? void 0 : pageInfo.breadcrumbs)) {
        for (let x = 0; x < pageInfo.breadcrumbs.length; x++) {
            let item = pageInfo.breadcrumbs[x];
            let isCurrent = (x == pageInfo.breadcrumbs.length - 1);
            let crumb = {
                text: item.name,
                key: item.url,
                isCurrentItem: isCurrent
            };
            if (!isCurrent) {
                crumb.href = "workspace" + item.reactLocalUrl;
                crumb.onClick = onClick;
            }
            breadcrumbs.push(crumb);
        }
    }
    return (React.createElement("div", null,
        React.createElement(Breadcrumb, { items: breadcrumbs, overflowAriaLabel: "More breadcrumbs" })));
};
export default PageBreadcrumbs;
//# sourceMappingURL=PageBreadcrumbs.js.map