import { Outlet } from 'react-router-dom'
import peopleWalkingGif from '@/assets/people-walking.gif'

export function AuthLayout() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${peopleWalkingGif})` }}
    >
      <div className="w-full max-w-md p-4">
        <Outlet />
      </div>
    </div>
  )
}
