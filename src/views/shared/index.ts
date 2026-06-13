// Public surface of the shared views toolkit. Every submenu view module
// composes its UI from these primitives so the platform looks and animates
// consistently across admin, client, and trading screens.
export { ViewShell } from './ViewShell'
export { LoadingState } from './LoadingState'
export { ErrorState } from './ErrorState'
export { EmptyState } from './EmptyState'
export {
  viewEnter,
  cardEnter,
  panelEnter,
  rowEnter,
  dialogEnter,
  tabContentEnter,
  hoverLift,
} from './animations'
