import React, { useMemo, useState } from 'react'
import { Search, Filter, Gamepad2, AlertCircle, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import CompetitionCard from './CompetitionCard'

const STATUS_FILTERS = [
  { key: 'all',      label: 'All' },
  { key: 'ONGOING',  label: 'Live Now' },
  { key: 'UPCOMING', label: 'Upcoming' },
]

const BrowseCompetitions = ({
  publicCompetitions = [],
  participatedIds = new Set(),
  onJoin,
  onCopyCode,
  copiedCode,
  loading,
}) => {
  const [statusFilter, setStatusFilter] = useState('all')
  const [gameFilter,   setGameFilter]   = useState('all')
  const [search,       setSearch]       = useState('')

  const gameOptions = useMemo(() => {
    const names = new Set()
    publicCompetitions.forEach(c => c.Game?.name && names.add(c.Game.name))
    return ['all', ...Array.from(names).sort()]
  }, [publicCompetitions])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return publicCompetitions.filter(c => {
      if (participatedIds.has(c.id)) return false
      if (c.status !== 'ONGOING' && c.status !== 'UPCOMING') return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      if (gameFilter   !== 'all' && c.Game?.name !== gameFilter) return false
      if (q && !c.title.toLowerCase().includes(q) && !c.Game?.name?.toLowerCase().includes(q)) return false
      return true
    })
  }, [publicCompetitions, statusFilter, gameFilter, search, participatedIds])

  const live     = filtered.filter(c => c.status === 'ONGOING')
  const upcoming = filtered.filter(c => c.status === 'UPCOMING')

  return (
    <div className="pp-browse">
      {/* Filter bar */}
      <div className="pp-filterbar">
        <div className="pp-status-pills">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              type="button"
              className={`pp-status-pill ${statusFilter === f.key ? 'active' : ''}`}
              onClick={() => setStatusFilter(f.key)}
            >
              {f.key === 'ONGOING' && <span className="pp-live-dot" />}
              {f.label}
            </button>
          ))}
        </div>

        <div className="pp-filter-controls">
          <div className="pp-search">
            <Search size={14} color="#7A7A7A" />
            <input
              type="text"
              placeholder="Search by title or game..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="pp-select-wrap">
            <Filter size={13} color="#7A7A7A" />
            <select value={gameFilter} onChange={e => setGameFilter(e.target.value)}>
              {gameOptions.map(g => (
                <option key={g} value={g}>{g === 'all' ? 'All Games' : g}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="pp-empty">
          <Gamepad2 size={42} color="#3A3A3A" />
          <h5>No competitions match your filters</h5>
          <p>Try adjusting the filters, or create a competition of your own.</p>
          <Link to="/create" className="pp-btn pp-btn-primary">
            <PlusCircle size={14} /> Create Competition
          </Link>
        </div>
      )}

      {/* Live Now */}
      {live.length > 0 && (
        <section className="pp-section">
          <div className="pp-section-head">
            <span className="pp-live-dot pp-live-dot--lg" />
            <h3>Live Now</h3>
            <span className="pp-section-count">{live.length}</span>
          </div>
          <div className="pp-cardlist">
            {live.map(c => (
              <CompetitionCard
                key={c.id}
                competition={c}
                mode="public"
                onJoin={onJoin}
                onCopyCode={onCopyCode}
                copiedCode={copiedCode}
              />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <section className="pp-section">
          <div className="pp-section-head">
            <AlertCircle size={16} color="#3182CE" />
            <h3>Upcoming</h3>
            <span className="pp-section-count">{upcoming.length}</span>
          </div>
          <div className="pp-cardlist">
            {upcoming.map(c => (
              <CompetitionCard
                key={c.id}
                competition={c}
                mode="public"
                onJoin={onJoin}
                onCopyCode={onCopyCode}
                copiedCode={copiedCode}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default BrowseCompetitions
