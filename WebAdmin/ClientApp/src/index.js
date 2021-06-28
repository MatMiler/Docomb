import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from '../src/registerServiceWorker';
const baseUrl = window["basePath"];
const rootElement = document.getElementById('root');
if (window["layoutType"] == "admin") {
    ReactDOM.render(React.createElement(BrowserRouter, { basename: baseUrl },
        React.createElement(App, null)), rootElement);
}
registerServiceWorker();
//# sourceMappingURL=index.js.map