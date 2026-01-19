'use client'

import { Component, type ReactNode } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { logger } from '@/lib/logger'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
    hasError: boolean
    error?: Error
    errorInfo?: React.ErrorInfo
}

/**
 * Error Boundary component para capturar erros não tratados
 * e prevenir que a aplicação inteira quebre.
 * 
 * @example
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        // Atualiza o state para que o próximo render mostre a UI de fallback
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log do erro para o sistema de logging
        logger.error('ErrorBoundary capturou um erro:', {
            error: error.toString(),
            componentStack: errorInfo.componentStack,
        })

        // Callback customizado se fornecido
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }

        // Atualiza o state com informações do erro
        this.setState({ errorInfo })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined })
    }

    render() {
        if (this.state.hasError) {
            // UI de fallback customizada se fornecida
            if (this.props.fallback) {
                return this.props.fallback
            }

            // UI de fallback padrão
            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <Alert variant="destructive" className="max-w-2xl">
                        <AlertCircle className="h-5 w-5" />
                        <AlertTitle className="text-lg font-semibold mb-2">
                            Algo deu errado
                        </AlertTitle>
                        <AlertDescription className="space-y-4">
                            <p>
                                Desculpe, ocorreu um erro inesperado. Por favor, tente recarregar a página ou
                                volte mais tarde.
                            </p>
                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mt-4 p-4 bg-muted rounded-md">
                                    <summary className="cursor-pointer font-medium mb-2">
                                        Detalhes do erro (ambiente de desenvolvimento)
                                    </summary>
                                    <pre className="text-xs overflow-auto mt-2">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}
                            <div className="flex gap-2 mt-4">
                                <Button onClick={this.handleReset} variant="outline">
                                    Tentar novamente
                                </Button>
                                <Button onClick={() => window.location.href = '/'}>
                                    Ir para página inicial
                                </Button>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )
        }

        return this.props.children
    }
}
