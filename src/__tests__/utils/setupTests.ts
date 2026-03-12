import '@testing-library/jest-dom'

afterEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})
