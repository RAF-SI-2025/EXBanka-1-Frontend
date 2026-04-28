import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { store } from '@/store'
import App from '@/App'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/sonner'
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary'
import { PiggyProvider } from '@/contexts/PiggyContext'
import { createQueryClient } from '@/lib/queryClient'
import './index.css'

const queryClient = createQueryClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AppErrorBoundary>
              <PiggyProvider>
                <App />
              </PiggyProvider>
            </AppErrorBoundary>
          </BrowserRouter>
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  </StrictMode>
)
