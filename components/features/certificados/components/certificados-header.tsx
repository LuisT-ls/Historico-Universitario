import { GraduationCap } from 'lucide-react'

export const CertificadosHeader = () => {
    return (
        <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-foreground mb-2 flex items-center gap-3 tracking-tight">
                <GraduationCap className="h-8 w-8 text-primary" />
                Certificados
            </h1>
            <p className="text-sm font-medium text-muted-foreground max-w-2xl">
                Gerencie seus comprovantes e atividades complementares para validação de carga horária.
            </p>
        </div>
    )
}
