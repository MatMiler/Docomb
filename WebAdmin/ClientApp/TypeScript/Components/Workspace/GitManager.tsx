import { CommandBar, Dialog, DialogFooter, DialogType, FontIcon, ICommandBarItemProps, mergeStyles, PrimaryButton, Spinner, SpinnerSize, Stack, TextField } from "@fluentui/react";
import React, { FC, ReactElement, useState } from "react";
import { useHistory } from "react-router-dom";
import { useBoolean, IUseBooleanCallbacks } from '@fluentui/react-hooks';
import { Utils } from "../../Data/Utils";
import { Workspaces } from "../../Data/Workspaces";
import { LayoutUtils } from "../../LayoutUtils";
import PageBreadcrumbs from "./PageBreadcrumbs";
import $ from 'jquery';
import { Apis } from "../../Data/Apis";
import OptionsBreadcrumbs from "./OptionsBreadcrumbs";


const GitManager: FC<{}> = (): ReactElement => {

	return (
		<>
			<div className="pageGrid">
				<div className="pageTitle"><OptionsBreadcrumbs path={[{ name: "Git repository", url: "?options=git" }]} /></div>
				<div className="pageContent">
					
				</div>
			</div>
		</>
	);
};

export default GitManager;


module GitController {

	export function prepData(
	): void {
	}

}

