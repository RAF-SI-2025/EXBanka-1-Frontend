import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthLayout } from '@/components/layout/AuthLayout'

describe('AuthLayout', () => {
  it('renders child route content via Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<p>Login form</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    expect(screen.getByText('Login form')).toBeInTheDocument()
  })

  it('renders a background container', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<p>Login form</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    )
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper).toHaveClass('fixed', 'inset-0')
  })
})
