// Public surface of the Clients view module. Three views — admin list,
// create-new flow, and edit-by-id form — share the ClientTable and
// EditClientForm primitives. The EditClientLimitsDialog stays in
// `src/components/admin/` because it's consumed by the settings/client-limits
// panel (which still lives in `src/pages/`).
export { AdminClientsView } from './AdminClientsView'
export { CreateClientView } from './CreateClientView'
export { EditClientView } from './EditClientView'
