import React, { Component } from 'react';
import { Route } from 'react-router';
import { Home } from './Components/Home';
import { Settings } from './Components/Settings';
import GlobalUsers from './Components/Settings/GlobalUsers';
import { WorkspaceWrapper } from './Components/WorkspaceWrapper';


export default class App extends Component {
	render() {
		return (
			<div>
				<Route exact path='/' component={Home} />
				<Route exact path='/settings' component={Settings} />
				<Route exact path='/settings/users' component={GlobalUsers} />
				<Route exact path='/workspace' component={WorkspaceWrapper} />
				<Route exact path='/workspace/:itemPath+' component={WorkspaceWrapper} />
			</div>
		);
	}
}
