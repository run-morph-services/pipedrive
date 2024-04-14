import { Generic } from '@run-morph/models';
import { Fields, RemoteField, Metadata, Runtime } from '@run-morph/sdk';

const metadata: Metadata<Generic.Contact> = {
    model: Generic.Contact,
    scopes: ['pipedrive.schemas.contacts.read'],
    fields: {
        first_name: {
            remote_keys: ['first_name'],
            operations: ['list', 'retrieve', 'create', 'update']
        },
        last_name: {
            remote_keys: ['last_name'],
            operations: ['list', 'retrieve', 'create', 'update']
        },
        email: {
            remote_keys: ['email'],
            operations: ['list', 'retrieve', 'create', 'update']
        },
        phone: {
            remote_keys: ['phone'],
            operations: ['list', 'retrieve', 'create', 'update']
        }
    }
};

// Create an instance of the Fields class for CrmContactModel adapted for Pipedrive
export default new Fields(async (runtime: Runtime) => {
   return [];
}, metadata);