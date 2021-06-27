import React from "react";
import ReactDOM from "react-dom";
import { Utils } from "./Data/Utils";
import { FontIcon } from "@fluentui/react";
export var AuthPages;
(function (AuthPages) {
    function prep() {
        let watermarkIcon = Utils.tryGetTrimmedString(window, "watermarkIcon", null);
        if (watermarkIcon != null) {
            const watermarkElement = document.getElementById("pageWatermark");
            ReactDOM.render(React.createElement(FontIcon, { iconName: watermarkIcon }), watermarkElement);
        }
    }
    AuthPages.prep = prep;
})(AuthPages || (AuthPages = {}));
//# sourceMappingURL=AuthPage.js.map