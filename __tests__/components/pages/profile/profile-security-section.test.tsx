import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import type { User } from 'firebase/auth'

// ─── service mocks ────────────────────────────────────────────────────────────

const mockUpdatePassword = jest.fn()
const mockDeleteAccount = jest.fn()
const mockReauthenticateWithEmail = jest.fn()
const mockReauthenticateWithGoogle = jest.fn()

jest.mock('@/services/auth.service', () => ({
  updatePassword: (...args: any[]) => mockUpdatePassword(...args),
  deleteAccount: (...args: any[]) => mockDeleteAccount(...args),
  reauthenticateWithEmail: (...args: any[]) => mockReauthenticateWithEmail(...args),
  reauthenticateWithGoogle: (...args: any[]) => mockReauthenticateWithGoogle(...args),
}))

jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

jest.mock('@/lib/error-handler', () => ({
  getFirebaseErrorMessage: jest.fn(() => 'Erro Firebase'),
}))

// ─── UI component mocks (avoids Radix UI portal/pointer issues in jsdom) ──────

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div role="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}))

jest.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, ...rest }: any) => (
    <button onClick={onClick} disabled={disabled} data-variant={variant} {...rest}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, type, ...rest }: any) => (
    <input onChange={onChange} value={value} type={type ?? 'text'} {...rest} />
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children }: { children: React.ReactNode }) => <label>{children}</label>,
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onChange, value, 'aria-label': ariaLabel }: any) => (
    <select aria-label={ariaLabel} onChange={onChange} value={value}>
      {children}
    </select>
  ),
}))

import { ProfileSecuritySection } from '@/components/pages/profile/profile-security-section'
import { toast } from '@/lib/toast'

// ─── fixtures ─────────────────────────────────────────────────────────────────

const emailUser = {
  uid: 'uid-1',
  email: 'test@example.com',
  providerData: [{ providerId: 'password' }],
} as unknown as User

const googleUser = {
  uid: 'uid-2',
  email: 'google@example.com',
  providerData: [{ providerId: 'google.com' }],
} as unknown as User

const mockStatistics = {
  totalDisciplines: 10,
  completedDisciplines: 8,
  inProgressDisciplines: 2,
  averageGrade: 8.5,
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function renderSection(user: User | null = emailUser, onExportData = jest.fn()) {
  return { onExportData, ...render(
    <ProfileSecuritySection
      user={user}
      profile={null}
      statistics={mockStatistics}
      onExportData={onExportData}
    />
  )}
}

// ─── export data ──────────────────────────────────────────────────────────────

describe('ProfileSecuritySection — export data', () => {
  beforeEach(() => {
    mockDeleteAccount.mockResolvedValue(undefined)
    mockReauthenticateWithEmail.mockResolvedValue(undefined)
    mockUpdatePassword.mockResolvedValue(undefined)
  })

  it('calls onExportData with json by default', async () => {
    const onExportData = jest.fn().mockResolvedValue(undefined)
    renderSection(emailUser, onExportData)
    fireEvent.click(screen.getByText(/Exportar Dados/i))
    await waitFor(() => expect(onExportData).toHaveBeenCalledWith('json'))
  })

  it('calls onExportData with xlsx after changing format to xlsx', async () => {
    const onExportData = jest.fn().mockResolvedValue(undefined)
    renderSection(emailUser, onExportData)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'xlsx' } })
    fireEvent.click(screen.getByText(/Exportar Dados/i))
    await waitFor(() => expect(onExportData).toHaveBeenCalledWith('xlsx'))
  })

  it('calls onExportData with pdf after changing format to pdf', async () => {
    const onExportData = jest.fn().mockResolvedValue(undefined)
    renderSection(emailUser, onExportData)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'pdf' } })
    fireEvent.click(screen.getByText(/Exportar Dados/i))
    await waitFor(() => expect(onExportData).toHaveBeenCalledWith('pdf'))
  })
})

// ─── change password dialog ───────────────────────────────────────────────────

describe('ProfileSecuritySection — change password dialog', () => {
  beforeEach(() => {
    mockReauthenticateWithEmail.mockResolvedValue(undefined)
    mockUpdatePassword.mockResolvedValue(undefined)
  })

  it('opens change password dialog when button is clicked', () => {
    renderSection()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Alterar Senha/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('shows three password inputs inside the dialog', () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /Alterar Senha/i }))
    const dialog = screen.getByRole('dialog')
    const inputs = dialog.querySelectorAll('input')
    // current password, new password, confirm password
    expect(inputs.length).toBeGreaterThanOrEqual(3)
  })

  it('does not call updatePassword when passwords do not match', async () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /Alterar Senha/i }))
    const dialog = screen.getByRole('dialog')
    const inputs = dialog.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: 'current' } })
    fireEvent.change(inputs[1], { target: { value: 'newPass1' } })
    fireEvent.change(inputs[2], { target: { value: 'newPass2-mismatch' } })
    fireEvent.click(within(dialog).getByText(/Confirmar Alteração/i))
    await waitFor(() => expect(mockUpdatePassword).not.toHaveBeenCalled())
  })

  it('calls reauthenticateWithEmail and updatePassword when passwords match', async () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /Alterar Senha/i }))
    const dialog = screen.getByRole('dialog')
    const inputs = dialog.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: 'currentPass' } })
    fireEvent.change(inputs[1], { target: { value: 'newPass123' } })
    fireEvent.change(inputs[2], { target: { value: 'newPass123' } })
    fireEvent.click(within(dialog).getByText(/Confirmar Alteração/i))
    await waitFor(() => {
      expect(mockReauthenticateWithEmail).toHaveBeenCalledWith('currentPass')
      expect(mockUpdatePassword).toHaveBeenCalledWith('newPass123')
    })
  })

  it('shows success toast after password change', async () => {
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /Alterar Senha/i }))
    const dialog = screen.getByRole('dialog')
    const inputs = dialog.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: 'currentPass' } })
    fireEvent.change(inputs[1], { target: { value: 'newPass123' } })
    fireEvent.change(inputs[2], { target: { value: 'newPass123' } })
    fireEvent.click(within(dialog).getByText(/Confirmar Alteração/i))
    await waitFor(() => expect(toast.success).toHaveBeenCalled())
  })

  it('shows error toast when reauthentication fails', async () => {
    mockReauthenticateWithEmail.mockRejectedValue(new Error('wrong-password'))
    renderSection()
    fireEvent.click(screen.getByRole('button', { name: /Alterar Senha/i }))
    const dialog = screen.getByRole('dialog')
    const inputs = dialog.querySelectorAll('input')
    fireEvent.change(inputs[0], { target: { value: 'wrongPass' } })
    fireEvent.change(inputs[1], { target: { value: 'new' } })
    fireEvent.change(inputs[2], { target: { value: 'new' } })
    fireEvent.click(within(dialog).getByText(/Confirmar Alteração/i))
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })
})

// ─── delete account dialog ────────────────────────────────────────────────────

describe('ProfileSecuritySection — delete account dialog', () => {
  beforeEach(() => {
    mockDeleteAccount.mockResolvedValue(undefined)
    mockReauthenticateWithEmail.mockResolvedValue(undefined)
    mockReauthenticateWithGoogle.mockResolvedValue(undefined)
  })

  it('opens delete account dialog when button is clicked', () => {
    renderSection()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    fireEvent.click(screen.getByText(/Excluir Permanentemente/i))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('delete button inside dialog is disabled before typing EXCLUIR', () => {
    renderSection()
    fireEvent.click(screen.getByText(/Excluir Permanentemente/i))
    const dialog = screen.getByRole('dialog')
    const deleteBtn = within(dialog).getByRole('button', { name: /Excluir Permanentemente/i })
    expect(deleteBtn).toBeDisabled()
  })

  it('delete button is enabled after typing EXCLUIR', () => {
    renderSection()
    fireEvent.click(screen.getByText(/Excluir Permanentemente/i))
    const dialog = screen.getByRole('dialog')
    const confirmInput = dialog.querySelector('input[type="text"]')!
    fireEvent.change(confirmInput, { target: { value: 'EXCLUIR' } })
    const deleteBtn = within(dialog).getByRole('button', { name: /Excluir Permanentemente/i })
    expect(deleteBtn).not.toBeDisabled()
  })

  it('calls reauthenticateWithEmail + deleteAccount for email user', async () => {
    renderSection(emailUser)
    fireEvent.click(screen.getByText(/Excluir Permanentemente/i))
    const dialog = screen.getByRole('dialog')
    const inputs = dialog.querySelectorAll('input')
    // inputs[0] = confirm text, inputs[1] = password (email user shows password field)
    fireEvent.change(inputs[0], { target: { value: 'EXCLUIR' } })
    fireEvent.change(inputs[1], { target: { value: 'myPassword' } })
    fireEvent.click(within(dialog).getByRole('button', { name: /Excluir Permanentemente/i }))
    await waitFor(() => {
      expect(mockReauthenticateWithEmail).toHaveBeenCalledWith('myPassword')
      expect(mockDeleteAccount).toHaveBeenCalledTimes(1)
    })
  })

  it('calls reauthenticateWithGoogle + deleteAccount for Google user', async () => {
    renderSection(googleUser)
    fireEvent.click(screen.getByText(/Excluir Permanentemente/i))
    const dialog = screen.getByRole('dialog')
    const confirmInput = dialog.querySelector('input[type="text"]')!
    fireEvent.change(confirmInput, { target: { value: 'EXCLUIR' } })
    // Google user has no password field
    expect(dialog.querySelector('input[type="password"]')).not.toBeInTheDocument()
    fireEvent.click(within(dialog).getByRole('button', { name: /Excluir Permanentemente/i }))
    await waitFor(() => {
      expect(mockReauthenticateWithGoogle).toHaveBeenCalledTimes(1)
      expect(mockDeleteAccount).toHaveBeenCalledTimes(1)
      expect(mockReauthenticateWithEmail).not.toHaveBeenCalled()
    })
  })

  it('shows error toast when deleteAccount fails', async () => {
    mockDeleteAccount.mockRejectedValue(new Error('requires-recent-login'))
    renderSection(googleUser)
    fireEvent.click(screen.getByText(/Excluir Permanentemente/i))
    const dialog = screen.getByRole('dialog')
    const confirmInput = dialog.querySelector('input[type="text"]')!
    fireEvent.change(confirmInput, { target: { value: 'EXCLUIR' } })
    fireEvent.click(within(dialog).getByRole('button', { name: /Excluir Permanentemente/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalled())
  })
})
