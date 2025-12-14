import Link from 'next/link'
import { Github, Linkedin, Instagram, Heart } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <section>
            <h3 className="text-lg font-semibold mb-4">Sobre o Projeto</h3>
            <p className="text-sm text-muted-foreground">
              O Histórico Universitário é uma ferramenta desenvolvida para auxiliar estudantes dos
              cursos de BICTI, Engenharia de Produção e Engenharia Elétrica no acompanhamento do
              seu progresso acadêmico.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4">Desenvolvedor</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Desenvolvido por <strong>Luís Teixeira</strong>
            </p>
            <nav className="flex gap-4" aria-label="Redes sociais do desenvolvedor">
              <a
                href="https://github.com/LuisT-ls"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Visitar perfil do Luís Teixeira no GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/luis-tei"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Visitar perfil do Luís Teixeira no LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/luis.tei"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Visitar perfil do Luís Teixeira no Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </nav>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Apoie o Projeto
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Este projeto é totalmente gratuito e open source. Se ele te ajudou, considere dar uma
              estrela no GitHub!
            </p>
            <a
              href="https://github.com/LuisT-ls/Historico-Universitario"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
              aria-label="Visitar repositório do projeto no GitHub"
            >
              <Github className="h-4 w-4" />
              Ver no GitHub
            </a>
          </section>
        </div>

        <div className="border-t pt-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Histórico Universitário - Todos os direitos
            reservados |{' '}
            <Link href="/legal/terms" className="hover:underline">
              Termos de Uso
            </Link>{' '}
            |{' '}
            <Link href="/legal/privacy" className="hover:underline">
              Política de Privacidade
            </Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

