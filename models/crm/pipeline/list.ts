import { Crm } from '@run-morph/models';
import { List, Resource, Metadata, Error } from '@run-morph/sdk';

// Define metadata for the Pipedrive deal pipeline model
const metadata: Metadata<Crm.Pipeline> = {
    model: Crm.Pipeline,
    scopes: ['deals:read'] // Scope for Pipedrive
};

export default new List(async (runtime, { page_size, cursor, sort, filter }) => {
    // Fetch pipelines
    const pipelinesResponse = await runtime.proxy({
        method: 'GET',
        path: '/pipelines'
    });

    if (pipelinesResponse.success === false) {
        throw new Error(Error.Type.UNKNOWN_ERROR, pipelinesResponse.error);
    }

    // Fetch stages
    const stagesResponse = await runtime.proxy({
        method: 'GET',
        path: '/stages'
    });

    if (stagesResponse.success === false) {
        throw new Error(Error.Type.UNKNOWN_ERROR, stagesResponse.error);
    }

    // Map pipelines to resources
    const resources = pipelinesResponse.data.map(pd_pipeline => {
        const stages = stagesResponse.data
            .filter(stage => stage.pipeline_id === pd_pipeline.id)
            .map(mapStage);

        return new Resource<Crm.Pipeline>({
            id: pd_pipeline.id,
            data: {
                name: pd_pipeline.name,
                stages: stages
            },
            created_at: pd_pipeline.add_time,
            updated_at: pd_pipeline.update_time
        }, Crm.Pipeline);
    });

    // Assuming no pagination for simplicity
    return {
        data: resources,
        next: null
    };

}, metadata);

// Helper function to map Pipedrive stage to Crm.Stage resource
function mapStage(pd_stage) {
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
        parents: { pipeline: pd_stage.pipeline_id },
        data: {
            name: pd_stage.name,
            type: stageType
        },
        created_at: pd_stage.add_time,
        updated_at: pd_stage.update_time
    }, Crm.Stage);
}