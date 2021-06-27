﻿import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from '../src/registerServiceWorker';
import { Utils } from './Data/Utils';
import { AuthPages } from './AuthPage';

const baseUrl = window["basePath"];
const rootElement = document.getElementById('root');

if (window["layoutType"] == "admin") {
	ReactDOM.render(
		<BrowserRouter basename={baseUrl}>
			<App />
		</BrowserRouter>,
		rootElement);
}
if (window["layoutType"] == "auth") {
	AuthPages.prep();
//	let watermarkIcon = Utils.tryGetTrimmedString(window, "watermarkIcon", null);
//	if (watermarkIcon != null) {
//		ReactDOM.render(
//			,
//			rootElement);
//	}
}

registerServiceWorker();
