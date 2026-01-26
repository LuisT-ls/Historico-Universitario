import Link from 'next/link'
import { Github, Linkedin, Instagram, Heart, ExternalLink, Share2, Terminal } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-md">
      <div className="container py-12 px-4 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <section>
            <h3 className="text-lg font-bold text-slate-100 mb-6 tracking-tight">Sobre o Projeto</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              O Histórico Acadêmico é uma ferramenta desenvolvida para auxiliar estudantes dos
              cursos de BICTI, Engenharia de Produção e Engenharia Elétrica no acompanhamento do
              seu progresso acadêmico de forma simples e intuitiva.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-100 mb-6 tracking-tight">Desenvolvedor</h3>
            <p className="text-sm text-slate-400 mb-6">
              Desenvolvido com carinho por <strong className="text-slate-200">Luís Teixeira</strong>
            </p>
            <nav className="flex gap-5" aria-label="Redes sociais do desenvolvedor">
              <a
                href="https://github.com/LuisT-ls"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
                aria-label="Visitar perfil do Luís Teixeira no GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com/in/luis-tei"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
                aria-label="Visitar perfil do Luís Teixeira no LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/luis.tei"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all duration-300"
                aria-label="Visitar perfil do Luís Teixeira no Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </nav>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-100 mb-6 tracking-tight">Recursos Úteis</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="https://icti-share.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-300 group"
                >
                  <div className="p-1.5 rounded-md bg-slate-800/50 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                    <Share2 className="h-4 w-4" />
                  </div>
                  <span>ICTI Share</span>
                  <ExternalLink className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </a>
              </li>
              <li>
                <a
                  href="https://icti-python.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all duration-300 group"
                >
                  <div className="p-1.5 rounded-md bg-slate-800/50 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-all">
                    <Terminal className="h-4 w-4" />
                  </div>
                  <span>ICTI Python</span>
                  <ExternalLink className="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </a>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-slate-100 mb-6 tracking-tight flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500 fill-red-500/20" />
              Apoie o Projeto
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Este projeto é totalmente gratuito e open source. Se ele te ajudou, considere dar uma
              estrela no GitHub!
            </p>
            <a
              href="https://github.com/LuisT-ls/Historico-Universitario"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all duration-300 shadow-lg shadow-blue-900/20"
              aria-label="Visitar repositório do projeto no GitHub"
            >
              <Github className="h-4 w-4" />
              Ver no GitHub
            </a>
          </section>
        </div>

        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-slate-500">
          <p className="font-medium">
            &copy; {new Date().getFullYear()} Histórico Acadêmico. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/legal/terms" className="hover:text-slate-300 transition-colors opacity-80 hover:opacity-100">
              Termos de Uso
            </Link>
            <div className="h-1 w-1 rounded-full bg-slate-700" />
            <Link href="/legal/privacy" className="hover:text-slate-300 transition-colors opacity-80 hover:opacity-100">
              Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

