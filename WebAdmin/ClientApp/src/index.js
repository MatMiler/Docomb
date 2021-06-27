import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from '../src/registerServiceWorker';
import { AuthPages } from './AuthPage';
const baseUrl = window["basePath"];
const rootElement = document.getElementById('root');
if (window["layoutType"] == "admin") {
    ReactDOM.render(React.createElement(BrowserRouter, { basename: baseUrl },
        React.createElement(App, null)), rootElement);
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
//# sourceMappingURL=index.js.map