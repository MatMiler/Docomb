import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const baseUrl = window["basePath"];
const rootElement = document.getElementById('root');

ReactDOM.render(
	<BrowserRouter basename={baseUrl}>
		<App />
	</BrowserRouter>,
	rootElement);

registerServiceWorker();

