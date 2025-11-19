import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Plus, Package, Edit2, Trash2, QrCode, Image as ImageIcon, ChevronRight, MapPin } from 'lucide-react'
import { Container, Item } from '../types'
import { getContainer, getItemsByContainer, getChildContainers, addItem, updateItem, deleteItem, updateContainer, deleteContainer, addContainer } from '../db'
import { v4 as uuidv4 } from 'uuid'
import ItemModal from '../components/ItemModal'
import ContainerModal from '../components/ContainerModal'
import QRCodeModal from '../components/QRCodeModal'

export default function ContainerDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [container, setContainer] = useState<Container | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [childContainers, setChildContainers] = useState<Container[]>([])
  const [loading, setLoading] = useState(true)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showContainerModal, setShowContainerModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [editingContainer, setEditingContainer] = useState<Container | null>(null)

  useEffect(() => {
    if (id) loadData()
  }, [id])

  async function loadData() {
    try {
      const [containerData, itemsData, children] = await Promise.all([
        getContainer(id!),
        getItemsByContainer(id!),
        getChildContainers(id!)
      ])

      if (!containerData) {
        navigate('/')
        return
      }

      setContainer(containerData)
      setItems(itemsData.sort((a, b) => b.updatedAt - a.updatedAt))
      setChildContainers(children.sort((a, b) => b.updatedAt - a.updatedAt))
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveItem(data: Partial<Item>) {
    try {
      if (editingItem) {
        const updated: Item = {
          ...editingItem,
          ...data,
          updatedAt: Date.now()
        }
        await updateItem(updated)
      } else {
        const newItem: Item = {
          id: uuidv4(),
          containerId: id!,
          title: data.title || '',
          description: data.description || '',
          quantity: data.quantity || 1,
          barcode: data.barcode || null,
          images: data.images || [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        await addItem(newItem)
      }
      await loadData()
      setShowItemModal(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Failed to save item:', error)
    }
  }

  async function handleDeleteItem(itemId: string) {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(itemId)
        await loadData()
      } catch (error) {
        console.error('Failed to delete item:', error)
      }
    }
  }

  async function handleSaveSubContainer(data: Partial<Container>) {
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
          parentId: id!,
          color: data.color || '#4F46E5',
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        await addContainer(newContainer)
      }
      await loadData()
      setShowContainerModal(false)
      setEditingContainer(null)
    } catch (error) {
      console.error('Failed to save container:', error)
    }
  }

  async function handleDeleteContainer() {
    if (confirm('Are you sure you want to delete this container and all its contents?')) {
      try {
        await deleteContainer(id!)
        navigate('/')
      } catch (error) {
        console.error('Failed to delete container:', error)
      }
    }
  }

  async function handleEditContainer() {
    setEditingContainer(container)
    setShowContainerModal(true)
  }

  async function handleUpdateContainer(data: Partial<Container>) {
    if (editingContainer?.id === container?.id) {
      // Editing current container
      const updated: Container = {
        ...container!,
        ...data,
        updatedAt: Date.now()
      }
      await updateContainer(updated)
      setContainer(updated)
    } else {
      await handleSaveSubContainer(data)
    }
    setShowContainerModal(false)
    setEditingContainer(null)
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '24px', textAlign: 'center' }}>
        Loading...
      </div>
    )
  }

  if (!container) return null

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--gray-600)',
            fontSize: '14px',
            marginBottom: '12px'
          }}
        >
          <ArrowLeft size={16} />
          Back to containers
        </Link>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius)',
              background: container.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Package size={28} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
                {container.name}
              </h1>
              {container.location && (
                <p style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--gray-500)',
                  fontSize: '14px'
                }}>
                  <MapPin size={14} />
                  {container.location}
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowQRModal(true)}
              title="QR Code"
            >
              <QrCode size={18} />
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleEditContainer}
              title="Edit"
            >
              <Edit2 size={18} />
            </button>
            <button
              className="btn btn-danger"
              onClick={handleDeleteContainer}
              title="Delete"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {container.description && (
          <p style={{ marginTop: '12px', color: 'var(--gray-600)' }}>
            {container.description}
          </p>
        )}
      </div>

      {/* Sub-containers */}
      {(childContainers.length > 0 || true) && (
        <section style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
              Sub-containers ({childContainers.length})
            </h2>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setEditingContainer(null)
                setShowContainerModal(true)
              }}
            >
              <Plus size={16} />
              Add
            </button>
          </div>

          {childContainers.length === 0 ? (
            <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              No sub-containers. Add containers within this one.
            </p>
          ) : (
            <div className="grid grid-2">
              {childContainers.map((child) => (
                <Link
                  key={child.id}
                  to={`/container/${child.id}`}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--radius)',
                      background: child.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Package size={20} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: 600 }}>{child.name}</h3>
                      {child.location && (
                        <p style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                          {child.location}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={18} color="var(--gray-400)" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Items */}
      <section>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>
            Items ({items.length})
          </h2>
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingItem(null)
              setShowItemModal(true)
            }}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3 style={{ marginBottom: '8px', color: 'var(--gray-700)' }}>No items yet</h3>
            <p>Add items to this container to keep track of what's inside.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(item) => {
                  setEditingItem(item)
                  setShowItemModal(true)
                }}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modals */}
      {showItemModal && (
        <ItemModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setShowItemModal(false)
            setEditingItem(null)
          }}
        />
      )}

      {showContainerModal && (
        <ContainerModal
          container={editingContainer?.id === container.id ? container : editingContainer}
          onSave={editingContainer?.id === container.id ? handleUpdateContainer : handleSaveSubContainer}
          onClose={() => {
            setShowContainerModal(false)
            setEditingContainer(null)
          }}
        />
      )}

      {showQRModal && (
        <QRCodeModal
          container={container}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  )
}

function ItemCard({
  item,
  onEdit,
  onDelete
}: {
  item: Item
  onEdit: (item: Item) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '12px' }}>
        {item.images.length > 0 ? (
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius)',
            overflow: 'hidden',
            flexShrink: 0
          }}>
            <img
              src={item.images[0]}
              alt={item.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius)',
            background: 'var(--gray-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ImageIcon size={24} color="var(--gray-400)" />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '8px'
          }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                Qty: {item.quantity}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn btn-icon btn-secondary"
                onClick={() => onEdit(item)}
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
              <button
                className="btn btn-icon"
                onClick={() => onDelete(item.id)}
                title="Delete"
                style={{ background: 'var(--gray-100)', color: 'var(--danger)' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {item.description && (
            <p style={{
              fontSize: '13px',
              color: 'var(--gray-600)',
              marginTop: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {item.description}
            </p>
          )}

          {item.barcode && (
            <p style={{
              fontSize: '11px',
              color: 'var(--gray-400)',
              marginTop: '4px',
              fontFamily: 'monospace'
            }}>
              Barcode: {item.barcode}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
