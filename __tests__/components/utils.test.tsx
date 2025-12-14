import { render, screen } from '@testing-library/react'
import { sanitizeInput } from '@/lib/utils'

// Teste de integração básico para sanitização
describe('Sanitização de Inputs - Integração', () => {
  it('deve sanitizar input antes de renderizar', () => {
    const input = '<script>alert("xss")</script>Texto'
    const sanitizado = sanitizeInput(input)
    
    // Verificar que não contém tags script
    expect(sanitizado).not.toContain('<script>')
    expect(sanitizado).not.toContain('</script>')
  })

  it('deve remover event handlers', () => {
    const input = 'onclick="malicious()"Texto'
    const sanitizado = sanitizeInput(input)
    
    expect(sanitizado).not.toContain('onclick=')
  })

  it('deve remover protocolos JavaScript', () => {
    const input = 'javascript:alert("xss")'
    const sanitizado = sanitizeInput(input)
    
    expect(sanitizado).not.toContain('javascript:')
  })
})
