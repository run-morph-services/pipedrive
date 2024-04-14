import { Generic } from '@run-morph/models';
import { Fields, RemoteField, Metadata, Runtime } from '@run-morph/sdk';

const metadata: Metadata<Generic.Company> = {
    model: Generic.Company,
    scopes: ['pipedrive.schemas.contacts.read'],
    fields: {
        name: {
            remote_keys: ['name'],
            operations: ['list', 'retrieve', 'create', 'update']
        }
    }
};

// Create an instance of the Fields class for CrmContactModel adapted for Pipedrive
export default new Fields(async (runtime: Runtime) => {
   return [];
}, metadata);