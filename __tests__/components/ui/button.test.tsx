import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('deve renderizar botão com texto', () => {
    render(<Button>Clique aqui</Button>)
    expect(screen.getByText('Clique aqui')).toBeInTheDocument()
  })

  it('deve aplicar variante default', () => {
    render(<Button variant="default">Botão</Button>)
    const button = screen.getByText('Botão')
    expect(button).toBeInTheDocument()
  })

  it('deve aplicar variante outline', () => {
    render(<Button variant="outline">Botão</Button>)
    const button = screen.getByText('Botão')
    expect(button).toBeInTheDocument()
  })

  it('deve aplicar variante ghost', () => {
    render(<Button variant="ghost">Botão</Button>)
    const button = screen.getByText('Botão')
    expect(button).toBeInTheDocument()
  })

  it('deve aplicar variante destructive', () => {
    render(<Button variant="destructive">Botão</Button>)
    const button = screen.getByText('Botão')
    expect(button).toBeInTheDocument()
  })

  it('deve estar desabilitado quando disabled', () => {
    render(<Button disabled>Botão</Button>)
    const button = screen.getByText('Botão')
    expect(button).toBeDisabled()
  })

  it('deve chamar onClick quando clicado', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Botão</Button>)
    const button = screen.getByText('Botão')
    button.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('deve renderizar como link quando href fornecido', () => {
    render(<Button asChild><a href="/test">Link</a></Button>)
    const link = screen.getByText('Link')
    expect(link).toHaveAttribute('href', '/test')
  })
})
