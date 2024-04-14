import { Crm }  from '@run-morph/models';
import { Update, ResourceEvent, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for the Pipedrive deal model
const metadata: Metadata<Crm.Opportunity> = {
	model: Crm.Opportunity,
	scopes: ['deals:full']
};

export default new Update(async (runtime, { id, data }) => {

	let properties: { [key: string]: any } = {};

	// Direct mapping of properties to Pipedrive's flat structure
	if (data.name) properties.title = data.name;
	if (data.description) properties.description = data.description;
	if (data.amount) properties.value = data.amount;
	if (data.currency) properties.currency = data.currency;
	if (data.win_probability) properties.probability = data.win_probability; 
	if (data.stage && data.stage.id) properties.stage_id = data.stage.id; 
	if (data.pipeline && data.pipeline.id) properties.pipeline_id = data.pipeline.id;
	if (data.closed_at) properties.close_time = data.closed_at;
	if (data.owner && data.owner.id) properties.user_id = data.owner.id;

	// Call the Pipedrive API to update a deal
	const response = await runtime.proxy({
		method: 'PUT',
		path: `/deals/${id}`,
		body: properties
	});

	// Handle errors from the API response
	if (response.success === false) {
		throw new Error(Error.Type.UNKNOWN_ERROR, response.error);
	}

	if (response.data && response.data.id) {
		const resource = new ResourceEvent({
			id: response.data.id.toString(),
			created_at: new Date(response.data.add_time).toISOString(),
			updated_at: new Date(response.data.update_time).toISOString()
		}, Crm.Opportunity);

		return resource;
	} else {
		throw new Error(Error.Type.UNKNOWN_ERROR);
	}

}, metadata);