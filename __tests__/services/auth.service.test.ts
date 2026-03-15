import * as firebaseConfig from '@/lib/firebase/config'

const mockSignInWithEmailAndPassword = jest.fn()
const mockCreateUserWithEmailAndPassword = jest.fn()
const mockSignInWithPopup = jest.fn()
const mockFirebaseSignOut = jest.fn()
const mockSendPasswordResetEmail = jest.fn()
const mockFirebaseConfirmPasswordReset = jest.fn()
const mockFirebaseVerifyPasswordResetCode = jest.fn()
const mockFirebaseUpdatePassword = jest.fn()
const mockFirebaseUpdateProfile = jest.fn()
const mockReauthenticateWithCredential = jest.fn()
const mockReauthenticateWithPopup = jest.fn()
const mockDeleteUser = jest.fn()
const mockEmailAuthProviderCredential = jest.fn().mockReturnValue('emailCredential')

jest.mock('firebase/auth', () => ({
    signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
    createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
    signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
    signOut: (...args: any[]) => mockFirebaseSignOut(...args),
    sendPasswordResetEmail: (...args: any[]) => mockSendPasswordResetEmail(...args),
    confirmPasswordReset: (...args: any[]) => mockFirebaseConfirmPasswordReset(...args),
    verifyPasswordResetCode: (...args: any[]) => mockFirebaseVerifyPasswordResetCode(...args),
    updatePassword: (...args: any[]) => mockFirebaseUpdatePassword(...args),
    updateProfile: (...args: any[]) => mockFirebaseUpdateProfile(...args),
    reauthenticateWithCredential: (...args: any[]) => mockReauthenticateWithCredential(...args),
    reauthenticateWithPopup: (...args: any[]) => mockReauthenticateWithPopup(...args),
    deleteUser: (...args: any[]) => mockDeleteUser(...args),
    EmailAuthProvider: {
        credential: (...args: any[]) => mockEmailAuthProviderCredential(...args),
    },
}))

jest.mock('@/lib/logger', () => ({
    logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn() },
}))

const mockUser = {
    uid: 'user123',
    email: 'test@example.com',
    displayName: null,
}

beforeEach(() => {
    jest.clearAllMocks()
    // Set currentUser for tests that need it
    ;(firebaseConfig.auth as any).currentUser = { ...mockUser }
})

afterEach(() => {
    ;(firebaseConfig.auth as any).currentUser = undefined
})

// ===== signInWithEmail =====

describe('signInWithEmail', () => {
    it('returns user on successful login', async () => {
        const { signInWithEmail } = await import('@/services/auth.service')
        mockSignInWithEmailAndPassword.mockResolvedValue({ user: mockUser })
        const user = await signInWithEmail('test@example.com', 'password123')
        expect(user).toEqual(mockUser)
        expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
            firebaseConfig.auth,
            'test@example.com',
            'password123',
        )
    })

    it('throws and propagates Firebase auth errors', async () => {
        const { signInWithEmail } = await import('@/services/auth.service')
        mockSignInWithEmailAndPassword.mockRejectedValue(new Error('wrong-password'))
        await expect(signInWithEmail('test@example.com', 'wrong')).rejects.toThrow('wrong-password')
    })
})

// ===== signInWithGoogle =====

describe('signInWithGoogle', () => {
    it('returns user on successful Google login', async () => {
        const { signInWithGoogle } = await import('@/services/auth.service')
        mockSignInWithPopup.mockResolvedValue({ user: mockUser })
        const user = await signInWithGoogle()
        expect(user).toEqual(mockUser)
        expect(mockSignInWithPopup).toHaveBeenCalledWith(firebaseConfig.auth, firebaseConfig.googleProvider)
    })

    it('throws and propagates popup errors', async () => {
        const { signInWithGoogle } = await import('@/services/auth.service')
        mockSignInWithPopup.mockRejectedValue(new Error('popup-closed'))
        await expect(signInWithGoogle()).rejects.toThrow('popup-closed')
    })
})

// ===== signUp =====

describe('signUp', () => {
    it('registers user without displayName', async () => {
        const { signUp } = await import('@/services/auth.service')
        mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })
        const user = await signUp('test@example.com', 'password123')
        expect(user).toEqual(mockUser)
        expect(mockFirebaseUpdateProfile).not.toHaveBeenCalled()
    })

    it('registers user and sets displayName when provided', async () => {
        const { signUp } = await import('@/services/auth.service')
        mockCreateUserWithEmailAndPassword.mockResolvedValue({ user: mockUser })
        mockFirebaseUpdateProfile.mockResolvedValue(undefined)
        await signUp('test@example.com', 'password123', 'João Silva')
        expect(mockFirebaseUpdateProfile).toHaveBeenCalledWith(mockUser, { displayName: 'João Silva' })
    })

    it('throws and propagates registration errors', async () => {
        const { signUp } = await import('@/services/auth.service')
        mockCreateUserWithEmailAndPassword.mockRejectedValue(new Error('email-already-in-use'))
        await expect(signUp('test@example.com', 'password123')).rejects.toThrow('email-already-in-use')
    })
})

// ===== signOut =====

describe('signOut', () => {
    it('calls Firebase signOut', async () => {
        const { signOut } = await import('@/services/auth.service')
        mockFirebaseSignOut.mockResolvedValue(undefined)
        await signOut()
        expect(mockFirebaseSignOut).toHaveBeenCalledWith(firebaseConfig.auth)
    })

    it('throws and propagates signOut errors', async () => {
        const { signOut } = await import('@/services/auth.service')
        mockFirebaseSignOut.mockRejectedValue(new Error('signout-failed'))
        await expect(signOut()).rejects.toThrow('signout-failed')
    })
})

// ===== resetPassword =====

describe('resetPassword', () => {
    it('sends password reset email', async () => {
        const { resetPassword } = await import('@/services/auth.service')
        mockSendPasswordResetEmail.mockResolvedValue(undefined)
        await resetPassword('test@example.com')
        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
            firebaseConfig.auth,
            'test@example.com',
            undefined,
        )
    })

    it('sends password reset email with action code settings', async () => {
        const { resetPassword } = await import('@/services/auth.service')
        mockSendPasswordResetEmail.mockResolvedValue(undefined)
        const settings = { url: 'https://app.example.com/reset' }
        await resetPassword('test@example.com', settings)
        expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
            firebaseConfig.auth,
            'test@example.com',
            settings,
        )
    })

    it('throws and propagates errors', async () => {
        const { resetPassword } = await import('@/services/auth.service')
        mockSendPasswordResetEmail.mockRejectedValue(new Error('user-not-found'))
        await expect(resetPassword('unknown@example.com')).rejects.toThrow('user-not-found')
    })
})

// ===== verifyPasswordResetCode =====

describe('verifyPasswordResetCode', () => {
    it('returns associated email on valid code', async () => {
        const { verifyPasswordResetCode } = await import('@/services/auth.service')
        mockFirebaseVerifyPasswordResetCode.mockResolvedValue('test@example.com')
        const email = await verifyPasswordResetCode('valid-oob-code')
        expect(email).toBe('test@example.com')
        expect(mockFirebaseVerifyPasswordResetCode).toHaveBeenCalledWith(firebaseConfig.auth, 'valid-oob-code')
    })

    it('throws and propagates invalid code errors', async () => {
        const { verifyPasswordResetCode } = await import('@/services/auth.service')
        mockFirebaseVerifyPasswordResetCode.mockRejectedValue(new Error('invalid-action-code'))
        await expect(verifyPasswordResetCode('bad-code')).rejects.toThrow('invalid-action-code')
    })
})

// ===== confirmPasswordReset =====

describe('confirmPasswordReset', () => {
    it('confirms password reset', async () => {
        const { confirmPasswordReset } = await import('@/services/auth.service')
        mockFirebaseConfirmPasswordReset.mockResolvedValue(undefined)
        await confirmPasswordReset('oob-code', 'newSecurePassword')
        expect(mockFirebaseConfirmPasswordReset).toHaveBeenCalledWith(
            firebaseConfig.auth,
            'oob-code',
            'newSecurePassword',
        )
    })

    it('throws and propagates errors', async () => {
        const { confirmPasswordReset } = await import('@/services/auth.service')
        mockFirebaseConfirmPasswordReset.mockRejectedValue(new Error('expired-action-code'))
        await expect(confirmPasswordReset('expired', 'pass')).rejects.toThrow('expired-action-code')
    })
})

// ===== reauthenticateWithEmail =====

describe('reauthenticateWithEmail', () => {
    it('creates credential and reauthenticates', async () => {
        const { reauthenticateWithEmail } = await import('@/services/auth.service')
        mockReauthenticateWithCredential.mockResolvedValue(undefined)
        await reauthenticateWithEmail('currentPassword')
        expect(mockEmailAuthProviderCredential).toHaveBeenCalledWith('test@example.com', 'currentPassword')
        expect(mockReauthenticateWithCredential).toHaveBeenCalledWith(
            (firebaseConfig.auth as any).currentUser,
            'emailCredential',
        )
    })

    it('throws when user is not authenticated', async () => {
        const { reauthenticateWithEmail } = await import('@/services/auth.service')
        ;(firebaseConfig.auth as any).currentUser = undefined
        await expect(reauthenticateWithEmail('password')).rejects.toThrow('Usuário não autenticado')
    })

    it('throws and propagates wrong-password errors', async () => {
        const { reauthenticateWithEmail } = await import('@/services/auth.service')
        mockReauthenticateWithCredential.mockRejectedValue(new Error('wrong-password'))
        await expect(reauthenticateWithEmail('wrongPass')).rejects.toThrow('wrong-password')
    })
})

// ===== reauthenticateWithGoogle =====

describe('reauthenticateWithGoogle', () => {
    it('reauthenticates with Google popup', async () => {
        const { reauthenticateWithGoogle } = await import('@/services/auth.service')
        mockReauthenticateWithPopup.mockResolvedValue(undefined)
        await reauthenticateWithGoogle()
        expect(mockReauthenticateWithPopup).toHaveBeenCalledWith(
            (firebaseConfig.auth as any).currentUser,
            firebaseConfig.googleProvider,
        )
    })

    it('throws when user is not authenticated', async () => {
        const { reauthenticateWithGoogle } = await import('@/services/auth.service')
        ;(firebaseConfig.auth as any).currentUser = null
        await expect(reauthenticateWithGoogle()).rejects.toThrow('Auth ou Google Provider não inicializados')
    })

    it('throws and propagates popup errors', async () => {
        const { reauthenticateWithGoogle } = await import('@/services/auth.service')
        mockReauthenticateWithPopup.mockRejectedValue(new Error('popup-blocked'))
        await expect(reauthenticateWithGoogle()).rejects.toThrow('popup-blocked')
    })
})

// ===== updatePassword =====

describe('updatePassword', () => {
    it('updates the current user password', async () => {
        const { updatePassword } = await import('@/services/auth.service')
        mockFirebaseUpdatePassword.mockResolvedValue(undefined)
        await updatePassword('newSecurePassword123')
        expect(mockFirebaseUpdatePassword).toHaveBeenCalledWith(
            (firebaseConfig.auth as any).currentUser,
            'newSecurePassword123',
        )
    })

    it('throws when user is not authenticated', async () => {
        const { updatePassword } = await import('@/services/auth.service')
        ;(firebaseConfig.auth as any).currentUser = undefined
        await expect(updatePassword('newPass')).rejects.toThrow('Usuário não autenticado')
    })

    it('throws and propagates update errors', async () => {
        const { updatePassword } = await import('@/services/auth.service')
        mockFirebaseUpdatePassword.mockRejectedValue(new Error('requires-recent-login'))
        await expect(updatePassword('newPass')).rejects.toThrow('requires-recent-login')
    })
})

// ===== deleteAccount =====

describe('deleteAccount', () => {
    it('deletes the current user account', async () => {
        const { deleteAccount } = await import('@/services/auth.service')
        mockDeleteUser.mockResolvedValue(undefined)
        await deleteAccount()
        expect(mockDeleteUser).toHaveBeenCalledWith((firebaseConfig.auth as any).currentUser)
    })

    it('throws when user is not authenticated', async () => {
        const { deleteAccount } = await import('@/services/auth.service')
        ;(firebaseConfig.auth as any).currentUser = undefined
        await expect(deleteAccount()).rejects.toThrow('Usuário não autenticado')
    })

    it('throws and propagates deletion errors', async () => {
        const { deleteAccount } = await import('@/services/auth.service')
        mockDeleteUser.mockRejectedValue(new Error('requires-recent-login'))
        await expect(deleteAccount()).rejects.toThrow('requires-recent-login')
    })
})
