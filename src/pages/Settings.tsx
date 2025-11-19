import { useState } from 'react'
import { Download, Upload, Trash2, FileText, Table, Code, AlertCircle } from 'lucide-react'
import { exportAllData, importData, clearAllData, getAllContainers, getAllItems } from '../db'
import { Container, Item } from '../types'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF
  }
}

export default function Settings() {
  const [importing, setImporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  async function handleExportJSON() {
    try {
      const { containers, items } = await exportAllData()
      const data = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        containers,
        items
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      downloadBlob(blob, 'bin-organize-export.json')
      showMessage('success', 'Data exported successfully!')
    } catch (error) {
      console.error('Export failed:', error)
      showMessage('error', 'Failed to export data.')
    }
  }

  async function handleExportCSV() {
    try {
      const { containers, items } = await exportAllData()

      // Create containers CSV
      const containerRows = containers.map((c) => [
        c.id,
        c.name,
        c.description,
        c.location,
        c.parentId || '',
        c.color,
        new Date(c.createdAt).toISOString()
      ])

      const containerCSV = [
        ['ID', 'Name', 'Description', 'Location', 'Parent ID', 'Color', 'Created'],
        ...containerRows
      ]
        .map((row) => row.map(escapeCSV).join(','))
        .join('\n')

      // Create items CSV
      const itemRows = items.map((i) => [
        i.id,
        i.containerId,
        i.title,
        i.description,
        i.quantity.toString(),
        i.barcode || '',
        new Date(i.createdAt).toISOString()
      ])

      const itemCSV = [
        ['ID', 'Container ID', 'Title', 'Description', 'Quantity', 'Barcode', 'Created'],
        ...itemRows
      ]
        .map((row) => row.map(escapeCSV).join(','))
        .join('\n')

      // Download both files
      const containerBlob = new Blob([containerCSV], { type: 'text/csv' })
      const itemBlob = new Blob([itemCSV], { type: 'text/csv' })

      downloadBlob(containerBlob, 'bin-organize-containers.csv')
      downloadBlob(itemBlob, 'bin-organize-items.csv')

      showMessage('success', 'CSV files exported successfully!')
    } catch (error) {
      console.error('CSV export failed:', error)
      showMessage('error', 'Failed to export CSV.')
    }
  }

  async function handleExportPDF() {
    try {
      const containers = await getAllContainers()
      const items = await getAllItems()

      const doc = new jsPDF()

      // Title
      doc.setFontSize(20)
      doc.text('Bin Organize Inventory', 14, 20)

      doc.setFontSize(10)
      doc.text(`Exported: ${new Date().toLocaleString()}`, 14, 28)

      // Containers table
      doc.setFontSize(14)
      doc.text('Containers', 14, 40)

      const containerData = containers.map((c) => [
        c.name,
        c.description || '-',
        c.location || '-',
        items.filter((i) => i.containerId === c.id).length.toString()
      ])

      doc.autoTable({
        startY: 45,
        head: [['Name', 'Description', 'Location', 'Items']],
        body: containerData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      })

      // Items table
      const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY || 100

      doc.setFontSize(14)
      doc.text('Items', 14, finalY + 15)

      const containerMap = Object.fromEntries(containers.map((c) => [c.id, c.name]))

      const itemData = items.map((i) => [
        i.title,
        containerMap[i.containerId] || '-',
        i.quantity.toString(),
        i.barcode || '-'
      ])

      doc.autoTable({
        startY: finalY + 20,
        head: [['Title', 'Container', 'Qty', 'Barcode']],
        body: itemData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 8 }
      })

      doc.save('bin-organize-inventory.pdf')
      showMessage('success', 'PDF exported successfully!')
    } catch (error) {
      console.error('PDF export failed:', error)
      showMessage('error', 'Failed to export PDF.')
    }
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)

    try {
      const text = await file.text()
      const data = JSON.parse(text)

      if (!data.containers || !data.items) {
        throw new Error('Invalid file format')
      }

      await importData(data.containers as Container[], data.items as Item[])
      showMessage('success', `Imported ${data.containers.length} containers and ${data.items.length} items!`)
    } catch (error) {
      console.error('Import failed:', error)
      showMessage('error', 'Failed to import data. Please check the file format.')
    } finally {
      setImporting(false)
      e.target.value = ''
    }
  }

  async function handleClearData() {
    if (
      confirm(
        'Are you sure you want to delete ALL data? This action cannot be undone.'
      )
    ) {
      if (confirm('This will permanently delete all your containers and items. Continue?')) {
        try {
          await clearAllData()
          showMessage('success', 'All data has been cleared.')
        } catch (error) {
          console.error('Clear failed:', error)
          showMessage('error', 'Failed to clear data.')
        }
      }
    }
  }

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px' }}>Settings</h1>

      {message && (
        <div
          style={{
            marginBottom: '16px',
            padding: '12px',
            background: message.type === 'success' ? '#D1FAE5' : '#FEE2E2',
            color: message.type === 'success' ? '#065F46' : '#991B1B',
            borderRadius: 'var(--radius)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertCircle size={18} />
          {message.text}
        </div>
      )}

      {/* Export Section */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
          Export Data
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
          Download your inventory data in various formats.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <button className="btn btn-secondary" onClick={handleExportJSON}>
            <Code size={16} />
            JSON
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Table size={16} />
            CSV
          </button>
          <button className="btn btn-secondary" onClick={handleExportPDF}>
            <FileText size={16} />
            PDF
          </button>
        </div>
      </section>

      {/* Import Section */}
      <section className="card" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
          Import Data
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
          Restore your data from a JSON backup file.
        </p>

        <label className="btn btn-primary" style={{ cursor: importing ? 'wait' : 'pointer' }}>
          <Upload size={16} />
          {importing ? 'Importing...' : 'Import JSON'}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            style={{ display: 'none' }}
          />
        </label>
      </section>

      {/* Danger Zone */}
      <section className="card" style={{ borderColor: 'var(--danger)' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--danger)' }}>
          Danger Zone
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
          Permanently delete all your containers and items. This action cannot be undone.
        </p>

        <button className="btn btn-danger" onClick={handleClearData}>
          <Trash2 size={16} />
          Delete All Data
        </button>
      </section>

      {/* About Section */}
      <section style={{ marginTop: '32px', textAlign: 'center', color: 'var(--gray-500)', fontSize: '14px' }}>
        <p style={{ marginBottom: '4px' }}>
          <strong>Bin Organize</strong> v1.0.0
        </p>
        <p>
          A personal storage organization app
        </p>
      </section>
    </div>
  )
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
