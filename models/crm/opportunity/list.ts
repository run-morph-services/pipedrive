import { Crm, Generic }  from '@run-morph/models';
import { List, Resource, ResourceRef, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for the Pipedrive Deal model
const metadata: Metadata<Crm.Opportunity> = {
	model: Crm.Opportunity,
	scopes: ['deals:read']	
};

// Export a new List operation
export default new List(async (runtime, { page_size, cursor, sort, filter }) => { 

	// Initialize the request parameters with default values
	const params = {
		limit: 50, // Default limit
		start: cursor?.start || 0,
		sort: '',
	};

	// Adjust limit, sort, and filter based on input parameters
	const pd_limit = page_size > 50 || page_size === null ? 50 : page_size;
	const pd_sort = sort ? mapSort(sort) : null;
	//const pd_filter = filter ? mapFilter(filter) : null;

	if(pd_limit){
		params.limit = pd_limit;
	}

	if(pd_sort){
		params.sort = pd_sort;
	}

	

	// Call the Pipedrive deals API
	const response = await runtime.proxy({
		method: 'GET',
		path: '/deals',
		params
	});

	console.log(JSON.stringify(response.data[0]))

	// Handle errors from the API response
	if(response.success === false){
        throw new Error(Error.Type.UNKNOWN_ERROR, response.error);
    }

	// Prepare the next cursor and map resources for the response
	const next = response.additional_data.pagination.more_items_in_collection ? response.additional_data.pagination.start + response.additional_data.pagination.limit : null;
	const resources = [];
	for (const result of response.data) {
		const resource = await mapResource(result, runtime);
		resources.push(resource);
	}
	
	// Return the resources and the next cursor for pagination
	return { 
		data:  resources, 
		next: next 
	};

}, metadata );


// Helper function to map Pipedrive deal to Crm.Opportunity resource
async function mapResource(pd_deal, runtime){

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
            status: new ResourceRef({ id: pd_deal.stage_id}, Crm.Stage),
            pipeline: new ResourceRef({ id: pd_deal.pipeline_id}, Crm.Pipeline),
            closed_at: pd_deal.won_time || pd_deal.lost_time || null,
            contacts: contacts,
            companies: companies,
            owner: pd_deal.user_id?.id ? new ResourceRef({ id: pd_deal.user_id.id}, Generic.User) : null
        },
        created_at: new Date(pd_deal.add_time).toISOString(),
        updated_at: new Date(pd_deal.update_time).toISOString(),
        remote_data: pd_deal
    },
    Crm.Opportunity)
}

// Helper function to map sorting parameters
function mapSort(sort) {
    switch (sort) {
        case List.Sort.CREATED_AT_ASC:
            return 'add_time ASC';
        case List.Sort.CREATED_AT_DESC:
            return 'add_time DESC';
        case List.Sort.UPDATED_AT_ASC:
            return 'update_time ASC';
        case List.Sort.UPDATED_AT_DESC:
            return 'update_time DESC';
        default:
            return 'add_time DESC';
    }
}

