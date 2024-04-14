import { Generic }  from '@run-morph/models';
import { Retrieve, Resource, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for the Pipedrive contact model
const metadata: Metadata<Generic.Contact> = {
	model: Generic.Contact,
	scopes: ['contacts.read']
};

export default new Retrieve( async (runtime, { id, remote_fields }) => { 
	console.log('remote_fields', remote_fields)
	// Call the Pipedrive GET contact API
	const response = await runtime.proxy({
		method: 'GET',
		path: `/persons/${id}`,
		params: {
			fields: [			
				...remote_fields
			],
		}
	});

	console.log(response)

	// Handle errors from the API response
	if(response.success === false){
        throw new Error(Error.Type.UNKNOWN_ERROR, response.error);
    }

	const resource = mapResource(response.data) 
	
	return resource

}, metadata );


// Helper function to map Pipedrive contacts to resources
function mapResource(pd_contact){
	return new Resource({ 
		id: pd_contact.id,
		data: {
			first_name: pd_contact.first_name,
			last_name: pd_contact.last_name,
			email: pd_contact.email[0].value, // Assuming email is an array
			phone: pd_contact.phone[0].value // Assuming phone is an array
		},
		created_at: new Date(pd_contact.add_time).toISOString(),
		updated_at: new Date(pd_contact.update_time).toISOString(),
		remote_data: pd_contact
	}, Generic.Contact)
}