import { Crm }  from '@run-morph/models';
import { Fields, RemoteField, Metadata, Runtime }  from '@run-morph/sdk';

const metadata: Metadata<Crm.Opportunity> = {
    model: Crm.Opportunity,
    scopes: ['crm.schemas.deals.read'], // Adjust scope if necessary for Pipedrive
    fields: {
        // Adjust field mappings based on Pipedrive's API response
        name: {
            remote_keys: ['title'], // Assuming 'title' is the equivalent in Pipedrive
            operations: ['list', 'retrieve']
        },
        description: {
            remote_keys: ['description'], // Verify with Pipedrive documentation
            operations: ['list', 'retrieve']
        },
        amount: {
            remote_keys: ['value'], // Assuming 'value' is the equivalent in Pipedrive
            operations: ['list', 'retrieve']
        },
        currency: {
            remote_keys: ['currency'], // Verify with Pipedrive documentation
            operations: ['list', 'retrieve']
        },
        win_probability: {
            remote_keys: [], // Check if Pipedrive provides this field
            operations: ['list', 'retrieve']
        },
        status: {
            remote_keys: ['status'], // Assuming 'status' for deal stage
            operations: ['list', 'retrieve', 'update']
        },
        pipeline: {
            remote_keys: ['pipeline_id'], // Assuming 'pipeline_id' is the equivalent in Pipedrive
            operations: ['list', 'retrieve']
        },
        closed_at: {
            remote_keys: ['won_time'], // Assuming 'won_time' for the close date
            operations: ['list', 'retrieve']
        },
        contacts: {
            remote_keys: [], // Adjust according to Pipedrive's model
            operations: ['retrieve']
        },
        companies: {
            remote_keys: [], // Adjust according to Pipedrive's model
            operations: ['retrieve']
        }
    }
};

// Adjust the instantiation of the Fields class for Pipedrive
export default new Fields(async (runtime: Runtime) => { 
    
    return []
}, metadata);