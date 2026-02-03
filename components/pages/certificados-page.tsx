'use client'

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Loader2, AlertCircle, X } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

// Custom Hooks
import { useCertificados } from '@/components/features/certificados/hooks/use-certificados'
import { useCertificadoForm } from '@/components/features/certificados/hooks/use-certificado-form'
import { useCertificadoFilters } from '@/components/features/certificados/hooks/use-certificado-filters'

// Components
import { CertificadosHeader } from '@/components/features/certificados/components/certificados-header'
import { CertificadoStats } from '@/components/features/certificados/components/certificado-stats'
import { CertificadoForm } from '@/components/features/certificados/components/certificado-form'
import { CertificadoList } from '@/components/features/certificados/components/certificado-list'
import { ViewModal } from '@/components/features/certificados/components/view-modal'
import { DeleteModal } from '@/components/features/certificados/components/delete-modal'

export function CertificadosPage() {
  // Custom hooks
  const certificadosLogic = useCertificados()
  const filterLogic = useCertificadoFilters(certificadosLogic.certificados)
  const formLogic = useCertificadoForm(certificadosLogic.loadCertificados)

  // Loading state
  if (certificadosLogic.authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <CertificadosHeader />

        {/* Error Alert */}
        {certificadosLogic.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <AlertTitle className="text-sm font-bold m-0">{certificadosLogic.error.title}</AlertTitle>
              <AlertDescription className="text-sm">
                {certificadosLogic.error.message}
                {certificadosLogic.error.action && (
                  <p className="mt-1 font-medium italic opacity-90">{certificadosLogic.error.action}</p>
                )}
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => certificadosLogic.setError(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </Alert>
        )}

        {/* Statistics */}
        <CertificadoStats stats={certificadosLogic.stats} isLoading={certificadosLogic.isLoading} />

        {/* Form */}
        <CertificadoForm
          showForm={formLogic.showForm}
          setShowForm={formLogic.setShowForm}
          formData={formLogic.formData}
          setFormData={formLogic.setFormData}
          isSubmitting={formLogic.isSubmitting}
          editingId={formLogic.editingId}
          handleSubmit={formLogic.handleSubmit}
          resetForm={formLogic.resetForm}
        />

        {/* List */}
        <CertificadoList
          certificados={certificadosLogic.certificados}
          filteredCertificados={filterLogic.filteredCertificados}
          isLoading={certificadosLogic.isLoading}
          viewMode={filterLogic.viewMode}
          setViewMode={filterLogic.setViewMode}
          showForm={formLogic.showForm}
          setShowForm={formLogic.setShowForm}
          searchTerm={filterLogic.searchTerm}
          setSearchTerm={filterLogic.setSearchTerm}
          filterType={filterLogic.filterType}
          setFilterType={filterLogic.setFilterType}
          onView={certificadosLogic.handleView}
          onEdit={formLogic.handleEdit}
          onDelete={certificadosLogic.handleDeleteRequest}
          onDownload={certificadosLogic.handleDownload}
          onExport={certificadosLogic.handleExport}
        />
      </main>
      <Footer />

      {/* Modals */}
      <ViewModal
        certificado={certificadosLogic.selectedCertificado}
        open={certificadosLogic.showViewModal}
        onClose={() => certificadosLogic.setShowViewModal(false)}
        onDownload={certificadosLogic.handleDownload}
      />
      <DeleteModal
        open={certificadosLogic.showDeleteModal}
        onClose={() => certificadosLogic.setShowDeleteModal(false)}
        onConfirm={certificadosLogic.handleDelete}
      />
    </div>
  )
}
