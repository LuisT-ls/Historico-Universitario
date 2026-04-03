import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { MaterialFiltersBar } from '@/components/features/materiais/material-filters'
import type { MaterialFilters } from '@/services/materials.service'

describe('MaterialFiltersBar', () => {
  const noOp = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  describe('renderização', () => {
    it('exibe o campo de busca', () => {
      render(<MaterialFiltersBar filters={{}} onChange={noOp} />)
      expect(screen.getByPlaceholderText(/buscar/i)).toBeInTheDocument()
    })

    it('exibe o filtro de curso', () => {
      render(<MaterialFiltersBar filters={{}} onChange={noOp} />)
      expect(screen.getByLabelText(/filtrar por curso/i)).toBeInTheDocument()
    })

    it('exibe o filtro de tipo', () => {
      render(<MaterialFiltersBar filters={{}} onChange={noOp} />)
      expect(screen.getByLabelText(/filtrar por tipo/i)).toBeInTheDocument()
    })

    it('exibe a contagem de resultados quando total fornecido', () => {
      render(<MaterialFiltersBar filters={{}} onChange={noOp} total={15} />)
      expect(screen.getByText('15 resultados')).toBeInTheDocument()
    })

    it('usa singular quando total é 1', () => {
      render(<MaterialFiltersBar filters={{}} onChange={noOp} total={1} />)
      expect(screen.getByText('1 resultado')).toBeInTheDocument()
    })

    it('não exibe contagem quando total não é fornecido', () => {
      render(<MaterialFiltersBar filters={{}} onChange={noOp} />)
      expect(screen.queryByText(/resultado/i)).not.toBeInTheDocument()
    })
  })

  describe('interações', () => {
    it('chama onChange ao digitar na busca', () => {
      const onChange = jest.fn()
      render(<MaterialFiltersBar filters={{}} onChange={onChange} />)

      fireEvent.change(screen.getByPlaceholderText(/buscar/i), {
        target: { value: 'cálculo' },
      })

      expect(onChange).toHaveBeenCalledWith({ search: 'cálculo' })
    })

    it('limpa o campo de busca ao enviar string vazia', () => {
      const onChange = jest.fn()
      render(<MaterialFiltersBar filters={{ search: 'cálculo' }} onChange={onChange} />)

      fireEvent.change(screen.getByPlaceholderText(/buscar/i), {
        target: { value: '' },
      })

      expect(onChange).toHaveBeenCalledWith({ search: undefined, curso: undefined, tipo: undefined })
    })
  })

  describe('chips de filtros ativos', () => {
    it('não exibe chips quando sem filtros ativos', () => {
      render(<MaterialFiltersBar filters={{}} onChange={noOp} />)
      expect(screen.queryByText(/filtros ativos/i)).not.toBeInTheDocument()
    })

    it('exibe chip para busca ativa', () => {
      render(<MaterialFiltersBar filters={{ search: 'cálculo' }} onChange={noOp} />)
      expect(screen.getByText(/"cálculo"/)).toBeInTheDocument()
    })

    it('exibe chip para curso ativo', () => {
      render(<MaterialFiltersBar filters={{ curso: 'BICTI' }} onChange={noOp} />)
      // O chip é um button — usa role para distinguir do <option> no select
      expect(screen.getByRole('button', { name: /remover filtro BICTI/i })).toBeInTheDocument()
    })

    it('exibe chip para tipo ativo', () => {
      render(<MaterialFiltersBar filters={{ tipo: 'prova' }} onChange={noOp} />)
      expect(screen.getByRole('button', { name: /remover filtro Prova/i })).toBeInTheDocument()
    })

    it('exibe "Limpar tudo" quando há filtros ativos', () => {
      render(<MaterialFiltersBar filters={{ search: 'teste' }} onChange={noOp} />)
      expect(screen.getByText(/limpar tudo/i)).toBeInTheDocument()
    })

    it('chama onChange com {} ao clicar em "Limpar tudo"', () => {
      const onChange = jest.fn()
      render(<MaterialFiltersBar filters={{ search: 'teste', curso: 'BICTI' }} onChange={onChange} />)

      fireEvent.click(screen.getByText(/limpar tudo/i))

      expect(onChange).toHaveBeenCalledWith({})
    })

    it('remove filtro individual ao clicar no chip', () => {
      const onChange = jest.fn()
      render(<MaterialFiltersBar filters={{ curso: 'BICTI', tipo: 'prova' }} onChange={onChange} />)

      const chipBICTI = screen.getByLabelText(/remover filtro BICTI/i)
      fireEvent.click(chipBICTI)

      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({ curso: undefined })
      )
    })
  })
})
