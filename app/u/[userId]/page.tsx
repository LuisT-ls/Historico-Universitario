import { PublicProfilePage } from '@/components/pages/public-profile-page'

export const dynamic = 'force-dynamic'

export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
    const resolvedParams = await params
    return <PublicProfilePage userId={resolvedParams.userId} />
}
