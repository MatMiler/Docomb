import React, { FC, ReactElement } from 'react';
import PageBreadcrumbs from './PageBreadcrumbs';


const ContentFile: FC<{}> = (): ReactElement => {

	return (
		<div className="pageGrid">
			<div className="pageTitle"><PageBreadcrumbs /></div>
			{/*<div className="pageCommands">command bar</div>*/}
			<div className="pageContent">Content file</div>
		</div>
	);
};

export default ContentFile;
