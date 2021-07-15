import React from "react";
import OptionsBreadcrumbs from "./OptionsBreadcrumbs";
const GitManager = () => {
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "pageGrid" },
            React.createElement("div", { className: "pageTitle" },
                React.createElement(OptionsBreadcrumbs, { path: [{ name: "Git repository", url: "?options=git" }] })),
            React.createElement("div", { className: "pageContent" }))));
};
export default GitManager;
var GitController;
(function (GitController) {
    function prepData() {
    }
    GitController.prepData = prepData;
})(GitController || (GitController = {}));
//# sourceMappingURL=GitManager.js.map