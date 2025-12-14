'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, ArrowLeft, Mail, AlertTriangle } from 'lucide-react'

export function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center mb-8 pb-6 border-b">
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="h-8 w-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Termos de Uso
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Conheça as regras e responsabilidades do uso do nosso aplicativo
              </p>
            </div>

            <div className="space-y-8">
              {/* Seção 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  1. Aceitação dos Termos
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Ao acessar e usar o <strong>Histórico Universitário</strong>, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve usar nosso aplicativo.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-sm">
                    <strong>Última atualização:</strong> 15/07/2025
                  </p>
                  <p className="text-sm">
                    <strong>Versão:</strong> 2.0
                  </p>
                  <p className="text-sm">
                    <strong>Vigência:</strong> Imediata após publicação
                  </p>
                </div>
              </section>

              {/* Seção 2 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  2. Descrição do Serviço
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">2.1 O que é o Histórico Universitário</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    O Histórico Universitário é uma aplicação web que permite aos estudantes universitários:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Gerenciar disciplinas:</strong> Adicionar, editar e remover disciplinas cursadas</li>
                    <li><strong>Calcular estatísticas:</strong> Média geral, CR, PCH, PCR e outros indicadores</li>
                    <li><strong>Visualizar progresso:</strong> Gráficos e relatórios do desempenho acadêmico</li>
                    <li><strong>Sincronizar dados:</strong> Acessar informações de qualquer dispositivo</li>
                    <li><strong>Exportar dados:</strong> Baixar relatórios em diferentes formatos</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">2.2 Funcionalidades Disponíveis</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Autenticação segura:</strong> Login com Google ou e-mail/senha</li>
                    <li><strong>Armazenamento em nuvem:</strong> Dados sincronizados via Firebase</li>
                    <li><strong>Interface responsiva:</strong> Funciona em desktop e mobile</li>
                    <li><strong>Modo escuro:</strong> Opção de tema para melhor experiência</li>
                  </ul>
                </div>
              </section>

              {/* Seção 3 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  3. Elegibilidade e Registro
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">3.1 Requisitos para Uso</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Idade mínima:</strong> 13 anos ou maior</li>
                    <li><strong>Capacidade legal:</strong> Capacidade para celebrar contratos</li>
                    <li><strong>E-mail válido:</strong> E-mail institucional ou pessoal válido</li>
                    <li><strong>Dispositivo compatível:</strong> Navegador web moderno</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">3.2 Processo de Registro</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Informações obrigatórias:</strong> Nome completo e e-mail</li>
                    <li><strong>Verificação de e-mail:</strong> Confirmação da conta</li>
                    <li><strong>Senha segura:</strong> Mínimo de 6 caracteres</li>
                    <li><strong>Aceitação dos termos:</strong> Concordância com esta política</li>
                  </ul>
                </div>

                <div className="bg-yellow-500/10 p-4 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm">
                      <strong>Atenção:</strong> Você é responsável por manter a confidencialidade de suas credenciais de acesso. Não compartilhe sua senha com terceiros.
                    </p>
                  </div>
                </div>
              </section>

              {/* Seção 4 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  4. Uso Aceitável
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">4.1 Condutas Permitidas</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Uso pessoal:</strong> Aplicação para fins educacionais</li>
                    <li><strong>Dados próprios:</strong> Inserir apenas suas informações acadêmicas</li>
                    <li><strong>Backup pessoal:</strong> Exportar seus dados para arquivo</li>
                    <li><strong>Compartilhamento responsável:</strong> Relatórios para fins acadêmicos</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">4.2 Condutas Proibidas</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Uso comercial:</strong> Venda ou aluguel do serviço</li>
                    <li><strong>Dados falsos:</strong> Inserção de informações fraudulentas</li>
                    <li><strong>Acesso não autorizado:</strong> Tentativas de hack ou invasão</li>
                    <li><strong>Spam ou abuso:</strong> Uso excessivo que prejudique outros usuários</li>
                    <li><strong>Violar leis:</strong> Qualquer atividade ilegal</li>
                    <li><strong>Engenharia reversa:</strong> Tentar copiar ou modificar o código</li>
                  </ul>
                </div>
              </section>

              {/* Seção 5 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  5. Propriedade Intelectual
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">5.1 Direitos Reservados</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Software:</strong> Código fonte e funcionalidades são protegidos</li>
                    <li><strong>Design:</strong> Interface e elementos visuais são exclusivos</li>
                    <li><strong>Marca:</strong> "Histórico Universitário" é marca registrada</li>
                    <li><strong>Conteúdo:</strong> Textos e documentação são protegidos</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">5.2 Licença de Uso</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Concedemos a você uma licença limitada, não exclusiva, não transferível e revogável para usar o aplicativo conforme estes termos. Esta licença não inclui:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Redistribuição:</strong> Vender ou distribuir o serviço</li>
                    <li><strong>Modificação:</strong> Alterar o código ou funcionalidades</li>
                    <li><strong>Engenharia reversa:</strong> Descompilar ou analisar o código</li>
                  </ul>
                </div>
              </section>

              {/* Seção 6 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  6. Privacidade e Dados
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">6.1 Coleta de Dados</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Coletamos apenas os dados necessários para o funcionamento do serviço:
                  </p>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Dados de conta:</strong> Nome, e-mail e senha</li>
                    <li><strong>Dados acadêmicos:</strong> Disciplinas e notas inseridas</li>
                    <li><strong>Dados de uso:</strong> Logs de acesso e preferências</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">6.2 Proteção de Dados</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Criptografia:</strong> Dados transmitidos e armazenados com segurança</li>
                    <li><strong>Controle de acesso:</strong> Apenas você acessa seus dados</li>
                    <li><strong>Backup seguro:</strong> Dados protegidos em servidores confiáveis</li>
                    <li><strong>Conformidade:</strong> Seguimos as melhores práticas de segurança</li>
                  </ul>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-muted-foreground">
                    <strong>Importante:</strong> Consulte nossa{' '}
                    <Link href="/legal/privacy" className="text-primary hover:underline font-medium">
                      Política de Privacidade
                    </Link>
                    {' '}para informações detalhadas sobre como tratamos seus dados.
                  </p>
                </div>
              </section>

              {/* Seção 7 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  7. Disponibilidade e Manutenção
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">7.1 Disponibilidade do Serviço</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Esforço comercial:</strong> Buscamos manter o serviço sempre disponível</li>
                    <li><strong>Manutenção programada:</strong> Avisamos com antecedência</li>
                    <li><strong>Força maior:</strong> Não nos responsabilizamos por interrupções externas</li>
                    <li><strong>Atualizações:</strong> Melhorias contínuas do serviço</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">7.2 Suporte Técnico</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Documentação:</strong> Guias e tutoriais disponíveis</li>
                    <li><strong>E-mail de suporte:</strong> Resposta em até 5 dias úteis</li>
                    <li><strong>FAQ:</strong> Perguntas frequentes no site</li>
                    <li><strong>Comunidade:</strong> Fórum para troca de experiências</li>
                  </ul>
                </div>
              </section>

              {/* Seção 8 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  8. Limitações de Responsabilidade
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">8.1 O que Não Cobrimos</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Perda de dados:</strong> Backup é responsabilidade do usuário</li>
                    <li><strong>Uso inadequado:</strong> Consequências do uso incorreto</li>
                    <li><strong>Dispositivos:</strong> Problemas de hardware ou software</li>
                    <li><strong>Conectividade:</strong> Problemas de internet do usuário</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">8.2 Limitação de Danos</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Em nenhuma circunstância seremos responsáveis por danos indiretos, incidentais, especiais ou consequenciais, incluindo perda de lucros, dados ou uso.
                  </p>
                </div>

                <div className="bg-yellow-500/10 p-4 rounded-lg border-l-4 border-yellow-500">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-muted-foreground text-sm">
                      <strong>Importante:</strong> O aplicativo é fornecido "como está" e "conforme disponível", sem garantias de qualquer natureza.
                    </p>
                  </div>
                </div>
              </section>

              {/* Seção 9 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  9. Encerramento da Conta
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">9.1 Cancelamento pelo Usuário</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Direito de cancelar:</strong> A qualquer momento</li>
                    <li><strong>Exportação de dados:</strong> Baixar dados antes do cancelamento</li>
                    <li><strong>Exclusão de dados:</strong> Remoção permanente após solicitação</li>
                    <li><strong>Prazo de processamento:</strong> Até 30 dias</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">9.2 Suspensão pela Plataforma</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Violação dos termos:</strong> Uso inadequado do serviço</li>
                    <li><strong>Atividade suspeita:</strong> Comportamento que prejudique outros</li>
                    <li><strong>Inatividade prolongada:</strong> Contas inativas por mais de 2 anos</li>
                    <li><strong>Notificação prévia:</strong> Aviso antes da suspensão</li>
                  </ul>
                </div>
              </section>

              {/* Seção 10 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  10. Modificações dos Termos
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">10.1 Direito de Modificar</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. As modificações entrarão em vigor imediatamente após a publicação.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">10.2 Notificação de Mudanças</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Notificação no app:</strong> Alerta visível na interface</li>
                    <li><strong>E-mail:</strong> Comunicação direta para usuários ativos</li>
                    <li><strong>Data de vigência:</strong> Nova política entra em vigor na data especificada</li>
                    <li><strong>Continuidade do uso:</strong> Uso continuado indica aceitação</li>
                  </ul>
                </div>
              </section>

              {/* Seção 11 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  11. Notificações e Alertas
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  O Histórico Universitário pode exibir notificações na interface para informar sobre ações, erros, avisos, lembretes ou novidades. O usuário pode ativar ou desativar todas as notificações a qualquer momento nas configurações da conta.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Ao desativar as notificações, nenhum alerta visual será exibido em nenhuma parte do sistema, incluindo avisos importantes, confirmações de ações, erros e lembretes. O usuário é responsável por acompanhar manualmente o andamento de suas ações e dados enquanto as notificações estiverem desativadas.
                </p>
              </section>

              {/* Seção 12 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  12. Lei Aplicável e Jurisdição
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">12.1 Lei Brasileira</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Estes termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais brasileiros.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">12.2 Resolução de Conflitos</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Negociação:</strong> Tentativa de resolução amigável</li>
                    <li><strong>Mediação:</strong> Processo de mediação quando aplicável</li>
                    <li><strong>Jurisdição:</strong> Tribunais competentes do Brasil</li>
                  </ul>
                </div>
              </section>

              {/* Contato */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-primary">Entre em Contato</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Para questões sobre os termos:</strong></p>
                    <p><strong>E-mail:</strong> luisps4.lt@gmail.com</p>
                    <p><strong>Assunto:</strong> Termos de Uso - Histórico Universitário</p>
                    <p><strong>Prazo de resposta:</strong> Até 5 dias úteis</p>
                  </div>
                </CardContent>
              </Card>

              {/* Botão Voltar */}
              <div className="text-center pt-6">
                <Link href="/">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar à Página Principal
                  </Button>
                </Link>
              </div>

              {/* Última atualização */}
              <div className="text-center pt-6 border-t text-sm text-muted-foreground">
                <p><strong>Última atualização:</strong> Julho de 2025</p>
                <p><strong>Versão dos termos:</strong> 2.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

