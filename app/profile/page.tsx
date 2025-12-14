import { Metadata } from 'next'
import { ProfilePage } from '@/components/pages/profile-page'

export const metadata: Metadata = {
  title: 'Perfil - Histórico Universitário',
  description: 'Gerencie seu perfil e configurações do Histórico Universitário',
}

export default function Profile() {
  return <ProfilePage />
}

