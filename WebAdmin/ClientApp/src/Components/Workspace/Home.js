import { FontIcon } from '@fluentui/react';
import React from 'react';
import PageBreadcrumbs from './PageBreadcrumbs';
const WorkspaceHome = () => {
    return (React.createElement("div", { className: "pageGrid" },
        React.createElement("div", { className: "pageTitle" },
            React.createElement(PageBreadcrumbs, null)),
        React.createElement("div", { className: "pageContent" },
            React.createElement("div", { className: "emptyPage" },
                React.createElement("div", { className: "watermark" },
                    React.createElement(FontIcon, { iconName: "Dictionary" }))))));
};
export default WorkspaceHome;
//# sourceMappingURL=Home.js.map