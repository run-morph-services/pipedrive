import { Generic }  from '@run-morph/models';
import { Retrieve, Resource, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for the Pipedrive user model
const metadata: Metadata<Generic.User> = {
	model: Generic.User,
	scopes: ['users:read']
};

export default new Retrieve(async (runtime, { id }) => {
	console.log(id)
	
	// Call the Pipedrive API to GET a user
	const response = await runtime.proxy({
		method: 'GET',
		path: `/users/${id}`
	});

	console.log(response)
	// Handle errors from the API response
	if (response.success === false) {
		throw new Error(Error.Type.UNKNOWN_ERROR, response.error);
	}

	// Map resource for the response
	const resource = mapResource(response.data) 

	return resource

}, metadata);

// Helper function to map Pipedrive user to Generic.User resource
function mapResource(pd_user) {
	return new Resource({
		id: pd_user.id.toString(),
		data: {
			first_name: pd_user.name.split(' ')[0], // Assuming the first part is the first name
			last_name: pd_user.name.split(' ').slice(1).join(' '), // Assuming the rest is the last name
			email: pd_user.email
		},
		created_at: pd_user.created.toString(),
		updated_at: pd_user.modified.toString(),
		remote_data: pd_user
	}, Generic.User)
}