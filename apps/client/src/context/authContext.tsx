import type { User } from '@/types'
import type React from 'react'
import {
	type ReactNode,
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from 'react'

interface AuthContextType {
	isAuthenticated: boolean
	user: User | null
	accessToken: string | null
	login: () => Promise<void>
	logout: () => Promise<void>
	isLoading: boolean
	error: string | null
	getValidAccessToken: (minValidityMs?: number) => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
	children: ReactNode
}

// Mock user matching the User interface
const MOCK_USER: User = {
	id: 'local-dev-user-id',
	email: 'dev@localhost',
	name: 'Local Cataloger',
}

// Dummy mock token string so components or interceptors expecting a token don't fail
const MOCK_TOKEN = 'mock-dev-access-token'

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user] = useState<User | null>(MOCK_USER)
	const [accessToken] = useState<string | null>(MOCK_TOKEN)
	const [isLoading] = useState(false)
	const [error] = useState<string | null>(null)

	const login = useCallback(async () => {
		// No-op for local development
		console.log('Login triggered (no-op in local mode)')
	}, [])

	const logout = useCallback(async () => {
		// No-op or clear session if needed
		console.log('Logout triggered (no-op in local mode)')
	}, [])

	const getValidAccessToken = useCallback(
		async (_minValidityMs: number = 10 * 60 * 1000) => {
			return MOCK_TOKEN
		},
		[],
	)

	const contextValue: AuthContextType = useMemo(
		() => ({
			isAuthenticated: true, // Always authenticated
			user,
			accessToken,
			login,
			logout,
			isLoading,
			error,
			getValidAccessToken,
		}),
		[user, accessToken, login, logout, isLoading, error, getValidAccessToken],
	)

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}