import React, { Component } from 'react';
import { Pivot, PivotItem } from '@fluentui/react';


export const MainNav: React.FunctionComponent = () => {
	{
		return (
			<Pivot>
				<PivotItem headerText="Content" >
					Workspace content
				</PivotItem>
				<PivotItem headerText="Options" >
					Workspace options
				</PivotItem>
			</Pivot>
		);
	}
}
