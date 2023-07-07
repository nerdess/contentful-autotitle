import { useEffect, useState, useMemo } from 'react';
import { Note, Stack, TextLink } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { TextInput, FormControl } from '@contentful/f36-components';


const DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' };

const getEntryTitle =  (sdk, id ) => {

	return new Promise((resolve, reject) => {

		sdk?.space.getEntry(id)
		.then((entry) => {
	
			sdk.space
				.getContentType(entry.sys.contentType.sys.id)
				.then((contentType) => {
					resolve(entry.fields[contentType.displayField]);
				});
	
		})
		.catch(error => {
		  console.log('Error:', error);
		  reject(error);
		});

	});

}

const getLang = () => {
	if (navigator.languages !== undefined) return navigator.languages[0];
	return navigator.language;
};

const getValue = (field) => {

	if (field.type === 'Date' && field.getValue()) {
		const date = new Date(field.getValue());
		return date.toLocaleDateString(getLang(), DATE_FORMAT);
		
	}
	return field.getValue();
}

const Field = () => {

	const sdk = useSDK();
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
	}, [sdk, fieldIds]) 

	const notFound = fieldIds.filter((fieldId) => !sdk.entry.fields[fieldId])


	useEffect(() => {

		fields.forEach((field) => {

			//grab all static fields (the referenced ones)
			if (field.type === 'Link' && field.getValue()) {
				const {
					sys
				} = field.getValue();
				
				getEntryTitle(sdk, sys.id).then((title) => {
					setEntryValues((prev) => ({
						...prev,
						[field.id]: title[locale]
					}));
				});
			}

			//then set listeners to the fields that can change
			field.onValueChanged(() => {

				if (field.type === 'Link') return;

				setEntryValues((prev) => ({
					...prev,
					[field.id]: getValue(field)
				}));

			});
		});

		return () => setEntryValues({});
		
	}, [fields, sdk, setEntryValues, locale])


	const result = fieldIds.map((fieldId) => entryValues[fieldId] || null);
	const resultFiltered = result.filter((value) => value);
	const joined = resultFiltered.join(' - ');

	console.log('joined', joined);

	if (joined !== sdk.field.getValue() && fieldIds.length - notFound.length === result.length) {
		sdk.field.setValue(joined);
	}
	

	useEffect(() => {
		window.startAutoResizer();
		return () => window.stopAutoResizer();
	}, [window]);

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
