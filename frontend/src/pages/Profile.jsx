import React, { useState, useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import {
  Settings, User, Mail, MapPin, Award, Lock, History, Eye, EyeOff,
  Check, AlertCircle, ChevronRight, Save, X, LogOut, Trophy,
} from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'
import '../styles/PlayPage.css'
import '../styles/SettingsPage.css'

const AVATARS = ['🎮', '🎯', '🏆', '⚡', '🔥', '💎', '🚀', '🌟', '👾', '🎪', '🎭', '🎨']

const LEVEL_OPTIONS = [
  { value: 'BEGINNER',     label: 'Beginner',     color: '#5BC58A' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: '#3182CE' },
  { value: 'ADVANCED',     label: 'Advanced',     color: '#805AD5' },
  { value: 'EXPERT',       label: 'Expert',       color: '#C53030' },
]

const levelColor = (lvl) => LEVEL_OPTIONS.find(l => l.value === lvl)?.color || '#7A7A7A'

const Profile = () => {
  const { user, logout } = useAuth()
  const {
    profile, stats, isLoading, error,
    updateProfile, updateAvatar, updatePassword,
  } = useProfile()

  // Edit-profile state
  const [editing, setEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({
    username: '', country: '', level: 'BEGINNER',
  })
  const [profileSaving, setProfileSaving] = useState(false)

  // Avatar
  const [avatar, setAvatar] = useState('🎮')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)
  const [avatarSaving, setAvatarSaving] = useState(false)

  // Password
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  })
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw]         = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Feedback
  const [feedback, setFeedback] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        username: profile.username || '',
        country:  profile.country || '',
        level:    profile.level || 'BEGINNER',
      })
      setAvatar(profile.avatar || '🎮')
    }
  }, [profile])

  useEffect(() => {
    if (error) showFeedback(error, 'err')
  }, [error])

  const showFeedback = (msg, type = 'ok') => {
    setFeedback({ msg, type })
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleSaveProfile = async () => {
    if (!profileForm.username.trim()) return showFeedback('Username cannot be empty', 'err')
    try {
      setProfileSaving(true)
      await updateProfile({
        username: profileForm.username.trim(),
        country:  profileForm.country.trim(),
        level:    profileForm.level,
      })
      setEditing(false)
      showFeedback('Profile updated', 'ok')
    } catch (err) {
      showFeedback(err.message || 'Failed to update profile', 'err')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleCancelEdit = () => {
    if (profile) {
      setProfileForm({
        username: profile.username || '',
        country:  profile.country || '',
        level:    profile.level || 'BEGINNER',
      })
    }
    setEditing(false)
  }

  const handlePickAvatar = async (next) => {
    if (next === avatar) {
      setShowAvatarPicker(false)
      return
    }
    try {
      setAvatarSaving(true)
      await updateAvatar(next)
      setAvatar(next)
      setShowAvatarPicker(false)
      showFeedback('Avatar updated', 'ok')
    } catch (err) {
      showFeedback(err.message || 'Failed to update avatar', 'err')
    } finally {
      setAvatarSaving(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e?.preventDefault?.()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showFeedback('New passwords do not match', 'err')
    }
    if (passwordForm.newPassword.length < 6) {
      return showFeedback('Password must be at least 6 characters', 'err')
    }
    try {
      setPasswordSaving(true)
      await updatePassword(passwordForm)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
      showFeedback('Password updated', 'ok')
    } catch (err) {
      showFeedback(err.message || 'Failed to update password', 'err')
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await logout()
    } catch (err) {
      console.error(err)
    } finally {
      setLoggingOut(false)
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="pp-page">
        <div className="pp-loader">
          <Spinner animation="border" style={{ color: '#C53030' }} />
          <div>Loading settings...</div>
        </div>
      </div>
    )
  }

  const winRate     = stats?.winRate || 0
  const totalGames  = stats?.totalGames || 0
  const totalWins   = stats?.wins || 0
  const totalPrize  = stats?.totalPrize || 0
  const globalRank  = stats?.globalRank
  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-KE', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="pp-page">
      <Container fluid className="pp-container">
        {/* Header */}
        <div className="pp-header">
          <div className="pp-header-top">
            <div className="pp-header-titleblock">
              <h1 className="pp-title">
                <Settings size={20} style={{ marginRight: 10, verticalAlign: 'middle', color: '#C53030' }} />
                Settings
              </h1>
              <p className="pp-subtitle">Manage your account, preferences, and security</p>
            </div>
          </div>

          {feedback && (
            <div className={`tp-feedback tp-feedback--${feedback.type}`} style={{ marginTop: 14 }}>
              {feedback.type === 'ok' ? <Check size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} /> : <AlertCircle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />}
              {feedback.msg}
            </div>
          )}
        </div>

        <div className="pp-layout">
          <div className="pp-main">
            {/* ── Identity card ── */}
            <div className="st-card">
              <div className="st-identity">
                <button
                  type="button"
                  className="st-avatar"
                  onClick={() => setShowAvatarPicker(v => !v)}
                  aria-label="Change avatar"
                >
                  <span>{avatar}</span>
                  <span className="st-avatar-edit">
                    <Settings size={11} />
                  </span>
                </button>

                <div className="st-identity-info">
                  <h2 className="st-identity-name">{profile?.username || 'User'}</h2>
                  <div className="st-identity-meta">
                    <span className="st-pill" style={{ color: levelColor(profile?.level), borderColor: `${levelColor(profile?.level)}55`, background: `${levelColor(profile?.level)}18` }}>
                      <Award size={11} /> {profile?.level || 'BEGINNER'}
                    </span>
                    {globalRank && (
                      <span className="st-pill" style={{ color: '#F6AD55', borderColor: 'rgba(246,173,85,0.4)', background: 'rgba(246,173,85,0.1)' }}>
                        <Trophy size={11} /> Global #{globalRank}
                      </span>
                    )}
                    {profile?.country && (
                      <span className="st-pill">
                        <MapPin size={11} /> {profile.country}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {showAvatarPicker && (
                <div className="st-avatar-picker">
                  <div className="st-section-label">Choose Avatar</div>
                  <div className="st-avatar-grid">
                    {AVATARS.map(a => (
                      <button
                        key={a}
                        type="button"
                        className={`st-avatar-option ${avatar === a ? 'active' : ''}`}
                        onClick={() => handlePickAvatar(a)}
                        disabled={avatarSaving}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compact stats strip */}
              <div className="st-stats-strip">
                <div className="st-stat">
                  <span className="st-stat-label">Games</span>
                  <span className="st-stat-value">{totalGames.toLocaleString()}</span>
                </div>
                <div className="st-stat">
                  <span className="st-stat-label">Wins</span>
                  <span className="st-stat-value">{totalWins}</span>
                </div>
                <div className="st-stat">
                  <span className="st-stat-label">Win Rate</span>
                  <span className="st-stat-value">{winRate}%</span>
                </div>
                <div className="st-stat">
                  <span className="st-stat-label">Won</span>
                  <span className="st-stat-value">KES {Number(totalPrize).toLocaleString()}</span>
                </div>
              </div>

              <Link to="/history" className="st-history-link">
                <History size={14} />
                <span>View full game history</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* ── Profile info ── */}
            <div className="st-card">
              <div className="st-card-head">
                <div className="st-card-head-icon"><User size={14} /></div>
                <h3 className="st-card-title">Profile Information</h3>
                {!editing ? (
                  <button type="button" className="pp-btn pp-btn-ghost" onClick={() => setEditing(true)}>
                    Edit
                  </button>
                ) : (
                  <div className="st-card-head-actions">
                    <button
                      type="button"
                      className="pp-btn pp-btn-ghost"
                      onClick={handleCancelEdit}
                      disabled={profileSaving}
                    >
                      <X size={13} /> Cancel
                    </button>
                    <button
                      type="button"
                      className="pp-btn pp-btn-primary"
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                    >
                      {profileSaving ? <Spinner animation="border" size="sm" /> : <Save size={13} />}
                      Save
                    </button>
                  </div>
                )}
              </div>

              <div className="st-grid-2">
                <div className="st-field">
                  <label className="st-label">Username</label>
                  <input
                    type="text"
                    className="st-input"
                    value={profileForm.username}
                    onChange={e => setProfileForm(p => ({ ...p, username: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
                <div className="st-field">
                  <label className="st-label">Country</label>
                  <input
                    type="text"
                    className="st-input"
                    placeholder="—"
                    value={profileForm.country}
                    onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))}
                    disabled={!editing}
                  />
                </div>
              </div>

              <div className="st-field">
                <label className="st-label">Skill Level</label>
                {editing ? (
                  <div className="st-level-pills">
                    {LEVEL_OPTIONS.map(l => (
                      <button
                        key={l.value}
                        type="button"
                        className={`st-level-pill ${profileForm.level === l.value ? 'active' : ''}`}
                        onClick={() => setProfileForm(p => ({ ...p, level: l.value }))}
                        style={profileForm.level === l.value ? {
                          background: `${l.color}18`,
                          borderColor: l.color,
                          color: '#F5F5F5',
                        } : {}}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="st-input st-input--readonly">{profileForm.level}</div>
                )}
              </div>
            </div>

            {/* ── Account info (read-only) ── */}
            <div className="st-card">
              <div className="st-card-head">
                <div className="st-card-head-icon"><Mail size={14} /></div>
                <h3 className="st-card-title">Account</h3>
              </div>

              <div className="st-grid-2">
                <div className="st-readrow">
                  <span className="st-readrow-label">Email</span>
                  <span className="st-readrow-value">{profile?.email || user?.email || '—'}</span>
                </div>
                <div className="st-readrow">
                  <span className="st-readrow-label">Member Since</span>
                  <span className="st-readrow-value">{memberSince}</span>
                </div>
              </div>
              <p className="st-help">
                Email cannot be changed. Contact support if you need to update it.
              </p>
            </div>

            {/* ── Security ── */}
            <div className="st-card">
              <div className="st-card-head">
                <div className="st-card-head-icon"><Lock size={14} /></div>
                <h3 className="st-card-title">Security</h3>
                {!showPasswordForm && (
                  <button
                    type="button"
                    className="pp-btn pp-btn-ghost"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Change Password
                  </button>
                )}
              </div>

              {!showPasswordForm ? (
                <p className="st-help" style={{ margin: 0 }}>
                  Update your password regularly to keep your account secure.
                </p>
              ) : (
                <form onSubmit={handleUpdatePassword}>
                  <div className="st-field">
                    <label className="st-label">Current Password</label>
                    <div className="st-input-eye">
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        className="st-input"
                        value={passwordForm.currentPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="st-eye-btn"
                        onClick={() => setShowCurrentPw(v => !v)}
                        tabIndex={-1}
                        aria-label={showCurrentPw ? 'Hide password' : 'Show password'}
                      >
                        {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="st-grid-2">
                    <div className="st-field">
                      <label className="st-label">New Password</label>
                      <div className="st-input-eye">
                        <input
                          type={showNewPw ? 'text' : 'password'}
                          className="st-input"
                          value={passwordForm.newPassword}
                          onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="st-eye-btn"
                          onClick={() => setShowNewPw(v => !v)}
                          tabIndex={-1}
                          aria-label={showNewPw ? 'Hide password' : 'Show password'}
                        >
                          {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <p className="st-help">Minimum 6 characters</p>
                    </div>

                    <div className="st-field">
                      <label className="st-label">Confirm New Password</label>
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        className="st-input"
                        value={passwordForm.confirmPassword}
                        onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        autoComplete="new-password"
                      />
                    </div>
                  </div>

                  <div className="st-form-actions">
                    <button
                      type="button"
                      className="pp-btn pp-btn-ghost"
                      onClick={() => {
                        setShowPasswordForm(false)
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      disabled={passwordSaving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="pp-btn pp-btn-primary"
                      disabled={passwordSaving || !passwordForm.currentPassword || !passwordForm.newPassword}
                    >
                      {passwordSaving ? <Spinner animation="border" size="sm" /> : <Lock size={13} />}
                      Update Password
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* ── Sign out ── */}
            <div className="st-card st-card--danger">
              <div className="st-card-head">
                <div className="st-card-head-icon st-card-head-icon--danger"><LogOut size={14} /></div>
                <h3 className="st-card-title">Sign Out</h3>
                <button
                  type="button"
                  className="pp-btn pp-btn-ghost-danger"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  {loggingOut ? <Spinner animation="border" size="sm" /> : <LogOut size={13} />}
                  Sign Out
                </button>
              </div>
              <p className="st-help" style={{ margin: 0 }}>
                You'll be returned to the login screen. Your progress is saved.
              </p>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <aside className="pp-aside">
            <div className="st-side-card">
              <div className="st-side-head">
                <History size={14} color="#C53030" />
                <span>Game History</span>
              </div>
              <div className="st-side-body">
                <p className="st-side-msg">
                  Past competitions, players you've faced, and your earnings all in one place.
                </p>
                <Link to="/history" className="pp-btn pp-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  Open History <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            <div className="st-side-card">
              <div className="st-side-head">
                <Award size={14} color="#F6AD55" />
                <span>Performance</span>
              </div>
              <div className="st-side-body">
                <div className="st-perf-row">
                  <span>Average Score</span>
                  <strong>{stats?.averageScore || 0}</strong>
                </div>
                <div className="st-perf-row">
                  <span>Total Score</span>
                  <strong>{(stats?.totalScore || 0).toLocaleString()}</strong>
                </div>
                <div className="st-perf-row">
                  <span>Training Sessions</span>
                  <strong>{stats?.trainingSessions || 0}</strong>
                </div>
                <div className="st-perf-row">
                  <span>Favorite Game</span>
                  <strong className="st-perf-game">{stats?.favoriteGame || '—'}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  )
}

export default Profile
