# MANUAL DO USUÁRIO
## Histórico Acadêmico UFBA

**Versão do Software:** 2.4
**Versão do Documento:** 1.1
**Revisão:** 1.1 — Correções aplicadas em março de 2026
**Data:** Março de 2026
**Autor do Software:** Luís Antonio Souza Teixeira
**Instituição:** ICTI — Universidade Federal da Bahia, Campus de Camaçari
**Contato / Repositório:** https://github.com/LuisT-ls/Historico-Universitario
**Acesso ao Sistema:** https://historicoacademico.vercel.app

---

## Índice

1. [Apresentação do Sistema](#1-apresentação-do-sistema)
2. [Requisitos para Uso](#2-requisitos-para-uso)
3. [Primeiros Passos](#3-primeiros-passos)
4. [Importando seu Histórico Acadêmico](#4-importando-seu-histórico-acadêmico)
5. [Painel Principal — Seu Histórico](#5-painel-principal--seu-histórico)
6. [Grade Curricular](#6-grade-curricular)
7. [Grade de Horários](#7-grade-de-horários)
8. [Simulador "E Se?"](#8-simulador-e-se)
9. [Certificados e Atividades Complementares](#9-certificados-e-atividades-complementares)
10. [Perfil Público](#10-perfil-público)
11. [Configurações da Conta](#11-configurações-da-conta)
12. [Perguntas Frequentes (FAQ)](#12-perguntas-frequentes-faq)
13. [Glossário](#13-glossário)
14. [Suporte e Contato](#14-suporte-e-contato)
- [Referências Normativas](#referências-normativas)

---

## 1. Apresentação do Sistema

O **Histórico Acadêmico UFBA** é um sistema gratuito e independente criado especialmente para estudantes do ICTI (Instituto de Ciência, Tecnologia e Inovação) da Universidade Federal da Bahia, Campus de Camaçari. Ele permite que você acompanhe de forma clara e visual toda a sua vida acadêmica: disciplinas cursadas, notas, Coeficiente de Rendimento (CR), progresso em direção à formatura e muito mais, tudo em um só lugar.

O sistema nasceu de uma necessidade real: o SIGAA, portal oficial da UFBA, não oferece ferramentas visuais de acompanhamento do histórico, não calcula o CR de forma transparente, não mostra o progresso por categoria de disciplina e não permite simular cenários futuros. Com o Histórico Acadêmico UFBA, você importa seu histórico diretamente do SIGAA em PDF e passa a ter acesso a gráficos de evolução, previsão de formatura, recomendações de próximas disciplinas e muito mais.

O sistema atende estudantes de três cursos do ICTI-UFBA: **Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação (BICTI)**, **Engenharia de Produção** e **Engenharia Elétrica**. É importante destacar que esta é uma ferramenta complementar e **não oficial** da UFBA. Ela não tem acesso direto ao SIGAA nem substitui qualquer documento oficial. É open source, de uso completamente gratuito, e não guarda senha ou credenciais do SIGAA.

---

## 2. Requisitos para Uso

### Dispositivos suportados

O sistema funciona em qualquer dispositivo com acesso à internet e um navegador moderno:

- Computadores (Windows, macOS, Linux)
- Celulares e smartphones (Android e iOS)
- Tablets

### Navegadores recomendados

| Navegador | Versão mínima |
|-----------|--------------|
| Google Chrome | 90 ou superior |
| Mozilla Firefox | 88 ou superior |
| Microsoft Edge | 90 ou superior |
| Safari (iOS/macOS) | 14 ou superior |

> **Dica:** Para a melhor experiência, mantenha seu navegador sempre atualizado.

### Conexão com internet

A internet é necessária para:

- Criar conta e fazer login
- Salvar e sincronizar dados entre dispositivos
- Importar o PDF do histórico

Após o carregamento inicial, algumas funcionalidades de visualização podem continuar funcionando mesmo com conexão instável.

### O que você precisa ter

- Um **endereço de e-mail** válido (ou uma conta Google) para criar sua conta
- O **PDF do seu histórico acadêmico** exportado do SIGAA (veja como obtê-lo na seção 4.1)

#### Como obter o PDF do histórico no SIGAA

O passo a passo completo para exportar o histórico do SIGAA está na **Seção 4.1**
deste manual. Antes de importar, certifique-se de ter o arquivo PDF salvo em seu
computador ou celular.

---

## 3. Primeiros Passos

### 3.1 Acessando o Sistema

Abra seu navegador e acesse o endereço:

```
https://historicoacademico.vercel.app
```

Você verá a tela inicial do sistema, com uma apresentação do que a plataforma oferece, os principais recursos e os botões para **Entrar** (login) ou **Criar conta**.

[IMAGEM: tela inicial do sistema com destaque nos botões "Entrar" e "Criar conta"]

### 3.2 Criando sua Conta

Você pode criar sua conta de duas formas:

#### Opção A — Cadastro com e-mail e senha

1. Na tela inicial, clique em **Criar conta**
2. Preencha os campos:
   - **Nome completo:** seu nome como deseja que apareça no sistema
   - **E-mail:** um endereço de e-mail válido que você usa regularmente
   - **Senha:** escolha uma senha segura
   - **Confirmar senha:** repita a mesma senha para confirmar
3. Clique no ícone de olho nos campos de senha para mostrar ou ocultar os caracteres digitados
4. Clique em **Criar conta**
5. Você será redirecionado automaticamente para o painel principal

#### Opção B — Cadastro com conta Google

1. Na tela de cadastro, clique em **Continuar com Google**
2. Selecione sua conta Google na janela que aparecer
3. Autorize o acesso quando solicitado
4. Você será redirecionado automaticamente para o painel principal

[IMAGEM: tela de cadastro com campos de nome, e-mail, senha e botão do Google]

### 3.3 Fazendo Login

Se você já possui conta, acesse a tela de login:

#### Login com e-mail e senha

1. Clique em **Entrar** na tela inicial
2. Digite seu **e-mail** e **senha**
3. Clique em **Entrar**

#### Login com Google

1. Clique em **Entrar** na tela inicial
2. Clique em **Continuar com Google**
3. Selecione sua conta e confirme

#### Esqueci minha senha

Caso tenha esquecido a senha:

1. Na tela de login, clique em **Esqueceu sua senha?**
2. Digite o e-mail cadastrado no sistema
3. Clique em **Enviar link de recuperação**
4. Verifique sua caixa de entrada (e a pasta de spam) — você receberá um e-mail com um link
5. Clique no link do e-mail e defina uma nova senha

[IMAGEM: tela de login com campos de e-mail, senha e link "Esqueceu sua senha?"]

### 3.4 Configurando seu Perfil

Após criar sua conta, é fundamental configurar seu perfil para que os cálculos de CR e progresso sejam feitos de forma correta.

1. Clique no ícone do seu perfil ou acesse o menu **Configurações** / **Perfil**
2. Preencha as seguintes informações:

**Curso:**
Selecione o seu curso entre as opções:
- BICTI — Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação
- Engenharia de Produção
- Engenharia Elétrica

**Ano e semestre de ingresso:**
Informe em qual semestre você ingressou na UFBA. Por exemplo: **2023** e **semestre 1** para quem entrou no primeiro semestre de 2023. Essa informação é usada para calcular em qual semestre do curso você se encontra.

**Número de matrícula:**
Informe sua matrícula conforme aparece nos documentos da UFBA. Essa informação aparece no seu perfil público, se você optar por torná-lo visível.

> **Por que essas informações são importantes?** O sistema usa o curso escolhido para carregar a grade curricular correta, calcular os requisitos de horas por categoria e gerar recomendações de próximas disciplinas. O semestre de ingresso determina o "semestre atual" do seu curso, que aparece no painel de resumo.

---

## 4. Importando seu Histórico Acadêmico

### 4.1 Como Obter o PDF do SIGAA

Antes de importar, você precisa ter o PDF do seu histórico acadêmico exportado do SIGAA. Veja o passo a passo:

1. Acesse o SIGAA da UFBA em seu navegador
2. Faça login com CPF e senha
3. No menu superior, clique em **Ensino**
4. Selecione **Consultar Meu Histórico**
5. Aguarde o carregamento da página com todas as suas disciplinas
6. Clique em **Imprimir** ou **Exportar PDF** (o botão pode variar conforme a versão do SIGAA)
7. Na janela de impressão do navegador, em vez de imprimir, selecione **Salvar como PDF**
8. Escolha um local fácil de encontrar no seu dispositivo (área de trabalho, por exemplo)
9. Salve o arquivo

> **Importante:** O arquivo gerado deve ser um PDF real, não uma imagem. O sistema lê o texto dentro do PDF para extrair as disciplinas automaticamente.

### 4.2 Importando o PDF no Sistema

Com o arquivo PDF em mãos:

1. No painel principal, localize a barra de ações no topo da tela
2. Clique no botão **Importar PDF**
3. Uma janela de seleção de arquivo será aberta — navegue até onde você salvou o PDF do SIGAA e selecione-o
4. O sistema iniciará o processamento automaticamente. Uma mensagem de carregamento será exibida enquanto as disciplinas são lidas
5. Ao finalizar, suas disciplinas serão listadas automaticamente no histórico, organizadas por semestre

#### O que fazer se o PDF não for reconhecido

Se o arquivo não for importado corretamente, verifique:

- O arquivo é realmente um PDF de texto (não uma imagem ou foto do histórico)
- O PDF foi gerado diretamente pelo SIGAA, sem edições externas
- O navegador utilizado na exportação gerou um PDF válido

Caso o problema persista, você pode cadastrar as disciplinas manualmente (veja a seção 4.3).

[IMAGEM: botão "Importar PDF" na barra de ações e tela após importação bem-sucedida com lista de disciplinas]

### 4.3 Adicionando Disciplinas Manualmente

Você pode adicionar ou corrigir disciplinas individualmente a qualquer momento. Use essa opção quando:

- O PDF não foi reconhecido completamente
- Uma disciplina foi importada com dados incorretos
- Você precisa registrar uma disciplina que não estava no histórico do SIGAA
- Quer adicionar uma disciplina que está cursando no semestre atual

#### Como adicionar uma disciplina

1. No painel principal, clique no botão **Adicionar Disciplina** (geralmente um botão com ícone de "+" ou "Adicionar")
2. Um formulário deslizará pela lateral direita da tela com os seguintes campos:

**Período:** Semestre em que a disciplina foi ou está sendo cursada. Use o formato `AAAA.S` — por exemplo, `2024.1` para o primeiro semestre de 2024, ou `2025.2` para o segundo semestre de 2025.

**Código:** Código oficial da disciplina, conforme aparece no SIGAA. Exemplos: `CTIA01`, `CTIA03`, `CTIA31`.

**Nome:** Nome completo da disciplina. Ao digitar o código, o sistema pode preencher automaticamente o nome se a disciplina estiver no catálogo.

**Natureza:** Categoria da disciplina (veja tabela abaixo).

**Carga Horária (CH):** Número de horas da disciplina. Exemplos: `60`, `30`, `90`.

**Nota:** Nota final obtida (de 0 a 10). Para disciplinas de Atividade Complementar (AC), esse campo não é obrigatório.

**Status:** Marque se a disciplina foi **trancada**, se foi **aproveitada/dispensada** (transferência) ou se está **em curso** no semestre atual.

3. Clique em **Salvar** para registrar a disciplina

#### Tabela de naturezas de disciplina

| Código | Nome Completo | Quando se Aplica |
|--------|--------------|-----------------|
| OB | Obrigatória | Disciplinas exigidas pelo currículo do seu curso, como Cálculo I, Introdução à Computação, etc. |
| OG | Optativa da Grande Área | Disciplinas optativas da área de Ciência e Tecnologia |
| OH | Optativa Humanística | Disciplinas optativas de ciências humanas, linguagens e sociais |
| OX | Optativa de Extensão | Disciplinas de extensão universitária (com prefixo ACCS) |
| OZ | Optativa Artística | Disciplinas da área de artes |
| OP | Optativa Geral | Outras disciplinas optativas que não se encaixam nas categorias anteriores |
| AC | Atividade Complementar | Cursos extracurriculares, eventos, monitoria, iniciação científica, etc. |
| LV | Componente Livre | Horas livres que excedem o limite das outras categorias optativas |

---

## 5. Painel Principal — Seu Histórico

### 5.1 Visão Geral do Painel

O painel principal é a tela central do sistema. Ele está organizado em várias áreas:

**Barra de ações (topo):** Contém o seletor de curso, o botão de importação de PDF, acesso ao calendário acadêmico e informações gerais do sistema.

**Cards de resumo:** Logo abaixo da barra de ações, você vê um conjunto de cartões com os principais números do seu histórico:
- **Disciplinas:** Total de disciplinas registradas
- **Semestre:** Em qual semestre do curso você está
- **Média:** Sua média geral de notas
- **CR:** Seu Coeficiente de Rendimento atual
- **Horas:** Total de horas cursadas e aprovadas
- **Créditos:** Total de créditos acumulados
- **PCH:** Soma de (nota × horas) de todas as disciplinas aprovadas — é o numerador
  usado para calcular seu CR. Quanto maior, melhor seu desempenho ponderado.
- **Aprovações:** Quantas disciplinas foram aprovadas
- **Reprovações:** Quantas disciplinas foram reprovadas

**Progresso para Formatura:** Uma barra de progresso mostra quanto do total exigido pelo seu curso você já completou, com uma estimativa de conclusão em semestres.

**Gráficos:** Três gráficos visuais:
- Pizza com a distribuição de horas por natureza (OB, OG, OX, etc.)
- Barras comparando disciplinas concluídas e total por semestre
- Linha mostrando a evolução do CR semestre a semestre

**Detalhamento de Requisitos:** Uma tabela com o avanço em cada categoria de disciplina, mostrando a meta exigida, quantas horas você já cursou e quantas ainda faltam.

**Histórico de Disciplinas:** Lista completa das disciplinas registradas, organizada por semestre com opções de busca e filtro.

**Recomendações:** Sugestões de próximas disciplinas a cursar, baseadas no seu progresso atual.

[IMAGEM: painel principal completo com cards de resumo, gráficos e lista de disciplinas]

### 5.2 Entendendo o Coeficiente de Rendimento (CR)

O Coeficiente de Rendimento (CR) é uma nota média que reflete seu desempenho acadêmico levando em conta o "peso" de cada disciplina — que é a sua carga horária. Disciplinas com mais horas têm mais influência no CR do que disciplinas menores.

**Como funciona na prática:** imagine que você cursou duas disciplinas:
- **Introdução à Computação** (60 horas) com nota **9,0**
- **Bases Matemáticas para C, T e I** (60 horas) com nota **7,5**

O CR seria calculado somando (9,0 × 60) + (7,5 × 60) = 540 + 450 = 990, dividido pelo total de horas (120). Resultado: **CR = 8,25**.

Se você adicionasse uma terceira disciplina com mais horas — por exemplo, **Língua Portuguesa, Poder e Diversidade Cultural** (60h) com nota **8,0** — o cálculo se tornaria: (540 + 450 + 480) / 180 = **CR = 8,17**.

> **Importante:** Disciplinas de Atividade Complementar (AC), disciplinas trancadas e disciplinas aproveitadas por transferência **não entram** no cálculo do CR.

**O gráfico de evolução do CR** mostra como sua média ponderada variou a cada semestre. Uma linha subindo indica melhora no desempenho; uma linha descendo pode indicar um período mais difícil.

**Diferença entre CR acumulado e CR semestral:** o CR exibido no card principal é o **acumulado** — considera todas as disciplinas desde o início do curso. O gráfico de linha também mostra o CR calculado **a cada semestre individualmente**, o que ajuda a identificar tendências.

> **Dica:** O CR mínimo para diferentes fins (bolsas, intercâmbios, pós-graduação)
> varia conforme a exigência de cada programa. Consulte o edital ou regulamento
> específico para saber qual CR é necessário para o seu objetivo.

### 5.3 Acompanhando seu Progresso por Categoria

Abaixo dos cards de resumo, uma tabela de requisitos mostra o progresso em cada natureza de disciplina:

| Coluna | O que significa |
|--------|----------------|
| **Natureza** | Tipo da disciplina (OB, OG, OH, etc.) |
| **Meta** | Total de horas exigidas pelo currículo do seu curso nessa categoria |
| **Cursado** | Horas que você já completou com aprovação nessa categoria |
| **Falta** | Horas que ainda precisam ser cursadas |
| **Progresso** | Percentual de conclusão (cursado ÷ meta × 100) |

Por exemplo, se o seu curso exige 240 horas de optativas OG e você já completou 120h, a coluna **Progresso** mostrará 50%.

> **Atenção:** Horas extras em uma categoria podem ser redistribuídas automaticamente para a categoria **LV (Livre)**, que também tem uma meta. Isso acontece quando você cursa mais horas do que o exigido em uma determinada natureza.

Quando você estiver próximo de completar todos os requisitos, o sistema mostrará a mensagem **"Pode formar este semestre!"** no card de Progresso para Formatura.

### 5.4 Gerenciando Disciplinas

#### Editando uma disciplina

1. Na lista de disciplinas (seção **Histórico**), localize a disciplina que deseja corrigir
2. Clique no botão de edição (ícone de lápis) ao lado da disciplina
3. O formulário lateral será aberto com os dados já preenchidos
4. Faça as alterações necessárias e clique em **Salvar**

#### Excluindo uma disciplina

1. Localize a disciplina na lista
2. Clique no botão de exclusão (ícone de lixeira)
3. Confirme a exclusão na janela de confirmação que aparecer

#### Marcando uma disciplina como "em curso"

Ao adicionar ou editar uma disciplina, marque a caixa **Em curso** para indicar que você está cursando essa disciplina no semestre atual. Disciplinas em curso aparecem destacadas em azul e **não entram** no cálculo do CR até serem concluídas.

#### Buscando e filtrando disciplinas

No topo da lista de histórico, há uma barra de busca onde você pode digitar o nome ou código de qualquer disciplina para encontrá-la rapidamente. Você também pode filtrar por período (semestre) usando o seletor de filtro.

### 5.5 Exportando seu Histórico

O sistema oferece três formatos de exportação, acessíveis pelos botões na barra de ações ou no painel de resumo:

**PDF**
Use quando quiser imprimir seu histórico ou compartilhá-lo visualmente. O PDF gerado é formatado para impressão e inclui todos os dados do painel. Clique em **Imprimir** ou **Exportar PDF** e seu navegador abrirá a janela de impressão.

**Excel (XLSX)**
Use quando quiser analisar seus dados em uma planilha. O arquivo Excel gerado contém todas as disciplinas com suas notas, cargas horárias e períodos, organizadas em colunas. Clique em **Exportar XLSX** para baixar o arquivo.

**JSON**
Use para fazer um backup completo dos seus dados ou para importar em outro sistema. O arquivo JSON contém todos os registros do seu histórico. Clique em **Exportar JSON** para baixar o arquivo.

### 5.6 Recomendações de Próximas Disciplinas

O painel de **Recomendações**, exibido no painel principal, sugere quais disciplinas
você deveria cursar a seguir com base no seu progresso atual.

As sugestões levam em conta:
- Quais categorias (OB, OG, OH, etc.) ainda têm déficit de horas em relação à meta do curso
- A sequência lógica do currículo: se você já concluiu **Cálculo I**, o sistema
  recomendará **Cálculo II**; se concluiu **Física A**, recomendará **Física B**

> **Dica:** O painel de Recomendações desaparece automaticamente quando as
> disciplinas que você está cursando no semestre atual já cobrem todos os déficits
> restantes — isso é um bom sinal de que seu semestre está bem planejado!

---

## 6. Grade Curricular

### 6.1 O que é a Grade Curricular

A Grade Curricular é uma visualização completa de todas as disciplinas do seu curso, organizadas da forma como elas aparecem na matriz curricular oficial — semestre por semestre para as obrigatórias, e por categoria para as optativas. Você pode ver de relance o que já concluiu, o que está cursando agora e o que ainda falta fazer.

### 6.2 Como Usar

#### Selecionando o curso

No topo da página da Grade Curricular, há um seletor de curso. Escolha entre **BICTI**, **Engenharia de Produção** ou **Engenharia Elétrica** para ver a matriz curricular correspondente.

#### Navegando pelas abas

A grade é dividida em abas para facilitar a navegação:

- **Obrigatórias:** Mostra as disciplinas obrigatórias do curso, agrupadas por semestre (1º, 2º, 3º, etc.)
- **Optativas:** Mostra as disciplinas optativas disponíveis, agrupadas por natureza (OG, OH, OX, OZ, OP)
- **Complementares:** Atividades Complementares (AC)
- **Livres:** Componentes Livres (LV)

#### Interpretando os status visuais

Cada disciplina na grade exibe um ícone colorido indicando sua situação:

| Ícone | Significado |
|-------|-------------|
| ✅ (marca verde) | Aprovado — você concluiu esta disciplina com sucesso |
| ⏰ (relógio) | Em curso — você está cursando esta disciplina agora |
| ❌ (X vermelho) | Reprovado — você cursou mas não foi aprovado |
| ➖ (traço) | Trancado — você trancou esta disciplina em algum semestre |
| ⭕ (círculo vazio) | Pendente — disciplina que você ainda não cursou |

Além do ícone, cada disciplina mostra o **período** em que foi cursada (ex: `2024.1`) e a **nota** obtida, quando disponíveis.

#### Entendendo os cards de semestre e natureza

Cada bloco (semestre ou natureza) exibe um card com:
- Título do semestre ou nome da natureza
- Contagem de disciplinas concluídas vs. total
- Barra de progresso de horas concluídas

Por exemplo: no bloco do **1º Semestre** do BICTI, você pode ver "3/5 disciplinas" e uma barra mostrando que 180h das 240h foram concluídas.

[IMAGEM: grade curricular com disciplinas em diferentes status — aprovado (verde), em curso (azul) e pendente (cinza)]

---

## 7. Grade de Horários

### 7.1 O que é

A Grade de Horários é uma visualização semanal das suas disciplinas em curso. Ela mostra, em formato de tabela com os dias da semana e os horários, exatamente quando cada uma das suas disciplinas acontece. É útil para visualizar sua rotina semanal e identificar conflitos de horário.

### 7.2 Como Configurar seus Horários

#### O código de horário da UFBA

A UFBA usa um sistema de códigos para representar os horários das disciplinas. Esse código aparece no SIGAA e nos planos de curso. Entender como funciona é simples:

O código é formado por três partes: **dias + turno + slots de hora**

- **Dias da semana** (números):
  - `2` = Segunda-feira
  - `3` = Terça-feira
  - `4` = Quarta-feira
  - `5` = Quinta-feira
  - `6` = Sexta-feira
  - `7` = Sábado

- **Turno** (letras):
  - `M` = Manhã
  - `T` = Tarde
  - `N` = Noite

- **Slots de hora** (números após o turno):
  - Cada número representa um horário específico

#### Tabela de referência de horários

**Manhã (M):**
| Código | Horário |
|--------|---------|
| M1 | 07:00 |
| M2 | 08:00 |
| M3 | 09:00 |
| M4 | 10:00 |
| M5 | 11:00 |

**Tarde (T):**
| Código | Horário |
|--------|---------|
| T1 | 13:00 |
| T2 | 14:00 |
| T3 | 15:00 |
| T4 | 16:00 |
| T5 | 17:00 |
| T6 | 18:00 |

**Noite (N):**
| Código | Horário |
|--------|---------|
| N1 | 18:00 |
| N2 | 19:00 |
| N3 | 20:00 |
| N4 | 21:00 |

#### Exemplo prático

O código `46T56` significa:
- Dias: `4` (Quarta) e `6` (Sexta)
- Turno: `T` (Tarde)
- Slots: `5` e `6` (17:00 e 18:00)

Ou seja: a disciplina acontece na **Quarta e na Sexta, das 17:00 às 18:00**.

Outro exemplo: `35M34` = Terça e Quinta (3 e 5), Manhã (M), slots 3 e 4 = das **09:00 às 10:00**.

#### Inserindo os horários no sistema

1. Acesse a página **Grade de Horários** pelo menu lateral
2. Você verá a lista das disciplinas que estão marcadas como **Em curso** no seu histórico
3. Para cada disciplina, clique no campo de código de horário e digite o código correspondente (ex: `46T56`)
4. O sistema detectará o código e atualizará a grade visual automaticamente.
   Aguarde a confirmação de salvamento antes de fechar a página.
5. As disciplinas serão exibidas em cores diferentes para facilitar a identificação

[IMAGEM: grade de horários preenchida com disciplinas coloridas distribuídas pelos dias e horários da semana]

### 7.3 Compartilhando sua Grade de Horários

Você pode compartilhar sua grade de horários com colegas sem que eles precisem ter conta no sistema.

1. Na página de Grade de Horários, localize o botão **Compartilhar** ou **Tornar Público**
2. Ative a opção de grade pública clicando no botão correspondente
3. Um link único será gerado no formato `https://historicoacademico.vercel.app/u/[seu-id]/horarios`
4. Clique em **Copiar link** e envie para seus colegas
5. Quem acessar o link verá sua grade de horários em modo somente leitura, sem poder editar nada

> **Privacidade:** A grade de horários tem uma configuração de privacidade separada do perfil público. Você pode tornar a grade pública sem necessariamente tornar todo o seu perfil público.

---

## 8. Simulador "E Se?"

### 8.1 Para que Serve

O Simulador "E Se?" responde à pergunta que todo estudante tem ao longo do semestre: *"Qual nota eu preciso tirar para atingir o CR que quero?"*

Com ele, você define um CR alvo e o sistema calcula, disciplina por disciplina (considerando as que estão em curso), qual nota mínima você precisaria obter em cada uma para atingir esse objetivo. É uma ferramenta de planejamento, não uma previsão garantida.

### 8.2 Como Usar

1. Acesse o **Simulador "E Se?"** pelo menu ou pelo painel principal
2. No campo **CR alvo**, informe o Coeficiente de Rendimento que deseja alcançar ao final do semestre (por exemplo, `7.5` ou `8.0`)
3. O sistema listará cada disciplina que você está cursando no semestre atual (aquelas marcadas como **Em curso**)
4. Para cada disciplina, o simulador mostrará a **nota mínima necessária** para atingir o CR desejado

#### Como interpretar os resultados

- Se a nota mínima for menor que 5,0, significa que mesmo sendo reprovado nessa disciplina, você pode atingir o CR desejado pelas outras
- Se a nota mínima for maior que 10,0, o CR desejado está fora do alcance considerando apenas o semestre atual — considere ajustar a meta para um valor mais realista
- Use esses números para priorizar seus estudos: disciplinas com maior carga horária têm mais impacto no CR

#### Limitação importante

As notas inseridas no simulador são apenas para fins de cálculo e **não são salvas** no seu histórico. Ao fechar ou sair do simulador, os valores simulados são descartados. Para registrar uma nota real, use o formulário de edição da disciplina no painel principal.

---

## 9. Certificados e Atividades Complementares

### 9.1 O que são Atividades Complementares

Atividades Complementares (AC) são horas obrigatórias que você precisa cumprir além das disciplinas regulares do currículo. Elas reconhecem atividades realizadas fora da sala de aula que contribuem para a sua formação: cursos livres, workshops, participação em eventos, monitoria, iniciação científica, projetos de extensão, estágios, entre outros.

Cada curso tem uma carga horária mínima de AC exigida para a formatura. O sistema permite que você registre esses certificados e acompanhe o total de horas acumuladas.

### 9.2 Cadastrando um Certificado

#### Passo a passo

1. No menu lateral, clique em **Certificados** ou **Atividades Complementares**
2. Clique no botão **Adicionar Certificado** ou no ícone de **"+"**
3. Um formulário será exibido com os seguintes campos:

**Título:** Nome da atividade ou do certificado. Exemplo: "Workshop de Python para Ciência de Dados" ou "Monitoria em Cálculo I".

**Instituição:** Nome da instituição que ofereceu ou organizou a atividade. Exemplo: "UFBA", "Coursera", "Empresa XYZ".

**Tipo de atividade:** Selecione a categoria que melhor descreve a atividade:

| Tipo | Exemplos |
|------|---------|
| Curso | Cursos presenciais ou online com certificado |
| Workshop | Oficinas práticas de curta duração |
| Palestra | Participação em palestras ou seminários |
| Evento | Congressos, simpósios, semanas acadêmicas |
| Congresso | Apresentação ou participação em congresso científico |
| Projeto | Participação em projetos de pesquisa ou extensão |
| Pesquisa | Iniciação científica, PIBIC, artigos publicados |
| Monitoria | Monitoria voluntária ou remunerada em disciplinas |
| Estágio | Estágio curricular ou extracurricular |

**Carga Horária:** Número de horas reconhecidas pela atividade, conforme consta no certificado. Exemplo: `20` para um curso de 20 horas.

**Data:** Data de conclusão ou de realização da atividade (no formato dd/mm/aaaa).

**Período letivo:** Semestre em que a atividade foi realizada (formato `AAAA.S`). Exemplo: `2025.1`.

**Status:** Situação do certificado:
- **Pendente:** Você ainda vai submeter para validação na coordenação
- **Aprovado:** A coordenação do curso já reconheceu essa atividade
- **Reprovado:** A atividade não foi aceita para validação

**Arquivo ou Link:** Você pode anexar o PDF do certificado ou informar um link para acessá-lo posteriormente.

4. Clique em **Salvar** para registrar o certificado

[IMAGEM: formulário de cadastro de certificado com campos preenchidos e botão "Salvar"]

### 9.3 Acompanhando suas Horas de AC

No topo da página de Certificados, você verá cartões de resumo mostrando:
- **Total de horas aprovadas:** Soma das horas dos certificados com status "Aprovado"
- **Total de certificados:** Quantidade de registros cadastrados
- **Distribuição por tipo:** Quantas horas de cada categoria

**Sobre os status:** O sistema não se conecta automaticamente à coordenação do seu curso. Os status (Pendente, Aprovado, Reprovado) são definidos **por você mesmo** com base no retorno que receber da coordenação. Lembre-se de atualizar o status após submeter seus certificados para validação.

### 9.4 Filtrando e Gerenciando Certificados

**Filtros disponíveis:**
- **Por tipo:** Exibe apenas certificados de um determinado tipo (cursos, monitorias, etc.)
- **Por status:** Exibe apenas Pendentes, Aprovados ou Reprovados
- **Por período:** Filtra pelos certificados de um semestre específico

**Editando um certificado:**
1. Localize o certificado na lista
2. Clique no ícone de edição (lápis)
3. Altere as informações desejadas e salve

**Excluindo um certificado:**
1. Localize o certificado na lista
2. Clique no ícone de exclusão (lixeira)
3. Confirme a exclusão na janela que aparecer

**Visualizando detalhes:**
Clique sobre qualquer certificado na lista para abrir uma janela com todos os detalhes registrados, incluindo o link ou arquivo anexado.

---

## 10. Perfil Público

### 10.1 O que é

O Perfil Público é uma página única, com um link exclusivo seu, que você pode compartilhar com qualquer pessoa — professores, recrutadores, colegas — para que elas possam ver um resumo do seu histórico acadêmico de forma somente leitura, **sem precisar de conta no sistema** e sem ter acesso às suas configurações.

É útil, por exemplo, para enviar para uma empresa durante um processo seletivo ou para mostrar seu desempenho para um professor orientador.

### 10.2 Como Ativar e Compartilhar

#### Ativando o perfil público

1. Acesse a página **Perfil** ou **Configurações** no menu do sistema
2. Localize a seção de **Privacidade**
3. Altere a configuração para **Público** (ou ative o interruptor correspondente)
4. Salve as alterações

#### Copiando o link do perfil

Após ativar o perfil público, um link único será gerado no formato:
```
https://historicoacademico.vercel.app/u/[seu-id]
```
Clique em **Copiar link** para copiar o endereço e compartilhá-lo como preferir.

#### O que aparece no perfil público

Quando alguém acessar seu link, verá:

- Sua foto de perfil e nome de exibição
- Seu curso e instituição (ICTI-UFBA)
- Seu ano de ingresso e número de matrícula (se você preencheu)
- Indicador de verificação como estudante ativo
- Cards com estatísticas: total de disciplinas, aprovadas, em curso e média geral
- Tabela de requisitos por natureza (progresso em cada categoria)
- Tabela com todas as disciplinas **aprovadas** (período, código, nome, CH e nota)
- Certificados de Atividades Complementares com status "Aprovado"

#### O que NÃO aparece no perfil público

- Seu endereço de e-mail
- Disciplinas reprovadas, trancadas ou em curso (apenas aprovadas)
- Certificados com status "Pendente" ou "Reprovado"
- Dados de configuração da conta

> **Privacidade:** Enquanto seu perfil estiver configurado como **Privado** (padrão), o link não funcionará para outras pessoas — elas verão uma mensagem informando que o perfil é privado.

---

## 11. Configurações da Conta

Acesse as configurações da sua conta clicando no seu nome ou foto de perfil no canto superior da tela, depois em **Perfil** ou **Configurações**.

### Alterando o nome de exibição e foto de perfil

1. Acesse **Configurações > Perfil**
2. Clique no campo **Nome** e edite como preferir
3. Para a foto, clique na imagem atual (ou no espaço indicado) e faça upload de uma nova foto
4. Clique em **Salvar** para confirmar as alterações

### Alterando a senha

1. Acesse **Configurações > Segurança** (ou similar)
2. Informe sua **senha atual**
3. Digite a **nova senha** e confirme
4. Clique em **Salvar**

> **Usuários Google:** Se você entrou com sua conta Google, a senha é gerenciada pelo Google. Para alterá-la, acesse as configurações da sua conta Google.

### Configurações de privacidade

Você pode controlar separadamente:

- **Privacidade do perfil:** Público (qualquer pessoa com o link pode ver) ou Privado (somente você)
- **Privacidade da grade de horários:** Público ou Privado, independente do perfil

Acesse **Configurações > Privacidade** para ajustar essas opções.

### Excluindo a conta

1. Acesse **Configurações > Conta**
2. Role até o final da página e localize a opção **Excluir conta**
3. Leia o aviso sobre o que acontecerá com seus dados
4. Confirme digitando sua senha ou confirmando via Google
5. Clique em **Excluir permanentemente**

> **Atenção:** A exclusão da conta é **irreversível**. Todos os seus dados (disciplinas, certificados, configurações) serão excluídos permanentemente. Recomendamos exportar seus dados em JSON antes de excluir a conta.

---

## 12. Perguntas Frequentes (FAQ)

**1. Meu PDF do SIGAA não foi reconhecido. O que faço?**

Verifique se o PDF foi gerado diretamente pelo SIGAA usando a opção "Salvar como PDF" do navegador — não tire foto da tela nem use um scanner. Se o problema persistir, cadastre as disciplinas manualmente usando o botão **Adicionar Disciplina**.

---

**2. Por que meu CR no sistema é diferente do que aparece no SIGAA?**

O cálculo do CR pode apresentar pequenas diferenças dependendo de quais disciplinas são incluídas. No Histórico Acadêmico UFBA, disciplinas de Atividade Complementar (AC), disciplinas trancadas e disciplinas aproveitadas por transferência não entram no cálculo. Verifique se há disciplinas cadastradas com a natureza ou status incorretos. Se ainda assim houver diferença, compare disciplina por disciplina para identificar qual está causando a divergência.

---

**3. Posso usar o sistema sem fazer login?**

Sim, é possível explorar o sistema sem conta. No entanto, sem login, seus dados ficam salvos apenas no navegador e dispositivo atual, e podem ser perdidos ao limpar o cache. Criar uma conta gratuita garante que seus dados sejam salvos na nuvem e acessíveis de qualquer dispositivo.

---

**4. Meus dados ficam salvos se eu fechar o navegador?**

Se você estiver **logado**, seus dados são salvos automaticamente na nuvem a cada alteração. Você pode fechar o navegador, trocar de dispositivo ou acessar de outro computador — seus dados estarão lá. Se não estiver logado, os dados ficam salvos apenas no armazenamento local do navegador e podem ser perdidos ao limpar o histórico/cache.

---

**5. O sistema tem acesso à minha conta do SIGAA?**

**Não.** O Histórico Acadêmico UFBA não se conecta ao SIGAA de forma alguma. Ele não pede sua senha do SIGAA, não acessa seus dados automaticamente e não tem nenhuma integração com a UFBA. A única forma de trazer dados do SIGAA para o sistema é exportando o PDF do seu histórico manualmente e importando-o aqui.

---

**6. Posso usar o sistema em outros cursos além de BICTI, Eng. Produção e Eng. Elétrica?**

O sistema foi desenvolvido especificamente para os três cursos do ICTI-UFBA. Estudantes de outros cursos podem cadastrar disciplinas manualmente, mas não terão a grade curricular correta nem os requisitos por natureza calculados de forma precisa, pois essas informações dependem da matriz curricular de cada curso.

---

**7. Como faço para atualizar meu histórico após um novo semestre?**

Ao final de cada semestre, exporte um novo PDF do seu histórico no SIGAA (que já incluirá as notas finais das disciplinas recém-concluídas) e importe-o novamente no sistema usando o botão **Importar PDF**. O sistema detectará as disciplinas novas e as adicionará ao seu registro. Você também pode editar manualmente as disciplinas que estavam marcadas como "Em curso" para atualizar as notas.

---

**8. O que fazer se eu trancei uma disciplina — como cadastrar?**

Ao adicionar ou editar uma disciplina, marque a opção **Trancado** no campo de status. A disciplina será registrada com o resultado **TR** e não entrará no cálculo do CR nem nas horas de progresso. Se você trancou o semestre inteiro (trancamento geral), registre cada disciplina com esse status.

---

**9. Como funciona a semestralização? O que é o "semestre atual"?**

A semestralização é o cálculo de em qual semestre do curso você se encontra. O sistema usa a data de ingresso que você informou no perfil (ano e semestre de entrada) e conta quantos semestres letivos se passaram desde então. Se você tirou licença ou trancou algum semestre, esse período não é contado — para isso, informe o número de afastamentos nas configurações do perfil. Estudantes com muitas disciplinas aproveitadas por transferência podem ter o semestre inicial ajustado automaticamente.

---

**10. Perdi meu acesso ao e-mail cadastrado. Como recupero minha conta?**

Infelizmente, sem acesso ao e-mail cadastrado não é possível recuperar a conta diretamente pelo sistema. Nesse caso, a alternativa é criar uma nova conta com outro e-mail e cadastrar novamente seu histórico (usando o PDF do SIGAA para importar rapidamente). Se você havia exportado seus dados em JSON anteriormente, entre em contato com o suporte pelo repositório do projeto para verificar possibilidades de migração.

---

**11. Como compartilho minha grade de horários com meus colegas?**

Na página **Grade de Horários**, clique no botão **Compartilhar** ou **Tornar Público**. Um link único será gerado — copie-o e envie para seus colegas. Eles poderão ver sua grade sem precisar de conta no sistema.

---

**12. O sistema é oficial da UFBA?**

**Não.** O Histórico Acadêmico UFBA é um projeto desenvolvido de forma independente por um estudante do ICTI. Ele **não é oficial**, não é mantido pela UFBA e não possui qualquer integração direta com os sistemas da universidade. É uma ferramenta complementar e de uso voluntário. Para informações oficiais sobre seu histórico, matrícula ou situação acadêmica, sempre consulte o SIGAA ou a secretaria da sua unidade.

---

**13. Posso exportar meus dados para fazer backup?**

Sim. No painel principal, use a opção **Exportar JSON** para baixar um arquivo com todos os seus dados (disciplinas, notas, configurações). Guarde esse arquivo em local seguro. Em caso de necessidade, você pode entrar em contato pelo repositório para verificar possibilidades de reimportação.

---

**14. As disciplinas em curso aparecem no meu perfil público?**

Não. O perfil público exibe apenas as disciplinas com resultado **Aprovado**. Disciplinas em curso, reprovadas ou trancadas não aparecem para quem acessar seu link público.

---

**15. O sistema funciona no celular?**

Sim. O sistema é responsivo e funciona em smartphones e tablets. A experiência pode ser ligeiramente diferente da versão para computador em telas muito pequenas, mas todas as funcionalidades principais estão disponíveis.

---

## 13. Glossário

**Coeficiente de Rendimento (CR)**
Média ponderada das notas de todas as disciplinas cursadas, onde o peso de cada disciplina é sua carga horária. Quanto maior o CR, melhor o desempenho acadêmico. Disciplinas de Atividade Complementar, trancadas e aproveitadas por transferência não são incluídas no cálculo.

---

**Semestralização**
Cálculo que determina em qual semestre do curso o estudante se encontra, levando em conta a data de ingresso, o número de semestres letivos decorridos e possíveis períodos de afastamento ou trancamento.

---

**Componente Curricular**
Qualquer disciplina, atividade ou módulo que faz parte da grade do curso e contribui para a carga horária necessária à formatura. Inclui disciplinas obrigatórias, optativas, atividades complementares e componentes livres.

---

**Natureza da Disciplina**
Classificação que indica a que categoria pertence cada disciplina no currículo do curso:
- **OB** — Obrigatória: disciplina exigida para todos os estudantes do curso
- **OG** — Optativa da Grande Área: optativa da área de Ciência e Tecnologia
- **OH** — Optativa Humanística: optativa de ciências humanas e linguagens
- **OX** — Optativa de Extensão: disciplina de extensão universitária
- **OZ** — Optativa Artística: optativa da área de artes
- **OP** — Optativa Geral: outras disciplinas optativas
- **AC** — Atividade Complementar: atividades extracurriculares certificadas
- **LV** — Componente Livre: horas de disciplinas que excedem os limites das outras categorias

---

**Carga Horária (CH)**
Número total de horas de uma disciplina ou atividade. Exemplo: uma disciplina com CH de 60 horas equivale a aulas semanais ao longo de todo o semestre. A carga horária é usada no cálculo do CR e no acompanhamento do progresso rumo à formatura.

---

**Histórico Acadêmico**
Documento oficial que registra todas as disciplinas cursadas pelo estudante durante sua graduação, com as respectivas notas, cargas horárias, períodos e resultados. Pode ser consultado e exportado pelo SIGAA.

---

**Atividade Complementar (AC)**
Atividades realizadas fora das disciplinas regulares que complementam a formação do estudante. Exemplos: cursos livres, workshops, participação em eventos científicos, monitoria, iniciação científica, projetos de extensão e estágios. Cada curso exige uma carga horária mínima de AC para a formatura.

---

**Resultado**
Situação final do estudante em uma disciplina ao término do período letivo:
- **AP** (Aprovado): nota igual ou superior a 5,0 — disciplina concluída com sucesso
- **RR** (Reprovado): nota inferior a 5,0 — disciplina não concluída com sucesso
- **TR** (Trancado): disciplina trancada pelo estudante durante o semestre
- **DP** (Dispensado): disciplina reconhecida por aproveitamento de estudos (transferência ou equivalência)

> **Sobre disciplinas Em Curso:** disciplinas que você está cursando no semestre atual
> são marcadas com o status **Em curso** (em azul) no painel principal. Elas não possuem
> resultado definido ainda e não entram no cálculo do CR até serem concluídas.

---

**Perfil Público**
Página do sistema com link exclusivo que o estudante pode compartilhar. Exibe um resumo do histórico acadêmico em modo somente leitura, sem expor dados sensíveis, para consulta por professores, recrutadores ou colegas.

---

**Período Letivo**
Intervalo de tempo correspondente a um semestre acadêmico, identificado pelo ano e número do semestre. Representado no sistema no formato `AAAA.S`, onde `AAAA` é o ano e `S` é 1 (primeiro semestre) ou 2 (segundo semestre). Exemplo: `2025.1` = primeiro semestre de 2025.

---

## 14. Suporte e Contato

O **Histórico Acadêmico UFBA** é um projeto de código aberto mantido de forma voluntária. Não há equipe de suporte dedicada, mas há canais para relatar problemas e sugerir melhorias.

### Reportando bugs ou problemas

Se você encontrar um erro no sistema — funcionalidade que não funciona, cálculo incorreto, página que não carrega — abra um reporte no repositório oficial do projeto:

1. Acesse: https://github.com/LuisT-ls/Historico-Universitario
2. Clique na aba **Issues**
3. Clique em **New Issue**
4. Descreva o problema com o máximo de detalhes possível:
   - O que você estava tentando fazer
   - O que aconteceu (mensagem de erro, comportamento inesperado)
   - Qual dispositivo e navegador você estava usando
   - Prints de tela, se possível

### Sugerindo melhorias

Tem uma ideia para uma nova funcionalidade ou melhoria? Compartilhe da mesma forma:

1. Acesse https://github.com/LuisT-ls/Historico-Universitario
2. Clique em **Issues** → **New Issue**
3. Descreva sua sugestão de forma clara

### Repositório oficial

```
https://github.com/LuisT-ls/Historico-Universitario
```

### Aviso importante

Este sistema **não possui suporte oficial da UFBA**. Questões relacionadas à sua situação acadêmica, matrícula, notas ou documentos oficiais devem ser tratadas diretamente com a secretaria do ICTI ou pelo portal SIGAA da universidade.

---

## Referências Normativas

- **Lei nº 9.609, de 19 de fevereiro de 1998** — Dispõe sobre a proteção da propriedade intelectual de programa de computador, sua comercialização no País, e dá outras providências.
- **Instrução Normativa INPI nº 11, de 2 de maio de 2013** — Estabelece as condições e procedimentos para o registro de programas de computador no Instituto Nacional da Propriedade Industrial (INPI).
