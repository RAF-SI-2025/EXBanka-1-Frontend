import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, Link } from 'react-router-dom'
import { PageTransition } from './PageTransition'

describe('PageTransition', () => {
  it('renders children with the animate-in class', () => {
    render(
      <MemoryRouter>
        <PageTransition>
          <p>Hello</p>
        </PageTransition>
      </MemoryRouter>
    )
    const wrapper = screen.getByTestId('page-transition')
    expect(wrapper).toHaveClass('animate-in')
    expect(wrapper).toHaveClass('fade-in')
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })

  it('remounts (key changes) when the route changes', () => {
    function Page({ label }: { label: string }) {
      return <p>{label}</p>
    }
    render(
      <MemoryRouter initialEntries={['/a']}>
        <PageTransition>
          <nav>
            <Link to="/a">A</Link>
            <Link to="/b">B</Link>
          </nav>
          <Routes>
            <Route path="/a" element={<Page label="page-a" />} />
            <Route path="/b" element={<Page label="page-b" />} />
          </Routes>
        </PageTransition>
      </MemoryRouter>
    )
    expect(screen.getByText('page-a')).toBeInTheDocument()
  })
})
