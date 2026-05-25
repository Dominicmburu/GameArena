import React from 'react'
import { Gamepad2, Medal, KeyRound, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import CompetitionCard from './CompetitionCard'

const CompetitionsTabs = ({
  activeTab,
  setActiveTab,
  activeCompetitions,
  completedCompetitions,
  onPlay,
  onInvite,
  onCopyCode,
  onLeave,
  copiedCode,
  onJoinClick,
}) => {
  const tabs = [
    { key: 'active',    label: 'Active',    count: activeCompetitions.length },
    { key: 'completed', label: 'Completed', count: completedCompetitions.length },
  ]

  const list = activeTab === 'active' ? activeCompetitions : completedCompetitions
  const mode = activeTab === 'active' ? 'joined' : 'completed'

  return (
    <div className="pp-mygames">
      <div className="pp-subtabs">
        {tabs.map(t => (
          <button
            key={t.key}
            type="button"
            className={`pp-subtab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
            <span className="pp-subtab-count">{t.count}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="pp-empty">
          {activeTab === 'active' ? (
            <>
              <Gamepad2 size={42} color="#3A3A3A" />
              <h5>No active competitions yet</h5>
              <p>Browse public competitions, join by code, or create your own.</p>
              <div className="pp-empty-actions">
                <button type="button" className="pp-btn pp-btn-primary" onClick={onJoinClick}>
                  <KeyRound size={14} /> Join by Code
                </button>
                <Link to="/create" className="pp-btn pp-btn-ghost">
                  <PlusCircle size={14} /> Create Competition
                </Link>
              </div>
            </>
          ) : (
            <>
              <Medal size={42} color="#3A3A3A" />
              <h5>No completed games yet</h5>
              <p>Your finished competitions will show up here.</p>
            </>
          )}
        </div>
      ) : (
        <div className="pp-cardlist">
          {list.map(comp => (
            <CompetitionCard
              key={comp.id}
              competition={comp}
              mode={mode}
              onPlay={onPlay}
              onInvite={onInvite}
              onCopyCode={onCopyCode}
              onLeave={onLeave}
              copiedCode={copiedCode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default CompetitionsTabs
