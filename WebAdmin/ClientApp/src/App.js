import React, { Component } from 'react';
import { Route } from 'react-router';
import { Layout } from './Components/Layout';
import { Home } from './Components/Home';

import { initializeIcons } from '@fluentui/font-icons-mdl2';
initializeIcons();

export default class App extends Component {
	render() {
		return (
			<Layout>
				<Route exact path='/_admin' component={Home} />
			</Layout>
		);
	}
}
