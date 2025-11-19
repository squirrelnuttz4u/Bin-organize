import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Package, MapPin, ChevronRight, Trash2, Edit2 } from 'lucide-react'
import { Container } from '../types'
import { getAllContainers, addContainer, updateContainer, deleteContainer, getChildContainers } from '../db'
import { v4 as uuidv4 } from 'uuid'
import ContainerModal from '../components/ContainerModal'

export default function ContainerList() {
  const [containers, setContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingContainer, setEditingContainer] = useState<Container | null>(null)
  const [parentId, setParentId] = useState<string | null>(null)

  useEffect(() => {
    loadContainers()
  }, [])

  async function loadContainers() {
    try {
      const data = await getChildContainers(null) // Get root containers
      setContainers(data.sort((a, b) => b.updatedAt - a.updatedAt))
    } catch (error) {
      console.error('Failed to load containers:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(data: Partial<Container>) {
    try {
      if (editingContainer) {
        const updated: Container = {
          ...editingContainer,
          ...data,
          updatedAt: Date.now()
        }
        await updateContainer(updated)
      } else {
        const newContainer: Container = {
          id: uuidv4(),
          name: data.name || '',
          description: data.description || '',
          location: data.location || '',
          parentId: parentId,
          color: data.color || '#4F46E5',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        await addContainer(newContainer)
      }
      await loadContainers()
      setShowModal(false)
      setEditingContainer(null)
      setParentId(null)
    } catch (error) {
      console.error('Failed to save container:', error)
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Are you sure you want to delete this container and all its contents?')) {
      try {
        await deleteContainer(id)
        await loadContainers()
      } catch (error) {
        console.error('Failed to delete container:', error)
      }
    }
  }

  function handleEdit(container: Container) {
    setEditingContainer(container)
    setShowModal(true)
  }

  function handleAdd() {
    setEditingContainer(null)
    setParentId(null)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '24px', textAlign: 'center' }}>
        Loading...
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600 }}>My Containers</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={18} />
          Add Container
        </button>
      </div>

      {containers.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3 style={{ marginBottom: '8px', color: 'var(--gray-700)' }}>No containers yet</h3>
          <p>Create your first container to start organizing your items.</p>
        </div>
      ) : (
        <div className="grid grid-2">
          {containers.map((container) => (
            <ContainerCard
              key={container.id}
              container={container}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <ContainerModal
          container={editingContainer}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingContainer(null)
          }}
        />
      )}
    </div>
  )
}

function ContainerCard({
  container,
  onEdit,
  onDelete
}: {
  container: Container
  onEdit: (c: Container) => void
  onDelete: (id: string) => void
}) {
  const [childCount, setChildCount] = useState(0)

  useEffect(() => {
    getChildContainers(container.id).then(children => setChildCount(children.length))
  }, [container.id])

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        gap: '4px'
      }}>
        <button
          className="btn btn-icon btn-secondary"
          onClick={(e) => {
            e.preventDefault()
            onEdit(container)
          }}
          title="Edit"
        >
          <Edit2 size={16} />
        </button>
        <button
          className="btn btn-icon"
          onClick={(e) => {
            e.preventDefault()
            onDelete(container.id)
          }}
          title="Delete"
          style={{ background: 'var(--gray-100)', color: 'var(--danger)' }}
        >
          <Trash2 size={16} />
        </button>
      </div>

      <Link
        to={`/container/${container.id}`}
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius)',
            background: container.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Package size={24} color="white" />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              marginBottom: '4px',
              paddingRight: '60px'
            }}>
              {container.name}
            </h3>

            {container.description && (
              <p style={{
                fontSize: '14px',
                color: 'var(--gray-600)',
                marginBottom: '8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {container.description}
              </p>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: 'var(--gray-500)'
            }}>
              {container.location && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={12} />
                  {container.location}
                </span>
              )}
              {childCount > 0 && (
                <span>{childCount} sub-container{childCount !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>

          <ChevronRight size={20} color="var(--gray-400)" style={{ flexShrink: 0 }} />
        </div>
      </Link>
    </div>
  )
}
