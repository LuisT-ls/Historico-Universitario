// js/modules/ui/export.js
import { compararPeriodos } from '../utils.js'

export function setupExportButton() {
  // Cria o container para o botão de exportação
  const exportContainer = document.createElement('div')
  exportContainer.className = 'export-container'

  // Cria o botão principal
  const exportButton = document.createElement('button')
  exportButton.className = 'export-button'
  exportButton.innerHTML = '<i class="fas fa-download"></i> Exportar Histórico'
  exportContainer.appendChild(exportButton)

  // Cria o menu dropdown
  const exportMenu = document.createElement('div')
  exportMenu.className = 'export-menu'

  // Adiciona opções de exportação
  const formats = [
    { id: 'pdf', icon: 'fa-file-pdf', text: 'PDF' },
    { id: 'txt', icon: 'fa-file-alt', text: 'TXT' },
    { id: 'docx', icon: 'fa-file-csv', text: 'CSV/Excel' }
  ]

  formats.forEach(format => {
    const option = document.createElement('button')
    option.className = 'export-option'
    option.dataset.format = format.id
    option.innerHTML = `<i class="fas ${format.icon}"></i> ${format.text}`
    option.addEventListener('click', () => handleExport(format.id))
    exportMenu.appendChild(option)
  })

  exportContainer.appendChild(exportMenu)

  // Adiciona o comportamento de clique para mostrar/esconder o menu
  exportButton.addEventListener('click', () => {
    exportMenu.classList.toggle('show')
  })

  // Fecha o menu quando clicar fora dele
  document.addEventListener('click', event => {
    if (!exportContainer.contains(event.target)) {
      exportMenu.classList.remove('show')
    }
  })

  // Adiciona o container ao DOM
  const tableContainer = document.querySelector('.table-container')
  if (tableContainer) {
    const header = tableContainer.querySelector('h2')
    if (header) {
      // Cria um container flex para o título e o botão
      const headerContainer = document.createElement('div')
      headerContainer.className = 'table-header-container'

      // Move o título original para o novo container
      header.parentNode.insertBefore(headerContainer, header)
      headerContainer.appendChild(header)

      // Adiciona o botão de exportação ao container
      headerContainer.appendChild(exportContainer)
    } else {
      tableContainer.insertBefore(exportContainer, tableContainer.firstChild)
    }
  }
}

function handleExport(format) {
  console.log(`Iniciando exportação no formato: ${format}`)
  const disciplinas = window.app.__appInstance.disciplinas

  if (!disciplinas || disciplinas.length === 0) {
    mostrarNotificacao('Não há disciplinas para exportar', 'error')
    return
  }

  switch (format) {
    case 'pdf':
      exportToPDF(disciplinas)
      break
    case 'txt':
      exportToTXT(disciplinas)
      break
    case 'docx':
      exportToDOCX(disciplinas)
      break
    default:
      console.error('Formato não suportado:', format)
      mostrarNotificacao('Formato não suportado', 'error')
  }
}

function exportToPDF(disciplinas) {
  try {
    // Importa a biblioteca jsPDF dinamicamente
    import(
      'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    )
      .then(() => {
        import(
          'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.7.0/jspdf.plugin.autotable.min.js'
        )
          .then(() => {
            // Cria uma nova instância do jsPDF
            const { jsPDF } = window.jspdf
            const doc = new jsPDF()

            // Adiciona título
            doc.setFontSize(16)
            doc.text('Histórico Universitário - Disciplinas Cursadas', 14, 15)

            // Adiciona detalhes do curso
            const cursoAtual = window.app.__appInstance.cursoAtual
            const cursoNomes = {
              BICTI:
                'Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação',
              ENG_PROD: 'Engenharia de Produção',
              ENG_ELET: 'Engenharia Elétrica'
            }
            doc.setFontSize(12)
            doc.text(`Curso: ${cursoNomes[cursoAtual] || cursoAtual}`, 14, 25)

            // Adiciona data de geração
            const dataAtual = new Date().toLocaleDateString('pt-BR')
            doc.text(`Data de geração: ${dataAtual}`, 14, 32)

            // Organiza as disciplinas por período
            const disciplinasPorPeriodo =
              agruparDisciplinasPorPeriodo(disciplinas)

            // Posição vertical atual
            let yPos = 40

            // Para cada período, cria uma tabela
            Object.keys(disciplinasPorPeriodo)
              .sort(compararPeriodos)
              .forEach((periodo, index) => {
                // Se não é o primeiro período e está próximo do fim da página, adiciona nova página
                if (index > 0 && yPos > 230) {
                  doc.addPage()
                  yPos = 20
                }

                // Adiciona cabeçalho do período
                doc.setFontSize(13)
                doc.text(`Período ${periodo}`, 14, yPos)
                yPos += 8

                // Prepara dados para a tabela
                const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo]
                const tableData = disciplinasDoPeriodo.map(d => [
                  d.codigo,
                  d.nome,
                  d.trancamento ? '-' : d.ch,
                  d.natureza,
                  d.trancamento ? '-' : d.nota ? d.nota.toFixed(1) : '-',
                  d.trancamento ? '-' : (d.ch * (d.nota || 0)).toFixed(1),
                  d.resultado
                ])

                // Cria a tabela
                doc.autoTable({
                  startY: yPos,
                  head: [
                    ['Código', 'Disciplina', 'CH', 'NT', 'Nota', 'PCH', 'RES']
                  ],
                  body: tableData,
                  headStyles: { fillColor: [66, 133, 244], textColor: 255 },
                  didDrawPage: data => {
                    // Atualiza a posição vertical para a próxima tabela
                    yPos = data.cursor.y + 15
                  },
                  styles: { fontSize: 9, cellPadding: 3 },
                  columnStyles: {
                    0: { cellWidth: 20 }, // Código
                    1: { cellWidth: 'auto' }, // Disciplina
                    2: { cellWidth: 15 }, // CH
                    3: { cellWidth: 15 }, // NT
                    4: { cellWidth: 15 }, // Nota
                    5: { cellWidth: 20 }, // PCH
                    6: { cellWidth: 15 } // RES
                  },
                  theme: 'grid'
                })
              })

            // Adiciona resumo ao final
            const mediaGeral = calcularMediaGeral(disciplinas)
            const totalHoras = calcularTotalHoras(disciplinas)

            doc.addPage()
            doc.setFontSize(14)
            doc.text('Resumo', 14, 20)
            doc.setFontSize(11)
            doc.text(`Média Geral: ${mediaGeral.toFixed(2)}`, 14, 32)
            doc.text(`Total de Horas: ${totalHoras}h`, 14, 40)

            // Adiciona rodapé
            const totalPages = doc.getNumberOfPages()
            for (let i = 1; i <= totalPages; i++) {
              doc.setPage(i)
              doc.setFontSize(9)
              doc.setTextColor(100)
              doc.text(
                `Histórico Universitário - Página ${i} de ${totalPages}`,
                14,
                doc.internal.pageSize.height - 10
              )
              doc.text(
                'Documento gerado em ' + dataAtual,
                doc.internal.pageSize.width - 90,
                doc.internal.pageSize.height - 10
              )
            }

            // Salva o PDF
            doc.save(
              `historico-universitario-${dataAtual.replace(/\//g, '-')}.pdf`
            )

            mostrarNotificacao('PDF gerado com sucesso')
          })
          .catch(error => {
            console.error('Erro ao carregar plugin autotable:', error)
            mostrarNotificacao('Erro ao gerar PDF', 'error')
          })
      })
      .catch(error => {
        console.error('Erro ao carregar jsPDF:', error)
        mostrarNotificacao('Erro ao carregar biblioteca de PDF', 'error')
      })
  } catch (error) {
    console.error('Erro ao exportar para PDF:', error)
    mostrarNotificacao('Erro ao gerar PDF', 'error')
  }
}

function exportToTXT(disciplinas) {
  try {
    let conteudo = 'HISTÓRICO UNIVERSITÁRIO - DISCIPLINAS CURSADAS\n'
    conteudo += '===========================================\n\n'

    // Adiciona informações do curso
    const cursoAtual = window.app.__appInstance.cursoAtual
    const cursoNomes = {
      BICTI: 'Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação',
      ENG_PROD: 'Engenharia de Produção',
      ENG_ELET: 'Engenharia Elétrica'
    }
    conteudo += `Curso: ${cursoNomes[cursoAtual] || cursoAtual}\n`
    conteudo += `Data de geração: ${new Date().toLocaleDateString('pt-BR')}\n\n`

    // Agrupa as disciplinas por período
    const disciplinasPorPeriodo = agruparDisciplinasPorPeriodo(disciplinas)

    // Para cada período, cria uma seção
    Object.keys(disciplinasPorPeriodo)
      .sort(compararPeriodos)
      .forEach(periodo => {
        conteudo += `PERÍODO ${periodo}\n`
        conteudo += '-'.repeat(50) + '\n'
        conteudo +=
          'CÓDIGO    DISCIPLINA' +
          ' '.repeat(30) +
          'CH   NT   NOTA   PCH    RES\n'

        // Adiciona as disciplinas do período
        const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo]
        disciplinasDoPeriodo.forEach(d => {
          const codigo = d.codigo.padEnd(10)
          const nome = d.nome.padEnd(40).substring(0, 40)
          const ch = (d.trancamento ? '-' : d.ch).toString().padEnd(5)
          const natureza = d.natureza.padEnd(5)
          const nota = (
            d.trancamento ? '-' : d.nota ? d.nota.toFixed(1) : '-'
          ).padEnd(7)
          const pch = (
            d.trancamento ? '-' : (d.ch * (d.nota || 0)).toFixed(1)
          ).padEnd(7)
          const resultado = d.resultado

          conteudo += `${codigo}${nome}${ch}${natureza}${nota}${pch}${resultado}\n`
        })

        conteudo += '\n'
      })

    // Adiciona resumo
    const mediaGeral = calcularMediaGeral(disciplinas)
    const totalHoras = calcularTotalHoras(disciplinas)

    conteudo += 'RESUMO\n'
    conteudo += '-'.repeat(20) + '\n'
    conteudo += `Média Geral: ${mediaGeral.toFixed(2)}\n`
    conteudo += `Total de Horas: ${totalHoras}h\n\n`

    // Cria o elemento para download
    const element = document.createElement('a')
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(conteudo)
    )
    element.setAttribute(
      'download',
      `historico-universitario-${new Date()
        .toLocaleDateString('pt-BR')
        .replace(/\//g, '-')}.txt`
    )

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()

    document.body.removeChild(element)
    mostrarNotificacao('Arquivo TXT gerado com sucesso')
  } catch (error) {
    console.error('Erro ao exportar para TXT:', error)
    mostrarNotificacao('Erro ao gerar arquivo TXT', 'error')
  }
}

function exportToDOCX(disciplinas) {
  try {
    let csvContent =
      'Período,Código,Disciplina,CH,Natureza,Nota,PCH,Resultado\n'

    // Organizar as disciplinas por período
    const disciplinasPorPeriodo = agruparDisciplinasPorPeriodo(disciplinas)

    // Para cada período, adicionar as disciplinas ao CSV
    Object.keys(disciplinasPorPeriodo)
      .sort(compararPeriodos)
      .forEach(periodo => {
        // Adicionar uma linha em branco antes do novo período (exceto para o primeiro)
        if (csvContent.split('\n').length > 2) {
          csvContent += '\n'
        }

        // Adicionar cabeçalho do período
        csvContent += `"PERÍODO ${periodo}",,,,,,\n`

        // Adicionar as disciplinas
        disciplinasPorPeriodo[periodo].forEach(d => {
          // Escapar as aspas nos textos
          const nome = d.nome.replace(/"/g, '""')

          csvContent +=
            [
              periodo,
              d.codigo,
              `"${nome}"`,
              d.trancamento ? '-' : d.ch,
              d.natureza,
              d.trancamento ? '-' : d.nota ? d.nota.toFixed(1) : '-',
              d.trancamento ? '-' : (d.ch * (d.nota || 0)).toFixed(1),
              d.resultado
            ].join(',') + '\n'
        })
      })

    // Adicionar resumo
    csvContent += '\n"RESUMO",,,,,,\n'
    const mediaGeral = calcularMediaGeral(disciplinas)
    const totalHoras = calcularTotalHoras(disciplinas)
    csvContent += `"Média Geral:",${mediaGeral.toFixed(2)},,,,,\n`
    csvContent += `"Total de Horas:",${totalHoras}h,,,,,\n`

    // Criar o blob com o conteúdo CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const fileName = `historico-universitario-${new Date()
      .toLocaleDateString('pt-BR')
      .replace(/\//g, '-')}.csv`

    // Criar link para download
    const url = window.URL.createObjectURL(blob)
    const element = document.createElement('a')
    element.href = url
    element.download = fileName
    document.body.appendChild(element)
    element.click()

    // Limpar
    window.URL.revokeObjectURL(url)
    document.body.removeChild(element)

    mostrarNotificacao(
      'Arquivo CSV gerado com sucesso. Pode ser aberto no Excel ou Word.'
    )
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error)
    mostrarNotificacao('Erro ao gerar arquivo CSV', 'error')
  }
}

function agruparDisciplinasPorPeriodo(disciplinas) {
  const disciplinasPorPeriodo = {}

  disciplinas.forEach(disc => {
    if (!disciplinasPorPeriodo[disc.periodo]) {
      disciplinasPorPeriodo[disc.periodo] = []
    }
    disciplinasPorPeriodo[disc.periodo].push(disc)
  })

  // Ordena as disciplinas dentro de cada período
  Object.keys(disciplinasPorPeriodo).forEach(periodo => {
    disciplinasPorPeriodo[periodo].sort((a, b) => {
      if (a.codigo < b.codigo) return -1
      if (a.codigo > b.codigo) return 1
      const statusOrder = { AP: 0, TR: 1, RR: 2 }
      return statusOrder[a.resultado] - statusOrder[b.resultado]
    })
  })

  return disciplinasPorPeriodo
}

function calcularMediaGeral(disciplinas) {
  const disciplinasValidas = disciplinas.filter(
    d =>
      (d.resultado === 'AP' || d.resultado === 'RR') &&
      !d.dispensada &&
      d.natureza !== 'AC'
  )

  if (disciplinasValidas.length === 0) return 0

  return (
    disciplinasValidas.reduce((sum, d) => sum + d.nota, 0) /
    disciplinasValidas.length
  )
}

function calcularTotalHoras(disciplinas) {
  return disciplinas
    .filter(d => d.resultado === 'AP')
    .reduce((sum, d) => sum + d.ch, 0)
}

function getCursoNome(codigoCurso) {
  const cursoNomes = {
    BICTI: 'Bacharelado Interdisciplinar em Ciência, Tecnologia e Inovação',
    ENG_PROD: 'Engenharia de Produção',
    ENG_ELET: 'Engenharia Elétrica'
  }
  return cursoNomes[codigoCurso] || codigoCurso
}

function mostrarNotificacao(mensagem, tipo = 'success') {
  // Verifica se já existe uma notificação
  let notificacao = document.querySelector('.export-notification')

  if (!notificacao) {
    notificacao = document.createElement('div')
    notificacao.className = 'export-notification'
    document.body.appendChild(notificacao)
  }

  // Define a classe baseada no tipo
  notificacao.className = `export-notification ${tipo}`
  notificacao.textContent = mensagem

  // Mostra a notificação
  notificacao.classList.add('show')

  // Esconde após 3 segundos
  setTimeout(() => {
    notificacao.classList.remove('show')

    // Remove após a animação de fade out
    setTimeout(() => {
      if (notificacao.parentNode) {
        notificacao.parentNode.removeChild(notificacao)
      }
    }, 300)
  }, 3000)
}
