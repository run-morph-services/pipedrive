import { Generic }  from '@run-morph/models';
import { List, Resource, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for the Pipedrive Contact model
const metadata:Metadata<Generic.Contact> = {
	model: Generic.Contact,
	scopes: ['contacts:read']
};

// Export a new List operation
export default new List( async ( runtime, { page_size, cursor, sort, filter }) => { 

    // Adjust the API endpoint based on the presence of a filter
    const apiEndpoint = filter ? '/persons/search' : '/persons';


	// Initialize the request params with default values for Pipedrive
	const params = {
		start: cursor?.next_start || 0,
		limit: page_size || 50, // Default limit
		sort: sort ? mapSort(sort) : '',
		// Assuming Pipedrive API accepts a JSON object for filtering
		filter: filter ? mapFilter(filter) : {}
	}

	// Call the Pipedrive contact search API
	const response = await runtime.proxy({
		method: 'GET',
		path: apiEndpoint, 
		params: params
	});
	console.log(response)
	// Handle errors from the API response
	if(response.status === 'error'){
        switch (response.category){
            default:
                throw new Error(Error.Type.UNKNOWN_ERROR, response.message);
        }
    }

	// Prepare the next cursor and map resources for the response
	const next = response?.additional_data?.pagination?.more_items_in_collection ? response?.additional_data?.pagination : null;
	const resources = response.data.map(mapResource);  

	// Return the resources and the next cursor for pagination
	return { 
		data:  resources, 
		next: next 
	};

}, metadata );


// Adjusted helper function to map Pipedrive contacts to resources
function mapResource(pd_contact){
	return new Resource({ 
		id: pd_contact.id,
		data: {
			first_name: pd_contact.first_name,
			last_name: pd_contact.last_name,
			email: pd_contact.email[0].value, // Assuming email is an array
			phone: pd_contact.phone[0].value // Assuming phone is an array
		},
		remote_data: pd_contact,
		created_at: pd_contact.add_time,
		updated_at: pd_contact.update_time
		}, Generic.Contact)
}

// Helper function to map sorting parameters for Pipedrive
function mapSort(sort) {
    // Example mapping, adjust based on Pipedrive's actual sorting syntax
    switch (sort) {
        case List.Sort.CREATED_AT_ASC:
            return 'add_time asc';
        case List.Sort.CREATED_AT_DESC:
            return 'add_time desc';
        case List.Sort.UPDATED_AT_ASC:
            return 'update_time asc';
        case List.Sort.UPDATED_AT_DESC:
            return 'update_time desc';
        default:
            return 'add_time desc'; // Default sorting
    }
}

// Helper function to map filtering parameters for Pipedrive
function mapFilter(filter) {
    // This is a simplified example. You'll need to adjust it based on Pipedrive's filtering capabilities.
    let pd_filters = {};
    for (let key in filter) {
        if (filter.hasOwnProperty(key)) {
            // Assuming Pipedrive uses a simple key-value pair for filtering.
            // Adjust the property names and structure according to Pipedrive's documentation.
            pd_filters[key] = filter[key];
        }
    }
    return pd_filters;
}