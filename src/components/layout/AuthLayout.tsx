import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary/5">
      <div className="w-full max-w-md p-4">
        <Outlet />
      </div>
    </div>
  )
}
