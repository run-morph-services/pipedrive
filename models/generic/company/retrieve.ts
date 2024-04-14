import { Generic }  from '@run-morph/models';
import { Retrieve, Resource, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for the Pipedrive company model
const metadata: Metadata<Generic.Company> = {
	model: Generic.Company,
	scopes: ['read:companies']
};

// Export a new Retrieve operation
export default new Retrieve( async (runtime, { id }) => { 
    console.log('id',id)
	// Call the Pipedrive GET companies API
	const response = await runtime.proxy({
		method: 'GET',
		path: `/organizations/${id}`
	});

    console.log(response)
	
	// Handle errors from the API response
	if(response.status === 'error'){
        switch (response.category){
            default:
                throw new Error(Error.Type.UNKNOWN_ERROR, response.message);
        }
    }

	// Map resource for the response
	const resource = mapResource(response) 

	// Return the resource
	return resource

}, metadata );


// Helper function to map Pipedrive company data to our company resource
function mapResource(pd_company){
	return new Resource({ 
		id: pd_company.data.id.toString(),
		data: {
			name: pd_company.data.name
		},
		created_at: pd_company.data.add_time,
		updated_at: pd_company.data.update_time,
		remote_data: pd_company.data
		}, Generic.Company)
}