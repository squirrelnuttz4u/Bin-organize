import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, AlertCircle, CheckCircle } from 'lucide-react'
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library'
import { getContainer } from '../db'

export default function ScanPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserMultiFormatReader | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  useEffect(() => {
    startScanning()

    return () => {
      stopScanning()
    }
  }, [])

  async function startScanning() {
    try {
      setError(null)
      setScanning(true)

      const reader = new BrowserMultiFormatReader()
      readerRef.current = reader

      const videoInputDevices = await reader.listVideoInputDevices()

      if (videoInputDevices.length === 0) {
        setError('No camera found. Please connect a camera and try again.')
        setScanning(false)
        return
      }

      // Prefer back camera on mobile devices
      const backCamera = videoInputDevices.find(
        (device) =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
      )

      const deviceId = backCamera?.deviceId || videoInputDevices[0].deviceId

      await reader.decodeFromVideoDevice(
        deviceId,
        videoRef.current!,
        async (result, error) => {
          if (result) {
            const text = result.getText()
            await handleScanResult(text)
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error('Scan error:', error)
          }
        }
      )
    } catch (err) {
      console.error('Failed to start scanner:', err)
      setError('Failed to access camera. Please ensure camera permissions are granted.')
      setScanning(false)
    }
  }

  function stopScanning() {
    if (readerRef.current) {
      readerRef.current.reset()
      readerRef.current = null
    }
    setScanning(false)
  }

  async function handleScanResult(text: string) {
    stopScanning()
    setResult(text)

    try {
      // Try to parse as Bin Organize QR code
      const data = JSON.parse(text)

      if (data.type === 'bin-organize-container' && data.id) {
        const container = await getContainer(data.id)

        if (container) {
          // Navigate to the container
          setTimeout(() => {
            navigate(`/container/${data.id}`)
          }, 1000)
        } else {
          setError('Container not found. It may have been deleted.')
          setTimeout(() => {
            setResult(null)
            setError(null)
            startScanning()
          }, 3000)
        }
      } else {
        setError('Invalid QR code format.')
        setTimeout(() => {
          setResult(null)
          setError(null)
          startScanning()
        }, 3000)
      }
    } catch {
      // Not a JSON QR code - might be a barcode
      setError(`Scanned: ${text}. This is not a Bin Organize QR code.`)
      setTimeout(() => {
        setResult(null)
        setError(null)
        startScanning()
      }, 3000)
    }
  }

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Scan QR Code</h1>

      <div style={{
        background: 'black',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        aspectRatio: '1',
        maxWidth: '400px',
        margin: '0 auto',
        position: 'relative'
      }}>
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Scan overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '60%',
            height: '60%',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            borderRadius: 'var(--radius)'
          }} />
        </div>

        {!scanning && !result && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white'
          }}>
            <Camera size={48} />
          </div>
        )}

        {result && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(16, 185, 129, 0.9)',
            color: 'white',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <CheckCircle size={48} />
            <span>QR Code Detected!</span>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--gray-100)',
          borderRadius: 'var(--radius)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          color: 'var(--gray-700)',
          fontSize: '14px'
        }}>
          <AlertCircle size={18} color="var(--warning)" style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}

      <div style={{
        marginTop: '24px',
        textAlign: 'center',
        color: 'var(--gray-500)',
        fontSize: '14px'
      }}>
        <p style={{ marginBottom: '8px' }}>
          Point your camera at a Bin Organize QR code to quickly access that container.
        </p>
        <p>
          QR codes can be generated from any container's detail page.
        </p>
      </div>
    </div>
  )
}
