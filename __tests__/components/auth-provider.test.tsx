import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '@/components/auth-provider'
import { onAuthStateChanged } from 'firebase/auth'

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({})),
    onAuthStateChanged: jest.fn(),
}))

jest.mock('@/lib/firebase/config', () => ({
    auth: {},
}))

describe('AuthProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders children without crashing', () => {
        ; (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(null)
            return jest.fn()
        })

        render(
            <AuthProvider>
                <div>Test Children</div>
            </AuthProvider>
        )

        expect(screen.getByText('Test Children')).toBeInTheDocument()
    })

    it('provides loading state initially', () => {
        ; (onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn())

        function TestComponent() {
            const { loading } = useAuth()
            return <div>Loading: {loading.toString()}</div>
        }

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        expect(screen.getByText(/Loading:/)).toBeInTheDocument()
    })

    it('provides user when authenticated', async () => {
        const mockUser = {
            uid: 'test-uid',
            email: 'test@example.com',
        }

            ; (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
                callback(mockUser)
                return jest.fn()
            })

        function TestComponent() {
            const { user, loading } = useAuth()
            return <div>{loading ? 'Loading...' : user ? user.email : 'No user'}</div>
        }

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('test@example.com')).toBeInTheDocument()
        })
    })

    it('provides null user when not authenticated', async () => {
        ; (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
            callback(null)
            return jest.fn()
        })

        function TestComponent() {
            const { user, loading } = useAuth()
            return <div>{loading ? 'Loading...' : user ? 'User exists' : 'No user'}</div>
        }

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        )

        await waitFor(() => {
            expect(screen.getByText('No user')).toBeInTheDocument()
        })
    })
})
