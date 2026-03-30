import { PublicHorariosPage } from '@/components/pages/public-horarios-page'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
    const resolvedParams = await params
    return <PublicHorariosPage userId={resolvedParams.userId} />
}
