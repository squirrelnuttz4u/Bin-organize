import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon, Package, Image as ImageIcon, MapPin } from 'lucide-react'
import { Container, Item } from '../types'
import { searchAll, getContainer } from '../db'

export default function Search() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ containers: Container[]; items: Item[] }>({
    containers: [],
    items: []
  })
  const [itemContainers, setItemContainers] = useState<Record<string, Container>>({})
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch()
      } else {
        setResults({ containers: [], items: [] })
        setSearched(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  async function performSearch() {
    setLoading(true)
    try {
      const searchResults = await searchAll(query.trim())
      setResults(searchResults)
      setSearched(true)

      // Load container info for items
      const containerIds = [...new Set(searchResults.items.map((i) => i.containerId))]
      const containers: Record<string, Container> = {}
      for (const id of containerIds) {
        const container = await getContainer(id)
        if (container) containers[id] = container
      }
      setItemContainers(containers)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalResults = results.containers.length + results.items.length

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Search</h1>

      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <SearchIcon
          size={20}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--gray-400)'
          }}
        />
        <input
          type="text"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search containers and items..."
          style={{ paddingLeft: '40px' }}
          autoFocus
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: 'var(--gray-500)' }}>
          Searching...
        </div>
      )}

      {!loading && searched && totalResults === 0 && (
        <div className="empty-state">
          <SearchIcon size={48} />
          <h3 style={{ marginBottom: '8px', color: 'var(--gray-700)' }}>No results found</h3>
          <p>Try a different search term or check your spelling.</p>
        </div>
      )}

      {!loading && searched && totalResults > 0 && (
        <div>
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '16px' }}>
            Found {totalResults} result{totalResults !== 1 ? 's' : ''}
          </p>

          {results.containers.length > 0 && (
            <section style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                Containers ({results.containers.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.containers.map((container) => (
                  <Link
                    key={container.id}
                    to={`/container/${container.id}`}
                    className="card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius)',
                        background: container.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Package size={20} color="white" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                          {highlightText(container.name, query)}
                        </h3>
                        {container.description && (
                          <p style={{
                            fontSize: '12px',
                            color: 'var(--gray-500)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {highlightText(container.description, query)}
                          </p>
                        )}
                        {container.location && (
                          <p style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            color: 'var(--gray-400)',
                            marginTop: '2px'
                          }}>
                            <MapPin size={10} />
                            {container.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {results.items.length > 0 && (
            <section>
              <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px' }}>
                Items ({results.items.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.items.map((item) => {
                  const container = itemContainers[item.containerId]
                  return (
                    <Link
                      key={item.id}
                      to={`/container/${item.containerId}`}
                      className="card"
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {item.images.length > 0 ? (
                          <div style={{
                            width: '48px',
                            height: '48px',
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
                            width: '48px',
                            height: '48px',
                            borderRadius: 'var(--radius)',
                            background: 'var(--gray-100)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <ImageIcon size={20} color="var(--gray-400)" />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: '14px', fontWeight: 600 }}>
                            {highlightText(item.title, query)}
                          </h3>
                          {item.description && (
                            <p style={{
                              fontSize: '12px',
                              color: 'var(--gray-500)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {highlightText(item.description, query)}
                            </p>
                          )}
                          {container && (
                            <p style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: 'var(--gray-400)',
                              marginTop: '2px'
                            }}>
                              <Package size={10} />
                              in {container.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {!searched && !loading && (
        <div className="empty-state">
          <SearchIcon size={48} />
          <h3 style={{ marginBottom: '8px', color: 'var(--gray-700)' }}>Search your inventory</h3>
          <p>Find containers and items by name, description, location, or barcode.</p>
        </div>
      )}
    </div>
  )
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} style={{ background: 'yellow', padding: 0 }}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  )
}
