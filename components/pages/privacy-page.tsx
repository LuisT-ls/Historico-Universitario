'use client'

import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shield, ArrowLeft, Mail } from 'lucide-react'

export function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center mb-8 pb-6 border-b">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Política de Privacidade
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Protegemos seus dados com transparência e responsabilidade
              </p>
            </div>

            <div className="space-y-8">
              {/* Seção 1 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  1. Informações Gerais
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Esta Política de Privacidade descreve como o <strong>Histórico Universitário</strong> coleta, usa e protege suas
                  informações pessoais. Ao usar nosso aplicativo, você concorda com as práticas descritas nesta política.
                </p>
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-sm">
                    <strong>Última atualização:</strong> 15/07/2025
                  </p>
                  <p className="text-sm">
                    <strong>Versão:</strong> 2.0
                  </p>
                </div>
              </section>

              {/* Seção 2 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  2. Informações que Coletamos
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">2.1 Informações de Conta</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Nome completo:</strong> Para identificação e personalização</li>
                    <li><strong>E-mail institucional:</strong> Para autenticação e comunicação</li>
                    <li><strong>Senha:</strong> Criptografada para segurança da conta</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">2.2 Dados Acadêmicos</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Disciplinas cursadas:</strong> Código, nome, nota, carga horária</li>
                    <li><strong>Períodos acadêmicos:</strong> Semestres e anos letivos</li>
                    <li><strong>Resultados acadêmicos:</strong> Aprovações, reprovações, trancamentos</li>
                    <li><strong>Atividades complementares:</strong> Horas e tipos de atividades</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">2.3 Dados de Uso</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Logs de acesso:</strong> Data e hora de login</li>
                    <li><strong>Preferências:</strong> Configurações do usuário</li>
                    <li><strong>Dispositivos:</strong> Informações básicas do navegador</li>
                  </ul>
                </div>
              </section>

              {/* Seção 3 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  3. Como Usamos suas Informações
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">3.1 Funcionalidades Principais</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Gerenciamento acadêmico:</strong> Organizar e visualizar disciplinas</li>
                    <li><strong>Cálculos acadêmicos:</strong> Média geral, CR, PCH, PCR</li>
                    <li><strong>Relatórios:</strong> Gerar estatísticas e gráficos</li>
                    <li><strong>Sincronização:</strong> Manter dados atualizados entre dispositivos</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">3.2 Melhorias do Serviço</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Análise de uso:</strong> Identificar funcionalidades mais utilizadas</li>
                    <li><strong>Correção de bugs:</strong> Resolver problemas técnicos</li>
                    <li><strong>Novas funcionalidades:</strong> Desenvolver melhorias baseadas no uso</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">3.3 Comunicação</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Notificações importantes:</strong> Atualizações de segurança</li>
                    <li><strong>Suporte técnico:</strong> Resposta a solicitações de ajuda</li>
                    <li><strong>Recuperação de conta:</strong> Processo de reset de senha</li>
                  </ul>
                </div>
              </section>

              {/* Seção 4 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  4. Compartilhamento de Dados
                </h2>
                
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-muted-foreground">
                    <strong>Importante:</strong> Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros para fins comerciais.
                  </p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">4.1 Serviços Essenciais</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Firebase (Google):</strong> Autenticação e armazenamento seguro</li>
                    <li><strong>Vercel:</strong> Hospedagem e distribuição do aplicativo</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">4.2 Requisitos Legais</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Ordem judicial:</strong> Quando exigido por lei</li>
                    <li><strong>Proteção de direitos:</strong> Para defender nossos direitos</li>
                    <li><strong>Segurança:</strong> Para prevenir fraudes ou abusos</li>
                  </ul>
                </div>
              </section>

              {/* Seção 5 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  5. Segurança dos Dados
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">5.1 Medidas de Proteção</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Criptografia:</strong> Dados transmitidos e armazenados com criptografia</li>
                    <li><strong>Autenticação segura:</strong> Login com Google e e-mail/senha</li>
                    <li><strong>Controle de acesso:</strong> Apenas você acessa seus dados</li>
                    <li><strong>Backup seguro:</strong> Dados protegidos em servidores confiáveis</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">5.2 Sua Responsabilidade</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Senha forte:</strong> Use senhas únicas e seguras</li>
                    <li><strong>Logout:</strong> Sempre faça logout em dispositivos compartilhados</li>
                    <li><strong>Dispositivos seguros:</strong> Mantenha seus dispositivos atualizados</li>
                  </ul>
                </div>
              </section>

              {/* Seção 6 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  6. Seus Direitos
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">6.1 Acesso e Controle</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Visualizar dados:</strong> Acesse todas as suas informações</li>
                    <li><strong>Corrigir dados:</strong> Atualize informações incorretas</li>
                    <li><strong>Excluir dados:</strong> Remova suas informações quando desejar</li>
                    <li><strong>Exportar dados:</strong> Baixe seus dados em formato legível</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">6.2 Como Exercer seus Direitos</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Através do aplicativo:</strong> Use as funcionalidades de gerenciamento</li>
                    <li><strong>Contato direto:</strong> Entre em contato conosco</li>
                    <li><strong>Prazo de resposta:</strong> Até 30 dias para solicitações</li>
                  </ul>
                </div>
              </section>

              {/* Seção 7 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  7. Cookies e Tecnologias
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">7.1 Cookies Essenciais</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Autenticação:</strong> Manter você logado</li>
                    <li><strong>Preferências:</strong> Lembrar suas configurações</li>
                    <li><strong>Segurança:</strong> Proteger contra ataques</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">7.2 Controle de Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Você pode controlar cookies através das configurações do seu navegador. Note que desabilitar cookies essenciais pode afetar o funcionamento do aplicativo.
                  </p>
                </div>
              </section>

              {/* Seção 8 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  8. Retenção de Dados
                </h2>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">8.1 Período de Retenção</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li><strong>Dados ativos:</strong> Mantidos enquanto sua conta estiver ativa</li>
                    <li><strong>Conta inativa:</strong> Dados mantidos por 2 anos</li>
                    <li><strong>Exclusão:</strong> Dados removidos permanentemente após solicitação</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-foreground">8.2 Backup e Recuperação</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Mantemos backups por até 30 dias para recuperação em caso de problemas técnicos. Após este período, os backups são excluídos permanentemente.
                  </p>
                </div>
              </section>

              {/* Seção 9 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  9. Menores de Idade
                </h2>
                
                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <p className="text-muted-foreground">
                    <strong>Importante:</strong> Nosso aplicativo não é destinado a menores de 13 anos. Não coletamos intencionalmente dados de crianças menores de 13 anos.
                  </p>
                </div>

                <p className="text-muted-foreground leading-relaxed">
                  Se você é pai ou responsável e acredita que seu filho forneceu dados pessoais, entre em contato conosco imediatamente.
                </p>
              </section>

              {/* Seção 10 */}
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-primary border-l-4 border-primary pl-4">
                  10. Alterações na Política
                </h2>
                
                <p className="text-muted-foreground leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através de:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                  <li><strong>Notificação no aplicativo:</strong> Alerta visível na interface</li>
                  <li><strong>E-mail:</strong> Comunicação direta para usuários ativos</li>
                  <li><strong>Data de vigência:</strong> Nova política entra em vigor na data especificada</li>
                </ul>
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

              {/* Contato */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <h3 className="text-xl font-semibold text-primary">Entre em Contato</h3>
                  </div>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Para questões sobre privacidade:</strong></p>
                    <p><strong>E-mail:</strong> luisps4.lt@gmail.com</p>
                    <p><strong>Assunto:</strong> Política de Privacidade - Histórico Universitário</p>
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
                <p><strong>Versão da política:</strong> 2.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

