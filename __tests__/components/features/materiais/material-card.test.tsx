import React from 'react'
import { render, screen } from '@testing-library/react'
import { MaterialCard } from '@/components/features/materiais/material-card'
import type { Material } from '@/types'

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const baseMaterial: Material = {
  id: 'mat-123' as any,
  titulo: 'Lista 3 — Cálculo A',
  descricao: 'Exercícios de integrais.',
  curso: 'BICTI',
  disciplina: 'Cálculo A',
  semestre: '2024.1',
  tipo: 'lista',
  status: 'approved',
  uploadedBy: 'uid-1' as any,
  uploaderName: 'João Silva',
  arquivoURL: 'https://storage.example.com/file.pdf',
  storagePath: 'materiais/uid-1/file.pdf',
  nomeArquivo: 'lista3.pdf',
  downloadsCount: 42,
  viewsCount: 150,
  likesCount: 8,
  createdAt: new Date(2024, 2, 15), // mês 0-indexed — evita problemas de timezone
}

describe('MaterialCard', () => {
  describe('renderização básica', () => {
    it('exibe o título', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('Lista 3 — Cálculo A')).toBeInTheDocument()
    })

    it('exibe o nome do uploader', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    it('exibe a descrição quando fornecida', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('Exercícios de integrais.')).toBeInTheDocument()
    })

    it('não exibe descrição quando ausente', () => {
      render(<MaterialCard material={{ ...baseMaterial, descricao: undefined }} />)
      expect(screen.queryByText('Exercícios de integrais.')).not.toBeInTheDocument()
    })

    it('exibe a disciplina', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('Cálculo A')).toBeInTheDocument()
    })

    it('exibe o semestre', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('2024.1')).toBeInTheDocument()
    })

    it('exibe o contador de downloads', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('42')).toBeInTheDocument()
    })

    it('exibe a data formatada', () => {
      render(<MaterialCard material={baseMaterial} />)
      // Regex tolerante a variações de separador e locale
      expect(screen.getByText(/15.03.2024/)).toBeInTheDocument()
    })

    it('exibe — quando sem data', () => {
      render(<MaterialCard material={{ ...baseMaterial, createdAt: undefined }} />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })
  })

  describe('badges de tipo', () => {
    it('exibe o badge do tipo correto para lista', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('Lista de Exercícios')).toBeInTheDocument()
    })

    it('exibe o badge correto para prova', () => {
      render(<MaterialCard material={{ ...baseMaterial, tipo: 'prova' }} />)
      expect(screen.getByText('Prova')).toBeInTheDocument()
    })

    it('exibe o badge correto para resumo', () => {
      render(<MaterialCard material={{ ...baseMaterial, tipo: 'resumo' }} />)
      expect(screen.getByText('Resumo')).toBeInTheDocument()
    })

    it('exibe o badge correto para apostila', () => {
      render(<MaterialCard material={{ ...baseMaterial, tipo: 'apostila' }} />)
      expect(screen.getByText('Apostila')).toBeInTheDocument()
    })

    it('exibe o badge correto para slides', () => {
      render(<MaterialCard material={{ ...baseMaterial, tipo: 'slides' }} />)
      expect(screen.getByText('Slides')).toBeInTheDocument()
    })
  })

  describe('badge de curso', () => {
    it('exibe BICTI', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByText('BICTI')).toBeInTheDocument()
    })

    it('exibe Eng. Produção para ENG_PROD', () => {
      render(<MaterialCard material={{ ...baseMaterial, curso: 'ENG_PROD' }} />)
      expect(screen.getByText('Eng. Produção')).toBeInTheDocument()
    })
  })

  describe('status', () => {
    it('não exibe badge de status por padrão', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.queryByText('Aprovado')).not.toBeInTheDocument()
    })

    it('exibe badge de status quando showStatus=true', () => {
      render(<MaterialCard material={baseMaterial} showStatus />)
      expect(screen.getByText('Aprovado')).toBeInTheDocument()
    })

    it('exibe status pendente corretamente', () => {
      render(<MaterialCard material={{ ...baseMaterial, status: 'pending' }} showStatus />)
      expect(screen.getByText('Pendente')).toBeInTheDocument()
    })
  })

  describe('link de navegação', () => {
    it('aponta para a página de detalhe correta', () => {
      render(<MaterialCard material={baseMaterial} />)
      expect(screen.getByRole('link')).toHaveAttribute('href', '/materiais/mat-123')
    })
  })
})
