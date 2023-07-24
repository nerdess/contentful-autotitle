const getEntryTitleField = (environment, id) => {

	return new Promise((resolve, reject) => {

		if (!environment || !id) {
			reject('No environment or id provided');
			return;
		}

		environment.getEntry(id)
		.then((entry) => {
			environment
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

export default getEntryTitleField;
