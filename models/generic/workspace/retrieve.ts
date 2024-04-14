import { Generic }  from '@run-morph/models';
import { Retrieve, Resource, Metadata, Error }  from '@run-morph/sdk';

// Define metadata for retrieving the organization of the authenticated OAuth app in Pipedrive
const metadata: Metadata<Generic.Workspace> = {
    model: Generic.Workspace,
    scopes: []
};

export default new Retrieve( async (runtime, { }) => { 
    
    // Call the Pipedrive API to GET the organization details of the authenticated OAuth app
    const response = await runtime.proxy({
        method: 'GET',
        path: `/users/me` // Endpoint to get the authenticated user's organization details
    });

    // Check if the API call was successful
    if (!response.success) {
        throw new Error(Error.Type.UNKNOWN_ERROR, "Failed to retrieve organization details");
    }

    // Map resource for the response
    const resource = mapResource(response.data) 

    return resource

}, metadata );

// Helper function to map the authenticated app's organization details to Generic.Workspace resource
function mapResource(pd_user){

    return new Resource({ 
        id: pd_user.company_id,
        data: {
            name: pd_user.company_name
        },
        created_at: new Date(pd_user.created).toISOString(),
        updated_at: new Date(pd_user.modified).toISOString(),
        remote_data: pd_user
    }, Generic.Workspace)
}