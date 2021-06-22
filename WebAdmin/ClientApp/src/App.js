import React, { Component } from 'react';
import { Route } from 'react-router';
import { Home } from './Components/Home';
import { Settings } from './Components/Settings';
import { WorkspaceWrapper } from './Components/WorkspaceWrapper';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
initializeIcons();
export default class App extends Component {
    render() {
        return (React.createElement("div", null,
            React.createElement(Route, { exact: true, path: '/', component: Home }),
            React.createElement(Route, { exact: true, path: '/settings', component: Settings }),
            React.createElement(Route, { exact: true, path: '/workspace/:itemPath+', component: WorkspaceWrapper })));
    }
}
//# sourceMappingURL=App.js.map