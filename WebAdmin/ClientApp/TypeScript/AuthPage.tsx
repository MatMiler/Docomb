import React from "react";
import ReactDOM from "react-dom";
import { Utils } from "./Data/Utils";
import { FontIcon } from "@fluentui/react";


export module AuthPages {
	export function prep(): void {
		let watermarkIcon = Utils.tryGetTrimmedString(window, "watermarkIcon", null);
		if (watermarkIcon != null) {
			const watermarkElement = document.getElementById("pageWatermark");
			ReactDOM.render(<FontIcon iconName={watermarkIcon} />, watermarkElement);
		}
	}
}