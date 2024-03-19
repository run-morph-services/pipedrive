import { Crm } from '@run-morph/models';
import { Retrieve, Resource, Metadata, Error } from '@run-morph/sdk';

// Define metadata for the Pipedrive stage model
const metadata: Metadata<Crm.Stage> = {
    model: Crm.Stage,
    scopes: ['deals:read']
};

export default new Retrieve(async (runtime, { id }) => {
    // Fetch the specific stage by ID
    const stageResponse = await runtime.proxy({
        method: 'GET',
        path: `/stages/${id}`
    });

    if (stageResponse.success === false) {
        throw new Error(Error.Type.UNKNOWN_ERROR, stageResponse.error);
    }

    // Since the data is directly the stage, no need to find it in a list
    const pd_stage = stageResponse.data;

    // Map resource for the response
    const resource = mapResource(pd_stage);

    return resource;

}, metadata);

// Helper function to map Pipedrive stage to Crm.Stage resource
function mapResource(pd_stage) {
    let stageType;
    if (pd_stage.deal_probability === 0) {
        stageType = 'LOST';
    } else if (pd_stage.deal_probability === 100) {
        stageType = 'WON';
    } else {
        stageType = 'OPEN';
    }

    return new Resource<Crm.Stage>({
        id: pd_stage.id,
        parents: {
            pipeline: pd_stage.pipeline_id
        },
        data: { 
            name: pd_stage.name, 
            type: stageType 
        }, 
        created_at: pd_stage.add_time, 
        updated_at: pd_stage.update_time || pd_stage.add_time // Use add_time if update_time is null
    }, Crm.Stage);
}