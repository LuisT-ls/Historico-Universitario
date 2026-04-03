import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockIsLiked = jest.fn()
const mockAddLike = jest.fn()
const mockRemoveLike = jest.fn()

jest.mock('@/services/likes.service', () => ({
  isLiked: (...args: any[]) => mockIsLiked(...args),
  addLike: (...args: any[]) => mockAddLike(...args),
  removeLike: (...args: any[]) => mockRemoveLike(...args),
}))

jest.mock('@/lib/toast', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockUseAuth = jest.fn()
jest.mock('@/components/auth-provider', () => ({
  useAuth: () => mockUseAuth(),
}))

import { LikeButton } from '@/components/features/materiais/like-button'
import { toast } from '@/lib/toast'

describe('LikeButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockIsLiked.mockResolvedValue(false)
    mockAddLike.mockResolvedValue(undefined)
    mockRemoveLike.mockResolvedValue(undefined)
  })

  describe('sem usuário autenticado', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: null })
    })

    it('renderiza com a contagem inicial quando > 0', () => {
      render(<LikeButton materialId="mat-1" initialCount={5} />)
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('não exibe contagem quando é 0', () => {
      render(<LikeButton materialId="mat-1" initialCount={0} />)
      expect(screen.queryByText('0')).not.toBeInTheDocument()
    })

    it('exibe toast de erro ao tentar curtir sem login', async () => {
      render(<LikeButton materialId="mat-1" initialCount={0} />)

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringMatching(/login/i))
      })
    })

    it('não chama addLike sem autenticação', async () => {
      render(<LikeButton materialId="mat-1" initialCount={0} />)
      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockAddLike).not.toHaveBeenCalled()
      })
    })
  })

  describe('com usuário autenticado', () => {
    const mockUser = { uid: 'uid-1' }

    beforeEach(() => {
      mockUseAuth.mockReturnValue({ user: mockUser })
    })

    it('verifica estado de like ao montar', async () => {
      render(<LikeButton materialId="mat-1" initialCount={3} />)
      await waitFor(() => {
        expect(mockIsLiked).toHaveBeenCalledWith('mat-1', 'uid-1')
      })
    })

    it('incrementa a contagem ao curtir', async () => {
      mockIsLiked.mockResolvedValue(false)
      render(<LikeButton materialId="mat-1" initialCount={5} />)

      await waitFor(() => expect(mockIsLiked).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockAddLike).toHaveBeenCalledWith('mat-1', 'uid-1')
      })
    })

    it('decrementa a contagem ao descurtir', async () => {
      mockIsLiked.mockResolvedValue(true)
      render(<LikeButton materialId="mat-1" initialCount={5} />)

      await waitFor(() => expect(mockIsLiked).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(mockRemoveLike).toHaveBeenCalledWith('mat-1', 'uid-1')
      })
    })

    it('exibe toast de erro quando a operação falha', async () => {
      mockIsLiked.mockResolvedValue(false)
      mockAddLike.mockRejectedValue(new Error('Network error'))

      render(<LikeButton materialId="mat-1" initialCount={0} />)
      await waitFor(() => expect(mockIsLiked).toHaveBeenCalled())

      fireEvent.click(screen.getByRole('button'))

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled()
      })
    })
  })
})
