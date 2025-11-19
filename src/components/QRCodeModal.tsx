import { useEffect, useRef } from 'react'
import { X, Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { Container } from '../types'

interface Props {
  container: Container
  onClose: () => void
}

export default function QRCodeModal({ container, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      // Create QR code data with container ID
      const qrData = JSON.stringify({
        type: 'bin-organize-container',
        id: container.id,
        name: container.name
      })

      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
    }
  }, [container])

  function handleDownload() {
    if (!canvasRef.current) return

    const link = document.createElement('a')
    link.download = `${container.name.replace(/[^a-z0-9]/gi, '_')}_qr.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  function handlePrint() {
    if (!canvasRef.current) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const imgData = canvasRef.current.toDataURL('image/png')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${container.name}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: sans-serif;
            }
            img {
              max-width: 300px;
            }
            h2 {
              margin: 16px 0 8px;
            }
            p {
              margin: 0;
              color: #666;
            }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="QR Code" />
          <h2>${container.name}</h2>
          ${container.location ? `<p>${container.location}</p>` : ''}
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.onload = () => {
      printWindow.print()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
        <div className="modal-header">
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>QR Code</h2>
          <button className="btn btn-icon btn-secondary" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              margin: '0 auto 16px',
              maxWidth: '100%'
            }}
          />

          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
            {container.name}
          </h3>
          {container.location && (
            <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              {container.location}
            </p>
          )}

          <p style={{
            fontSize: '12px',
            color: 'var(--gray-400)',
            marginTop: '16px'
          }}>
            Scan this QR code to quickly access this container
          </p>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={handleDownload}>
            <Download size={16} />
            Download
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            Print
          </button>
        </div>
      </div>
    </div>
  )
}
