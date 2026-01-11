import type { UserStatistics } from '@/types'

export function exportAsJSON(backup: any) {
    const dataStr = JSON.stringify(backup, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })

    const link = document.createElement('a')
    link.href = URL.createObjectURL(dataBlob)
    link.download = `historico-universitario-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => URL.revokeObjectURL(link.href), 100)
}

export async function exportAsXLSX(backup: any, disciplinas: any[], statistics: UserStatistics) {
    // Importação dinâmica para reduzir o bundle inicial
    const XLSX = await import('xlsx')

    const wb = XLSX.utils.book_new()

    // Aba 1: Resumo
    const resumoData = [
        ['Histórico Acadêmico'],
        [''],
        ['Informações do Aluno'],
        ['Nome', backup.profile?.nome || backup.user?.displayName || 'Não informado'],
        ['Email', backup.user?.email || 'Não informado'],
        ['Instituição', backup.profile?.institution || 'Não informado'],
        ['Curso', backup.profile?.curso || 'Não informado'],
        ['Matrícula', backup.profile?.matricula || 'Não informado'],
        ['Ano de Ingresso', backup.profile?.startYear || 'Não informado'],
        [''],
        ['Estatísticas Gerais'],
        ['Total de Disciplinas', statistics.totalDisciplines],
        ['Disciplinas Concluídas', statistics.completedDisciplines],
        ['Em Andamento', statistics.inProgressDisciplines],
        ['Média Geral', statistics.averageGrade.toFixed(2)],
    ]
    const wsResumo = XLSX.utils.aoa_to_sheet(resumoData)

    // Ajustar largura das colunas do resumo
    wsResumo['!cols'] = [{ wch: 20 }, { wch: 40 }]
    XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo')

    // Agrupar disciplinas por período
    const disciplinasPorPeriodo: { [key: string]: any[] } = {}
    disciplinas.forEach((d) => {
        const periodo = d.periodo || 'Sem Período'
        if (!disciplinasPorPeriodo[periodo]) {
            disciplinasPorPeriodo[periodo] = []
        }
        disciplinasPorPeriodo[periodo].push(d)
    })

    // Ordenar períodos
    const periodosOrdenados = Object.keys(disciplinasPorPeriodo).sort((a, b) => {
        if (a === 'Sem Período') return 1
        if (b === 'Sem Período') return -1
        return a.localeCompare(b)
    })

    // Criar aba para cada período
    periodosOrdenados.forEach((periodo) => {
        const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo].map((d) => ({
            Código: d.codigo,
            Disciplina: d.nome,
            Natureza: d.natureza,
            'CH': d.ch,
            Nota: d.nota,
            Resultado: d.resultado || '-',
            Curso: d.curso,
        }))

        const ws = XLSX.utils.json_to_sheet(disciplinasDoPeriodo)

        // Ajustar largura das colunas
        ws['!cols'] = [
            { wch: 10 },  // Código
            { wch: 50 },  // Disciplina
            { wch: 10 },  // Natureza
            { wch: 8 },   // CH
            { wch: 8 },   // Nota
            { wch: 12 },  // Resultado
            { wch: 30 }   // Curso
        ]

        // Nome da aba (máximo 31 caracteres)
        const nomeAba = periodo.length > 31 ? periodo.substring(0, 28) + '...' : periodo
        XLSX.utils.book_append_sheet(wb, ws, nomeAba)
    })

    // Aba: Todas as Disciplinas (visão completa)
    const todasDisciplinas = disciplinas.map((d) => ({
        Período: d.periodo,
        Código: d.codigo,
        Disciplina: d.nome,
        Natureza: d.natureza,
        'CH': d.ch,
        Nota: d.nota,
        Resultado: d.resultado || '-',
        Curso: d.curso,
    }))
    const wsTodas = XLSX.utils.json_to_sheet(todasDisciplinas)
    wsTodas['!cols'] = [
        { wch: 10 },  // Período
        { wch: 10 },  // Código
        { wch: 50 },  // Disciplina
        { wch: 10 },  // Natureza
        { wch: 8 },   // CH
        { wch: 8 },   // Nota
        { wch: 12 },  // Resultado
        { wch: 30 }   // Curso
    ]
    XLSX.utils.book_append_sheet(wb, wsTodas, 'Todas')

    // Salvar arquivo
    XLSX.writeFile(wb, `historico-universitario-${new Date().toISOString().split('T')[0]}.xlsx`)
}


export async function exportAsPDF(backup: any, disciplinas: any[], statistics: UserStatistics) {
    // Importações dinâmicas para reduzir o bundle inicial
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const dateStr = new Date().toLocaleDateString('pt-BR')

    // Cabeçalho
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Histórico Acadêmico', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Exportado em: ${dateStr}`, pageWidth / 2, 28, { align: 'center' })

    // Informações do Perfil
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Informações do Aluno', 14, 40)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    let yPos = 48
    const profileInfo = [
        `Nome: ${backup.profile?.nome || backup.user?.displayName || 'Não informado'}`,
        `Email: ${backup.user?.email || 'Não informado'}`,
        `Instituição: ${backup.profile?.institution || 'Não informado'}`,
        `Curso: ${backup.profile?.curso || 'Não informado'}`,
        `Matrícula: ${backup.profile?.matricula || 'Não informado'}`,
        `Ano de Ingresso: ${backup.profile?.startYear || 'Não informado'}`,
    ]
    profileInfo.forEach((info) => {
        doc.text(info, 14, yPos)
        yPos += 6
    })

    // Estatísticas
    yPos += 4
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Estatísticas', 14, yPos)

    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const statsInfo = [
        `Total de Disciplinas: ${statistics.totalDisciplines}`,
        `Disciplinas Concluídas: ${statistics.completedDisciplines}`,
        `Em Andamento: ${statistics.inProgressDisciplines}`,
        `Média Geral: ${statistics.averageGrade.toFixed(2)}`,
    ]
    statsInfo.forEach((info) => {
        doc.text(info, 14, yPos)
        yPos += 6
    })

    // Agrupar disciplinas por período
    const disciplinasPorPeriodo: { [key: string]: any[] } = {}
    disciplinas.forEach((d) => {
        const periodo = d.periodo || 'Sem período'
        if (!disciplinasPorPeriodo[periodo]) {
            disciplinasPorPeriodo[periodo] = []
        }
        disciplinasPorPeriodo[periodo].push(d)
    })

    // Ordenar períodos
    const periodosOrdenados = Object.keys(disciplinasPorPeriodo).sort((a, b) => {
        if (a === 'Sem período') return 1
        if (b === 'Sem período') return -1
        return a.localeCompare(b)
    })

    // Criar tabela para cada período
    yPos += 8
    periodosOrdenados.forEach((periodo, index) => {
        const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo]

        // Verificar se precisa de nova página
        if (yPos > 240) {
            doc.addPage()
            yPos = 20
        }

        // Título do período
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${periodo}`, 14, yPos)
        yPos += 6

        // Dados da tabela
        const tableData = disciplinasDoPeriodo.map((d) => [
            d.codigo,
            d.nome.length > 40 ? d.nome.substring(0, 37) + '...' : d.nome,
            d.natureza,
            d.ch.toString(),
            d.nota.toFixed(1),
            d.resultado || '-',
        ])

        autoTable(doc, {
            startY: yPos,
            head: [['Código', 'Disciplina', 'Nat.', 'CH', 'Nota', 'Res.']],
            body: tableData,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [59, 130, 246], textColor: 255 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 14, right: 14 },
            didDrawPage: (data) => {
                yPos = (data.cursor?.y || yPos) + 8
            },
        })

        // Atualizar yPos após a tabela
        yPos = (doc as any).lastAutoTable.finalY + 8
    })

    // Rodapé
    const totalPages = (doc as any).internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setFont('helvetica', 'italic')
        doc.text(
            `Documento gerado automaticamente em ${dateStr} - Página ${i} de ${totalPages}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
        )
    }

    // Salvar PDF
    doc.save(`historico-universitario-${new Date().toISOString().split('T')[0]}.pdf`)
}
