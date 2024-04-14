import { Crm, Generic } from '@run-morph/models';
import { Retrieve, Resource, Metadata, Error } from '@run-morph/sdk';

// Define metadata for the Pipedrive pipeline model
const metadata: Metadata<Crm.Pipeline> = {
    model: Crm.Pipeline,
    scopes: ['deals:read'] 
};

export default new Retrieve(async (runtime, { id }) => {
    // Fetch the specific pipeline
    const pipelineResponse = await runtime.proxy({
        method: 'GET',
        path: `/pipelines/${id}`
    });

    if (pipelineResponse.success === false) {
        throw new Error(Error.Type.UNKNOWN_ERROR, pipelineResponse.error);
    }

    // Fetch all stages for this pipeline
    const stagesResponse = await runtime.proxy({
        method: 'GET',
        path: '/stages'
    });

    if (stagesResponse.success === false) {
        throw new Error(Error.Type.UNKNOWN_ERROR, stagesResponse.error);
    }

    // Filter stages for the current pipeline
    const filteredStages = stagesResponse.data.filter(stage => stage.pipeline_id === parseInt(id));

    // Map resource for the response
    const resource = mapResource(pipelineResponse.data, filteredStages);

    return resource;

}, metadata);

// Helper function to map Pipedrive pipeline and its stages to Crm.Pipeline resource
function mapResource(pd_pipeline, pd_stages) {
    return new Resource<Crm.Pipeline>({
        id: pd_pipeline.id,
        data: {
            name: pd_pipeline.name,
            stages: pd_stages.map(pd_stage => {
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
                    parents: { pipeline: pd_pipeline.id },
                    data: { name: pd_stage.name, type: stageType },
                    remote_data: pd_stage,
                    created_at: pd_stage.add_time,
                    updated_at: pd_stage.update_time || pd_stage.add_time // Use add_time if update_time is null
                }, Crm.Stage);
            })
        },
        remote_data:pd_pipeline,
        created_at: pd_pipeline.add_time,
        updated_at: pd_pipeline.update_time || pd_pipeline.add_time // Use add_time if update_time is null
    }, Crm.Pipeline);
}