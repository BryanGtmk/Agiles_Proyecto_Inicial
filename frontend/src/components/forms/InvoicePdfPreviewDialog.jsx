import Dialog from '../ui/Dialog';
import Button from '../ui/Button';

export default function InvoicePdfPreviewDialog({
  open,
  onClose,
  pdfUrl,
  fileName,
  isLoading,
  error,
  onRetry,
  onDownload,
  onOpenExternal,
  onPrint
}) {
  return (
    <Dialog
      open={open}
      title="Vista previa de factura"
      description={fileName ? `Archivo: ${fileName}` : 'Visualizacion del PDF generado.'}
      onClose={onClose}
      panelClassName="dialog-panel--pdf"
      contentClassName="pdf-preview-content"
      footer={(
        <>
          <Button variant="secondary" type="button" onClick={onDownload} disabled={!pdfUrl || isLoading}>
            Descargar PDF
          </Button>
          <Button variant="secondary" type="button" onClick={onPrint} disabled={!pdfUrl || isLoading}>
            Imprimir
          </Button>
          <Button variant="ghost" type="button" onClick={onOpenExternal} disabled={!pdfUrl || isLoading}>
            Abrir en nueva pestaña
          </Button>
          <Button type="button" onClick={onClose}>Cerrar</Button>
        </>
      )}
    >
      {isLoading && <div className="pdf-preview-state">Generando PDF...</div>}

      {!isLoading && error && (
        <div className="pdf-preview-state">
          <div className="inline-message inline-message--error">{error}</div>
          <Button type="button" onClick={onRetry}>Reintentar</Button>
        </div>
      )}

      {!isLoading && !error && pdfUrl && (
        <div className="pdf-preview-embed">
          <object className="pdf-preview-object" data={pdfUrl} type="application/pdf" aria-label="Vista previa de factura en PDF">
            <div className="pdf-preview-fallback">
              <p>No fue posible visualizar el PDF dentro de esta ventana.</p>
              <Button type="button" onClick={onOpenExternal}>Abrir PDF</Button>
            </div>
          </object>
        </div>
      )}
    </Dialog>
  );
}
