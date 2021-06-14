import React, { FC, ReactElement } from 'react';
import PageBreadcrumbs from './PageBreadcrumbs';


const WorkspaceHome: FC<{}> = (): ReactElement => {

	return (
		<div className="pageGrid">
			<div className="pageTitle"><PageBreadcrumbs /></div>
			{/*<div className="pageCommands">command bar</div>*/}
			<div className="pageContent"></div>
		</div>
	);
};

export default WorkspaceHome;
