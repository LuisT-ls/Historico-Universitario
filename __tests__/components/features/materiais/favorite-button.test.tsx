import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockIsFavorite = jest.fn()
const mockAddFavorite = jest.fn()
const mockRemoveFavorite = jest.fn()

jest.mock('@/services/favorites.service', () => ({
  isFavorite: (...args: any[]) => mockIsFavorite(...args),
  addFavorite: (...args: any[]) => mockAddFavorite(...args),
  removeFavorite: (...args: any[]) => mockRemoveFavorite(...args),
}))

jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockUseAuth = jest.fn()
jest.mock('@/components/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))

import { FavoriteButton } from '@/components/features/materiais/favorite-button'
import { toast } from '@/lib/toast'

describe('FavoriteButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsFavorite.mockResolvedValue(false)
    mockAddFavorite.mockResolvedValue(undefined)
    mockRemoveFavorite.mockResolvedValue(undefined)
  })

  describe('sem usuário autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null })
    })

    it('renderiza o botão com aria-label de salvar', () => {
      render(<FavoriteButton materialId="mat-1" variant="full" />)
      expect(screen.getByRole('button', { name: /salvar nos favoritos/i })).toBeInTheDocument()
    })

    it('exibe toast de erro ao tentar salvar sem login', async () => {
      render(<FavoriteButton materialId="mat-1" variant="full" />)
      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/login/i))
      })
    })

    it('não chama addFavorite sem autenticação', async () => {
      render(<FavoriteButton materialId="mat-1" variant="full" />)
      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockAddFavorite).not.toHaveBeenCalled()
      })
    })
  })

  describe('com usuário autenticado', () => {
    const mockUser = { uid: 'uid-1' }

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser })
    })

    it('verifica estado de favorito ao montar', async () => {
      render(<FavoriteButton materialId="mat-1" variant="full" />)
      await waitFor(() => {
        expect(mockIsFavorite).toHaveBeenCalledWith('uid-1', 'mat-1')
      })
    })

    it('mostra aria-label "Remover dos favoritos" quando já é favorito', async () => {
      mockIsFavorite.mockResolvedValue(true)
      render(<FavoriteButton materialId="mat-1" variant="full" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /remover dos favoritos/i })).toBeInTheDocument()
      })
    })

    it('mostra aria-label "Salvar nos favoritos" quando não é favorito', async () => {
      mockIsFavorite.mockResolvedValue(false)
      render(<FavoriteButton materialId="mat-1" variant="full" />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /salvar nos favoritos/i })).toBeInTheDocument()
      })
    })

    it('chama addFavorite ao salvar', async () => {
      mockIsFavorite.mockResolvedValue(false)
      render(<FavoriteButton materialId="mat-1" variant="full" />)

      await waitFor(() => expect(mockIsFavorite).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockAddFavorite).toHaveBeenCalledWith('uid-1', 'mat-1')
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('chama removeFavorite ao dessalvar', async () => {
      mockIsFavorite.mockResolvedValue(true)
      render(<FavoriteButton materialId="mat-1" variant="full" />)

      // Aguarda o aria-label mudar para "Remover" antes de clicar
      await waitFor(() => expect(screen.getByRole('button', { name: /remover dos favoritos/i })).toBeInTheDocument())
      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockRemoveFavorite).toHaveBeenCalledWith('uid-1', 'mat-1')
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('exibe toast de erro quando a operação falha', async () => {
      mockIsFavorite.mockResolvedValue(false)
      mockAddFavorite.mockRejectedValue(new Error('Network error'))

      render(<FavoriteButton materialId="mat-1" variant="full" />)
      await waitFor(() => expect(mockIsFavorite).toHaveBeenCalled())
      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })
  })

  describe('variante icon', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null })
    })

    it('renderiza sem texto na variante icon', () => {
      render(<FavoriteButton materialId="mat-1" variant="icon" />)
      expect(screen.queryByText(/salvar/i)).not.toBeInTheDocument()
    })

    it('tem aria-label acessível', () => {
      render(<FavoriteButton materialId="mat-1" variant="icon" />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label')
    })
  })
})
