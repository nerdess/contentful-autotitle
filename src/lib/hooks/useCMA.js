import { useEffect, useState } from 'react';
import { useSDK } from '@contentful/react-apps-toolkit';
import { createClient } from 'contentful-management';

const useCMA = () => {
	const sdk = useSDK();
	const [space, setSpace] = useState();
	const [environment, setEnvironment] = useState();

	useEffect(() => {
		const cma = createClient({ apiAdapter: sdk.cmaAdapter });

		cma.getSpace(sdk.ids.space).then((space) => {
			
			setSpace(space);

			space.getEnvironment(sdk.ids.environment).then((environment) => {
				setEnvironment(environment);
			});
		});
	}, [sdk]);

	return {
		isLoading: !space || !environment,
		space,
		environment,
	};
};

export default useCMA;
