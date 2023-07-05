import { Note, Stack, TextLink } from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { useEffect, useState } from 'react';
import { TextInput, FormControl } from '@contentful/f36-components';

const DATE_FORMAT = { year: 'numeric', month: '2-digit', day: '2-digit' };

const getLang = () => {
  if (navigator.languages != undefined) 
    return navigator.languages[0]; 
  return navigator.language;
}

const Field = () => {

	const sdk = useSDK();
	console.log(sdk)
	const window = sdk.window;
	useEffect(() => {
		window.startAutoResizer();
	}, [window]);

	const fieldIds = sdk.parameters.instance.fieldIds.split(',').map((fieldId) => fieldId.trim());
	const fieldsMetadata = sdk.contentType.fields.filter(({id}) => fieldIds.includes(id));
	const [value, setValue] = useState(sdk.field.getValue());
	const notFound = [];
	const fields = fieldIds
		.map((fieldId) => {
			const field = sdk.entry.fields[fieldId];
			if (!field) notFound.push(fieldId);
			return field;
		})
		.filter((field) => field);

	fields.forEach((field) => {
		field.onValueChanged((newValue) => {
			const values = fields.map((field) => {

				if (field.type === 'Date' && field.getValue()) {
					const date = new Date(field.getValue());
					return date.toLocaleDateString(getLang(), DATE_FORMAT);
				}

				return field.getValue();
			}).filter((value) => value);

			const joined = values.join(' - ');

			if (joined !== value) {
				sdk.field.setValue(joined);
				setValue(joined);
			}
		});
	});

  if (!sdk.parameters.instance.hasOwnProperty('fieldIds')) {
    return (
      <Note variant='negative' style={{ width: '100%' }}>
        Your app definition has no instance parameter <strong>fieldIds</strong> 😫<br />
        <TextLink
        href={`https://app.contentful.com/account/organizations/${sdk.ids.organization}/apps/definitions/${sdk.ids.app}/general`}
        target="_blank"
        rel="noopener noreferrer"
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

        <div style={{width: '100%'}}>
        <TextInput value={value} type='text' name='autotitle' isDisabled={true} />
        <FormControl.HelpText>
          The entry title is auto-generated using <strong>{fieldsMetadata.map(({name}) => name).join(' - ')}</strong>
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
}

export default Field;