import type { Disciplina, Profile, UserStatistics } from '@/types'
import { calcularCR } from './utils/calculations'

export interface ExportBackup {
  exportedAt: string
  disciplines: Disciplina[]
  profile: Profile | null
  user: {
    uid: string
    email: string | null
    displayName: string | null
  }
}

export function exportAsJSON(backup: ExportBackup): void {
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

export async function exportAsXLSX(backup: ExportBackup, disciplinas: Disciplina[], statistics: UserStatistics): Promise<void> {
    const { default: ExcelJS } = await import('exceljs')
    const workbook = new ExcelJS.Workbook()

    const cr = calcularCR(disciplinas)

    // Aba 1: Resumo
    const wsResumo = workbook.addWorksheet('Resumo')
    wsResumo.columns = [{ width: 25 }, { width: 40 }]
    wsResumo.addRows([
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
        ['CR (Coeficiente de Rendimento)', cr.toFixed(2)],
    ])

    const disciplinasPorPeriodo: Record<string, Disciplina[]> = {}
    disciplinas.forEach((d) => {
        const periodo = d.periodo || 'Sem Período'
        if (!disciplinasPorPeriodo[periodo]) {
            disciplinasPorPeriodo[periodo] = []
        }
        disciplinasPorPeriodo[periodo].push(d)
    })

    const periodosOrdenados = Object.keys(disciplinasPorPeriodo).sort((a, b) => {
        if (a === 'Sem Período') return 1
        if (b === 'Sem Período') return -1
        return a.localeCompare(b)
    })

    periodosOrdenados.forEach((periodo) => {
        const nomeAba = periodo.length > 31 ? periodo.substring(0, 28) + '...' : periodo
        const ws = workbook.addWorksheet(nomeAba)
        ws.columns = [
            { width: 10 },
            { width: 50 },
            { width: 10 },
            { width: 8 },
            { width: 8 },
            { width: 12 },
            { width: 30 },
        ]
        ws.addRow(['Código', 'Disciplina', 'Natureza', 'CH', 'Nota', 'Resultado', 'Curso'])
        disciplinasPorPeriodo[periodo].forEach((d) => {
            ws.addRow([d.codigo, d.nome, d.natureza, d.ch, d.nota, d.resultado || '-', d.curso])
        })
    })

    const wsTodas = workbook.addWorksheet('Todas')
    wsTodas.columns = [
        { width: 10 },
        { width: 10 },
        { width: 50 },
        { width: 10 },
        { width: 8 },
        { width: 8 },
        { width: 12 },
        { width: 30 },
    ]
    wsTodas.addRow(['Período', 'Código', 'Disciplina', 'Natureza', 'CH', 'Nota', 'Resultado', 'Curso'])
    disciplinas.forEach((d) => {
        wsTodas.addRow([d.periodo, d.codigo, d.nome, d.natureza, d.ch, d.nota, d.resultado || '-', d.curso])
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `historico-universitario-${new Date().toISOString().split('T')[0]}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(url), 100)
}

export async function exportAsPDF(backup: ExportBackup, disciplinas: Disciplina[], statistics: UserStatistics): Promise<void> {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const dateStr = new Date().toLocaleDateString('pt-BR')

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Histórico Acadêmico', pageWidth / 2, 20, { align: 'center' })

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Exportado em: ${dateStr}`, pageWidth / 2, 28, { align: 'center' })

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

    yPos += 4
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Estatísticas', 14, yPos)

    const cr = calcularCR(disciplinas)

    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const statsInfo = [
        `Total de Disciplinas: ${statistics.totalDisciplines}`,
        `Disciplinas Concluídas: ${statistics.completedDisciplines}`,
        `Em Andamento: ${statistics.inProgressDisciplines}`,
        `Média Geral: ${statistics.averageGrade.toFixed(2)}`,
        `CR (Coeficiente de Rendimento): ${cr.toFixed(2)}`,
    ]
    statsInfo.forEach((info) => {
        doc.text(info, 14, yPos)
        yPos += 6
    })

    const disciplinasPorPeriodo: Record<string, Disciplina[]> = {}
    disciplinas.forEach((d) => {
        const periodo = d.periodo || 'Sem período'
        if (!disciplinasPorPeriodo[periodo]) {
            disciplinasPorPeriodo[periodo] = []
        }
        disciplinasPorPeriodo[periodo].push(d)
    })

    const periodosOrdenados = Object.keys(disciplinasPorPeriodo).sort((a, b) => {
        if (a === 'Sem período') return 1
        if (b === 'Sem período') return -1
        return a.localeCompare(b)
    })

    yPos += 8
    periodosOrdenados.forEach((periodo) => {
        const disciplinasDoPeriodo = disciplinasPorPeriodo[periodo]

        if (yPos > 240) {
            doc.addPage()
            yPos = 20
        }

        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(`${periodo}`, 14, yPos)
        yPos += 6

        const tableData = disciplinasDoPeriodo.map((d) => [
            d.codigo,
            d.nome.length > 40 ? d.nome.substring(0, 37) + '...' : d.nome,
            d.natureza,
            d.ch.toString(),
            (d.nota ?? 0).toFixed(1),
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

        // jspdf-autotable extends jsPDF at runtime; the property is not in the type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        yPos = (doc as any).lastAutoTable.finalY + 8
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPages = (doc.internal as any).getNumberOfPages() as number
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

    doc.save(`historico-universitario-${new Date().toISOString().split('T')[0]}.pdf`)
}
