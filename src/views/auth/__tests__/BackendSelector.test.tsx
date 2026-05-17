import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/__tests__/utils/test-utils'
import { BackendSelector } from '@/views/auth/components/BackendSelector'
import { STORAGE_KEY_PRESET, STORAGE_KEY_CUSTOM_URL, getCurrentHost } from '@/lib/api/backendHost'

describe('BackendSelector', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders a labelled trigger showing the current selection', () => {
    localStorage.setItem(STORAGE_KEY_PRESET, 'instance2')
    renderWithProviders(<BackendSelector />)

    expect(screen.getByText(/backend/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveTextContent(/instance 2/i)
  })

  it('persists a preset selection when the user picks one', async () => {
    renderWithProviders(<BackendSelector />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: /instance 1/i }))

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY_PRESET)).toBe('instance1')
    })
    expect(getCurrentHost()).toBe('https://project-exbanka.bytenity.com/instance1')
  })

  it('shows a URL input when "Custom" is selected and saves it via Apply', async () => {
    renderWithProviders(<BackendSelector />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: /custom/i }))

    const input = await screen.findByLabelText(/custom backend url/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'https://staging.example.com')
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))

    await waitFor(() => {
      expect(localStorage.getItem(STORAGE_KEY_PRESET)).toBe('custom')
    })
    expect(localStorage.getItem(STORAGE_KEY_CUSTOM_URL)).toBe('https://staging.example.com')
  })

  it('shows a validation error when the custom URL is invalid', async () => {
    renderWithProviders(<BackendSelector />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: /custom/i }))

    const input = await screen.findByLabelText(/custom backend url/i)
    await userEvent.clear(input)
    await userEvent.type(input, 'not-a-url')
    await userEvent.click(screen.getByRole('button', { name: /apply/i }))

    expect(await screen.findByText(/valid http\(s\) url/i)).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY_PRESET)).not.toBe('custom')
  })

  it('calls onHostChange when the user picks a different preset', async () => {
    const onHostChange = jest.fn()
    renderWithProviders(<BackendSelector onHostChange={onHostChange} />)

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(await screen.findByRole('option', { name: /instance 3/i }))

    await waitFor(() => {
      expect(onHostChange).toHaveBeenCalledWith('https://project-exbanka.bytenity.com/instance3')
    })
  })
})
