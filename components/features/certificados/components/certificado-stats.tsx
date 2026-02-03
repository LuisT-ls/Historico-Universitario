import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, CheckCircle, GraduationCap, Hourglass } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stats {
    total: number
    horasValidadas: number
    atividadesAprovadas: number
    horasFaltantes: number
}

interface CertificadoStatsProps {
    stats: Stats
    isLoading: boolean
}

const statsConfig = [
    {
        label: 'Total',
        key: 'total' as const,
        sub: 'Cadastrados',
        icon: FileText,
        iconColor: 'text-primary',
        bgColor: 'bg-primary/10',
        formatValue: (value: number) => value.toString(),
    },
    {
        label: 'Validadas',
        key: 'horasValidadas' as const,
        sub: 'Horas aprovadas',
        icon: CheckCircle,
        iconColor: 'text-green-600',
        bgColor: 'bg-green-500/10',
        formatValue: (value: number) => `${value}h`,
    },
    {
        label: 'Aprovadas',
        key: 'atividadesAprovadas' as const,
        sub: 'Atividades',
        icon: GraduationCap,
        iconColor: 'text-blue-600',
        bgColor: 'bg-blue-500/10',
        formatValue: (value: number) => value.toString(),
    },
    {
        label: 'Faltam',
        key: 'horasFaltantes' as const,
        sub: 'Para meta de 240h',
        icon: Hourglass,
        iconColor: 'text-orange-600',
        bgColor: 'bg-orange-500/10',
        formatValue: (value: number) => `${value}h`,
    },
]

export const CertificadoStats = memo<CertificadoStatsProps>(({ stats, isLoading }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statsConfig.map((stat) => (
                <Card
                    key={stat.key}
                    className="rounded-xl border-none shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                    <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                            <div className={cn('p-2.5 rounded-xl shrink-0', stat.bgColor)}>
                                <stat.icon className={cn('h-5 w-5', stat.iconColor)} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 leading-none mb-1">
                                    {stat.label}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    {isLoading ? (
                                        <Skeleton className="h-6 w-12" />
                                    ) : (
                                        <p className="text-xl font-black leading-none">
                                            {stat.formatValue(stats[stat.key])}
                                        </p>
                                    )}
                                    <span className="text-[10px] font-medium text-muted-foreground truncate">
                                        {stat.sub}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
})

CertificadoStats.displayName = 'CertificadoStats'
