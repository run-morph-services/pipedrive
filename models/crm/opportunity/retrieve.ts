import { Crm, Generic }  from '@run-morph/models';
import { Retrieve, Resource, ResourceRef, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for the Pipedrive Deal model
const metadata: Metadata<Crm.Opportunity> = {
	model: Crm.Opportunity,
	scopes: ['deals:read']	
};

// Export a new List operation
export default new Retrieve( async (runtime, { id }) => { 
	

	// Call the Pipedrive deals API
	const response = await runtime.proxy({
		method: 'GET',
		path: `/deals/${id}`
	});

	console.log(JSON.stringify(response))

	// Handle errors from the API response
	if(response.success === false){
        throw new Error(Error.Type.UNKNOWN_ERROR, response.error);
    }

	const resource = await mapResource(response.data);

	// Return the resources and the next cursor for pagination
	return resource;

}, metadata );


// Helper function to map Pipedrive deal to Crm.Opportunity resource
async function mapResource(pd_deal){

    const contacts = [];
    if(pd_deal?.person_id?.value){
        contacts.push( new ResourceRef({ id: pd_deal?.person_id?.value}, Generic.Contact));
    }

    const companies = [];
    if(pd_deal?.org_id?.value){
        companies.push( new ResourceRef({ id: pd_deal?.org_id?.value}, Generic.Company));
    }

    return new Resource({ 
        id: pd_deal.id,
        data: {
            name: pd_deal.title,
            description: pd_deal.description,
            amount: parseFloat(pd_deal.value),
            currency: pd_deal.currency,
            win_probability: pd_deal.probability, // Assuming 'probability' is provided by Pipedrive
            stage: new ResourceRef({ id: pd_deal.stage_id}, Crm.Stage),
            pipeline: new ResourceRef({ id: pd_deal.pipeline_id}, Crm.Pipeline),
            closed_at: pd_deal.won_time || pd_deal.lost_time || null,
            contacts: contacts,
            companies: companies,
            owner: pd_deal.user_id?.id ? new ResourceRef({ id: pd_deal.user_id?.id}, Generic.User) : null
        },
        created_at: new Date(pd_deal.add_time).toISOString(),
        updated_at: new Date(pd_deal.update_time).toISOString(),
        remote_data: pd_deal
    },
    Crm.Opportunity)
}
