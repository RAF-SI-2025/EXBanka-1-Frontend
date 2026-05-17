// Public surface of the Auth view module — login, password reset request,
// password reset confirmation, and account activation. Auth-domain form
// components and the verification step (shared with transfer / payment
// flows) are co-located. BackendSwitcherButton is also exported because
// the sidebar uses it from outside the auth flow.
export { LoginView } from './LoginView'
export { PasswordResetView } from './PasswordResetView'
export { PasswordResetRequestView } from './PasswordResetRequestView'
export { ActivationView } from './ActivationView'
export { BackendSwitcherButton } from './components/BackendSwitcherButton'
export { VerificationStep } from './verification/VerificationStep'
