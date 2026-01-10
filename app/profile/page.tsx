import { Metadata } from 'next'
import { ProfilePage } from '@/components/pages/profile-page'

export const metadata: Metadata = {
  title: 'Perfil - Histórico Acadêmico',
  description: 'Gerencie seu perfil e configurações do Histórico Acadêmico',
}

export default function Profile() {
  return <ProfilePage />
}

