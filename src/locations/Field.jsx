import { useEffect, useState, useMemo, useCallback } from 'react';
import { Spinner, Note, Stack, TextLink, TextInput, FormControl } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import getEntryTitleField  from '../lib/utils/getEntryTitleField';
import getNavigatorLanguage from '../lib/utils/getNavigatorLanguage';
import useCMA from '../lib/hooks/useCMA';

const DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' };
const POLLING_INTERVAL = 5000;

const getValue = (field) => {

	if (field.type === 'Date' && field.getValue()) {
		const date = new Date(field.getValue());
		return date.toLocaleDateString(getNavigatorLanguage(), DATE_FORMAT);
		
	}
	return field.getValue();
}


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

	const setTitleField = useCallback((entryId, fieldId, setEntryValues) => {

		if (!environment) return;

		if (!entryId) {
			setEntryValues((prev) => ({
				...prev,
				[fieldId]: null
			}));
			return;
		}
	
		getEntryTitleField(environment, entryId).then((titleField) => {
	
			const newTitle = titleField ? titleField[locale] : null;
	
			setEntryValues((prev) => {
	
				if (prev[fieldId] !== newTitle) {
					return {
						...prev,
						[fieldId]: newTitle
					}
				};
	
				return prev
	
			});
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

			//all static fields (the referenced ones)
			if (field.type === 'Link') {

				field.onValueChanged(() => {
					const { sys } = field.getValue() || {} ;
					setTitleField(sys?.id, field.id, setEntryValues);
				});

				const interval = setInterval(() => {
					const {sys} = field.getValue() || {} ;
					setTitleField(sys?.id, field.id, setEntryValues);
				}, POLLING_INTERVAL);

				intervals.push(interval);

				return;
			
			}

			//all normal fields
			field.onValueChanged(() => {

				setEntryValues((prev) => ({
					...prev,
					[field.id]: getValue(field)
				}));
			

			});
		});

		return () => {
			setEntryValues({});
			intervals.forEach((interval) => clearInterval(interval));
		};
		
	}, [space, fields, locale, setEntryValues, setTitleField])



	const result = fieldIds.map((fieldId) => entryValues[fieldId] || null);
	const resultFiltered = result.filter((value) => value);
	const joined = resultFiltered.join(' - ');

	//set the value only if it is different and all relevant fields are found
	if (joined !== sdk.field.getValue() && fieldIds.length - notFound.length === Object.keys(entryValues).length) {
		console.log('setting value');
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
