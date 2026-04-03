import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export default function MateriaisLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
