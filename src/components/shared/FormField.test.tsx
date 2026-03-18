import { render, screen } from '@testing-library/react'
import { FormField } from '@/components/shared/FormField'

describe('FormField', () => {
  it('renders the label', () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>
    )
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(
      <FormField label="Email">
        <input placeholder="Enter email" />
      </FormField>
    )
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('renders error message when provided', () => {
    render(
      <FormField label="Email" error="Invalid email">
        <input />
      </FormField>
    )
    expect(screen.getByText('Invalid email')).toBeInTheDocument()
  })

  it('does not render error when error is undefined', () => {
    render(
      <FormField label="Email">
        <input />
      </FormField>
    )
    expect(screen.queryByText(/.+/)).not.toHaveClass('text-destructive')
  })

  it('associates label with input via id', () => {
    render(
      <FormField label="Email" id="email">
        <input id="email" />
      </FormField>
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })
})
