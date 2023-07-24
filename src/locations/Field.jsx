import { useEffect, useState, useMemo, useCallback } from 'react';
import { Spinner, Note, Stack, TextLink, TextInput, FormControl } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import getEntryTitleField  from '../lib/utils/getEntryTitleField';
import useCMA from '../lib/hooks/useCMA';

const DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' };
const POLLING_INTERVAL = 5000;


const Field = () => {

	const sdk = useSDK();
	const {
		isLoading,
		space,
		environment
	} = useCMA();
	const [entryValues, setEntryValues] = useState({});
	const locale = sdk.locales.default;
	const window = sdk.window;
	const fieldIds = useMemo(() => sdk.parameters.instance.fieldIds.split(',').map((fieldId) => fieldId.trim()), [sdk]);
	const fieldsMetadata = fieldIds.map((fieldId) => sdk.contentType.fields.find(({ id }) => id === fieldId)).filter((field) => field);
	const fields = useMemo(() => {
		return fieldIds.map((fieldId) => {
			const field = sdk.entry.fields[fieldId];
			return field;
		})
		.filter((field) => field);
	}, [sdk, fieldIds]);

	const titleFieldCallback = useCallback((values = [], fieldId = '') => {

		if (!environment) return;
	
		const promises = values.map((value) => {

			const {
				id
			} = value?.sys || {};

			return getEntryTitleField(environment, id);

		})

		const wrappedPromises = promises.map(p => Promise.resolve(p).then(
            value => ({ status: 'fulfilled', ...value }),
            error => ({ status: 'rejected', error })));
        
        Promise.all(wrappedPromises).then((titles) => {

			const newTitle = titles.filter((title) => title.status === 'fulfilled' && title[locale] ).map((title) => title[locale]).join(' - ');

			setEntryValues((prev) => {
		
				if (prev[fieldId] !== newTitle) {
					return {
						...prev,
						[fieldId]: newTitle
					}
				};
	
				return prev
	
			});
        }).catch((error) => {
		});

	}, [environment, locale]);

	const notFound = fieldIds.filter((fieldId) => !sdk.entry.fields[fieldId]);

	useEffect(() => {
		window.startAutoResizer();
		return () => window.stopAutoResizer();
	}, [window]);


	useEffect(() => {

		const intervals = [];

		fields.forEach((field) => {

			//static fields (references)
			if (field.type === 'Link' || (field.type === 'Array' && field.items.type === 'Link')) {

				field.onValueChanged(() => {
					const values = field.type === 'Link' ? [field.getValue()] : field.getValue();
					titleFieldCallback(values, field.id);
				});

				const interval = setInterval(() => {
					const values = field.type === 'Link' ? [field.getValue()] : field.getValue();
					titleFieldCallback(values, field.id);
				}, POLLING_INTERVAL);

				intervals.push(interval);
				return;

			}

			//normal fields
			field.onValueChanged(() => {

				if (field.type === 'Date' && field.getValue()) {
					const date = new Date(field.getValue());
					setEntryValues((prev) => ({
						...prev,
						[field.id]: date.toLocaleDateString(
							locale,
							DATE_FORMAT
						),
					}));
					return;
				}

				if (field.type === 'Array') {
					setEntryValues((prev) => ({
						...prev,
						[field.id]: field.getValue() ? field.getValue().join(' - ') : null,
					}));
					return;
				}

				setEntryValues((prev) => ({
					...prev,
					[field.id]: field.getValue(),
				}));
			
			});
		});


		return () => {
			setEntryValues({});
			intervals.forEach((interval) => clearInterval(interval));
		};
		
	}, [space, fields, locale, setEntryValues, titleFieldCallback])



	const result = fieldIds.map((fieldId) => entryValues[fieldId] || null);
	const resultFiltered = result.filter((value) => value);
	const joined = resultFiltered.join(' - ');

	//set the value only if it is different and all relevant fields are found
	if (joined !== sdk.field.getValue() && fieldIds.length - notFound.length === Object.keys(entryValues).length) {
		//console.log('setting value');
		sdk.field.setValue(joined);
	}
	
	if (isLoading) {
		return <Spinner />
	}

	if (!sdk.parameters.instance.hasOwnProperty('fieldIds')) {
		return (
			<Note variant='negative' style={{ width: '100%' }}>
				Your app definition has no instance parameter <strong>fieldIds</strong>{' '}
				😫
				<br />
				<TextLink
					href={`https://app.contentful.com/account/organizations/${sdk.ids.organization}/apps/definitions/${sdk.ids.app}/general`}
					target='_blank'
					rel='noopener noreferrer'
				>
					Please add it here
				</TextLink>
			</Note>
		);
	}

	if (fields.length === 0) {
		return (
			<Note variant='negative' style={{ width: '100%' }}>
				<strong>No autotitle field-Ids were found!</strong> 😱 <br />
				Please define correct field-Ids in the content model (entry title {`>`}{' '}
				appearance) or remove the app <em>Auto Title</em> from there.
			</Note>
		);
	}

	return (
		<Stack flexDirection='column' spacing='spacingS'>
			<div style={{ width: '100%' }}>
				<TextInput
					value={sdk.field.getValue()}
					type='text'
					name='autotitle'
					isDisabled={true}
				/>
				<FormControl.HelpText>
					The entry title is auto-generated using{' '}
					<strong>{fieldsMetadata.map(({ name }) => name).join(' - ')}</strong>
				</FormControl.HelpText>
			</div>

			{notFound.length > 0 && (
				<Note variant='negative' style={{ width: '100%' }}>
					Some autotitle field-Ids were not found:{' '}
					<strong>{notFound.join(' ')}</strong>
					<br />
					Please define correct field-Ids in the content model (entry title{' '}
					{`>`} appearance) 😀
				</Note>
			)}
		</Stack>
	);
};

export default Field;
