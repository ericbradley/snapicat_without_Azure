import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/context/authContext'
import { ThemeProvider } from '@/hooks/use-theme'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import NotFound from '@/pages/NotFound'
import Processed from '@/pages/Processed'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createHashRouter } from 'react-router-dom'

const queryClient = new QueryClient()

// Flattened router - no ProtectedRoute wrapper
const router = createHashRouter([
	{
		path: '/',
		element: <Home />,
		errorElement: <NotFound />,
	},
	{
		path: '/processed',
		element: <Processed />,
	},
	{
		path: '/login',
		element: <Login />,
	},
	{
		path: '*',
		element: <NotFound />,
	},
])

const App = () => (
	<AuthProvider>
		<QueryClientProvider client={queryClient}>
			<ThemeProvider defaultTheme='system' storageKey='bookops-ui-theme'>
				<TooltipProvider>
					<Toaster />
					<Sonner />
					<RouterProvider router={router} />
				</TooltipProvider>
			</ThemeProvider>
		</QueryClientProvider>
	</AuthProvider>
)

export default App