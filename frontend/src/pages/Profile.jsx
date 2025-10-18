import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Tab, Tabs, Table, Modal, Toast, ToastContainer } from 'react-bootstrap'
import { User, Settings, Trophy, History, Edit3, Save, Camera, Award, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import { useProfile } from '../contexts/ProfileContext'
import { useAuth } from '../contexts/AuthContext'

const Profile = () => {
    const { user } = useAuth()
    const {
        profile,
        stats,
        gameHistory,
        isLoading,
        error,
        updateProfile,
        updateAvatar,
        updatePassword
    } = useProfile()

    const [activeTab, setActiveTab] = useState('overview')
    const [editMode, setEditMode] = useState(false)
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')
    const [toastVariant, setToastVariant] = useState('success')
    const [saving, setSaving] = useState(false)
    const [currentAvatar, setCurrentAvatar] = useState('🎮')

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        country: '',
        level: 'BEGINNER'
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const availableAvatars = ['🎮', '🎯', '🏆', '⚡', '🔥', '💎', '🚀', '🌟', '👾', '🎪', '🎭', '🎨']

    useEffect(() => {
        if (profile) {
            setFormData({
                username: profile.username || '',
                email: profile.email || '',
                country: profile.country || '',
                level: profile.level || 'BEGINNER'
            })
            setCurrentAvatar(profile.avatar || '🎮')
        }
    }, [profile])

    useEffect(() => {
        if (error) {
            showNotification(error, 'error')
        }
    }, [error])

    const showNotification = (message, variant = 'success') => {
        setToastMessage(message)
        setToastVariant(variant)
        setShowToast(true)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData({ ...passwordData, [name]: value })
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            
            await updateProfile({
                username: formData.username,
                country: formData.country,
                level: formData.level
            })
            
            setEditMode(false)
            showNotification('Profile updated successfully!', 'success')
        } catch (err) {
            showNotification(err.message || 'Failed to update profile', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handlePasswordUpdate = async () => {
        try {
            setSaving(true)

            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showNotification('New passwords do not match', 'error')
                setSaving(false)
                return
            }

            if (passwordData.newPassword.length < 6) {
                showNotification('Password must be at least 6 characters', 'error')
                setSaving(false)
                return
            }

            await updatePassword(passwordData)
            
            setShowPasswordModal(false)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            showNotification('Password updated successfully!', 'success')
        } catch (err) {
            showNotification(err.message || 'Failed to update password', 'error')
        } finally {
            setSaving(false)
        }
    }

    const handleAvatarChange = async (newAvatar) => {
        try {
            await updateAvatar(newAvatar)
            setCurrentAvatar(newAvatar)
            setShowAvatarModal(false)
            showNotification('Avatar updated successfully!', 'success')
        } catch (err) {
            showNotification(err.message || 'Failed to update avatar', 'error')
        }
    }

    const getRankColor = (rank) => {
        if (rank <= 10) return '#FF003C'
        if (rank <= 50) return '#9B00FF'
        if (rank <= 100) return '#00F0FF'
        return '#B0B0B0'
    }

    const getLevelBadgeColor = (level) => {
        switch (level) {
            case 'BEGINNER': return '#B0B0B0'
            case 'INTERMEDIATE': return '#00F0FF'
            case 'ADVANCED': return '#9B00FF'
            case 'EXPERT': return '#FF003C'
            default: return '#B0B0B0'
        }
    }

    if (isLoading && !profile) {
        return (
            <Container className="py-5 text-center">
                <div className="loading-spinner" style={{ width: '40px', height: '40px', margin: '0 auto' }} />
                <p className="text-white mt-3">Loading profile...</p>
            </Container>
        )
    }

    return (
        <div className="profile-page animated-bg">
            {/* Toast Notification */}
            <ToastContainer position="top-end" className="p-3" style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}>
                <Toast
                    show={showToast}
                    onClose={() => setShowToast(false)}
                    delay={4000}
                    autohide
                    style={{
                        background: toastVariant === 'success' ? '#1a3a2a' : '#3a1a1a',
                        border: `2px solid ${toastVariant === 'success' ? '#00FF85' : '#FF003C'}`,
                        minWidth: '300px'
                    }}
                >
                    <Toast.Header style={{ background: 'rgba(31, 31, 35, 0.95)', borderBottom: `1px solid ${toastVariant === 'success' ? '#00FF85' : '#FF003C'}` }}>
                        {toastVariant === 'success' ? (
                            <CheckCircle size={16} color="#00FF85" className="me-2" />
                        ) : (
                            <AlertCircle size={16} color="#FF003C" className="me-2" />
                        )}
                        <strong className="me-auto text-white">
                            {toastVariant === 'success' ? 'Success' : 'Error'}
                        </strong>
                    </Toast.Header>
                    <Toast.Body className="text-white" style={{ fontSize: '14px' }}>
                        {toastMessage}
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <Container fluid className="py-4">
                {/* Profile Header */}
                <Row className="mb-4">
                    <Col>
                        <Card className="cyber-card profile-header">
                            <Card.Body className="p-4">
                                <Row className="align-items-center">
                                    <Col md={3} className="text-center mb-3 mb-md-0">
                                        <div className="position-relative d-inline-block">
                                            <div
                                                className="profile-avatar-large"
                                                style={{
                                                    width: '120px',
                                                    height: '120px',
                                                    background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '3rem',
                                                    margin: '0 auto',
                                                    position: 'relative'
                                                }}
                                            >
                                                {currentAvatar}
                                                <Button
                                                    className="avatar-edit-btn position-absolute"
                                                    onClick={() => setShowAvatarModal(true)}
                                                    style={{
                                                        bottom: '0',
                                                        right: '0',
                                                        width: '35px',
                                                        height: '35px',
                                                        borderRadius: '50%',
                                                        background: 'rgba(31, 31, 35, 0.9)',
                                                        border: '2px solid #00F0FF',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <Camera size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={6}>
                                        <div className="profile-info">
                                            <h2 className="text-white mb-2">{profile?.username || 'User'}</h2>
                                            <p className="text-white mb-3">
                                                {profile?.country || 'Location not set'} • Level: {profile?.level || 'BEGINNER'}
                                            </p>

                                            <div className="profile-badges d-flex gap-2 flex-wrap">
                                                <Badge
                                                    style={{
                                                        background: getRankColor(stats?.globalRank || 0),
                                                        padding: '6px 12px'
                                                    }}
                                                >
                                                    Global Rank #{stats?.globalRank || '—'}
                                                </Badge>
                                                <Badge style={{ 
                                                    background: getLevelBadgeColor(profile?.level), 
                                                    padding: '6px 12px' 
                                                }}>
                                                    {profile?.level || 'BEGINNER'}
                                                </Badge>
                                                <Badge style={{ background: '#00FF85', padding: '6px 12px' }}>
                                                    {stats?.winRate || 0}% Win Rate
                                                </Badge>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={3} className="text-end">
                                        <Button
                                            className={editMode ? 'btn-cyber' : 'btn-outline-cyber'}
                                            onClick={() => editMode ? handleSave() : setEditMode(true)}
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <div className="loading-spinner me-2" style={{ width: '16px', height: '16px' }} />
                                            ) : editMode ? (
                                                <>
                                                    <Save size={18} className="me-2" />
                                                    Save Changes
                                                </>
                                            ) : (
                                                <>
                                                    <Edit3 size={18} className="me-2" />
                                                    Edit Profile
                                                </>
                                            )}
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Profile Stats Cards */}
                <Row className="mb-4">
                    <Col lg={3} sm={6} className="mb-3">
                        <Card className="cyber-card stat-card h-100">
                            <Card.Body className="text-center">
                                <Trophy size={30} color="#00F0FF" className="mb-2" />
                                <h4 className="text-neon fw-bold">{stats?.totalGames?.toLocaleString() || 0}</h4>
                                <small className="text-white">Total Games</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6} className="mb-3">
                        <Card className="cyber-card stat-card h-100">
                            <Card.Body className="text-center">
                                <Award size={30} color="#9B00FF" className="mb-2" />
                                <h4 className="text-purple fw-bold">${stats?.totalPrize?.toLocaleString() || 0}</h4>
                                <small className="text-white">Total Winnings</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6} className="mb-3">
                        <Card className="cyber-card stat-card h-100">
                            <Card.Body className="text-center">
                                <TrendingUp size={30} color="#00FF85" className="mb-2" />
                                <h4 className="text-energy-green fw-bold">{stats?.wins || 0}</h4>
                                <small className="text-white">Total Wins</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6} className="mb-3">
                        <Card className="cyber-card stat-card h-100">
                            <Card.Body className="text-center">
                                <User size={30} color="#FF003C" className="mb-2" />
                                <h4 className="text-cyber-red fw-bold">{stats?.totalHours || 0}h</h4>
                                <small className="text-white">Hours Played</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Tabbed Content */}
                <Row>
                    <Col>
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(tab) => setActiveTab(tab)}
                            className="cyber-tabs mb-4"
                        >
                            <Tab eventKey="overview" title="Overview">
                                <Row>
                                    <Col lg={12}>
                                        <Card className="cyber-card mb-4">
                                            <Card.Header>
                                                <h5 className="mb-0 d-flex align-items-center">
                                                    <History size={20} className="me-2 text-neon" />
                                                    Recent Game History
                                                </h5>
                                            </Card.Header>
                                            <Card.Body className="p-0">
                                                {gameHistory && gameHistory.length > 0 ? (
                                                    <div className="table-responsive">
                                                        <Table className="mb-0" variant="dark" hover>
                                                            <thead>
                                                                <tr>
                                                                    <th>Competition</th>
                                                                    <th>Game</th>
                                                                    <th>Rank</th>
                                                                    <th>Score</th>
                                                                    <th>Date</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {gameHistory.map(game => (
                                                                    <tr key={game.id}>
                                                                        <td className="text-white">{game.title}</td>
                                                                        <td>
                                                                            <Badge style={{ background: '#9B00FF' }}>
                                                                                {game.gameName}
                                                                            </Badge>
                                                                        </td>
                                                                        <td>
                                                                            <span
                                                                                className="fw-bold"
                                                                                style={{ color: getRankColor(game.rank || 0) }}
                                                                            >
                                                                                #{game.rank || '—'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="text-energy-green fw-bold">
                                                                            {game.score || 0}
                                                                        </td>
                                                                        <td className="text-white">
                                                                            {new Date(game.joinedAt).toLocaleDateString()}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </Table>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-5">
                                                        <History size={48} color="#666" className="mb-3" />
                                                        <p className="text-white">No game history yet</p>
                                                        <small className="text-muted">Start playing to build your history!</small>
                                                    </div>
                                                )}
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab>

                            <Tab eventKey="settings" title="Settings">
                                <Row>
                                    <Col lg={8}>
                                        <Card className="cyber-card mb-4">
                                            <Card.Header>
                                                <h5 className="mb-0 d-flex align-items-center">
                                                    <Settings size={20} className="me-2 text-neon" />
                                                    Profile Settings
                                                </h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <Form>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white">Username</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="username"
                                                                    value={formData.username}
                                                                    onChange={handleInputChange}
                                                                    disabled={!editMode}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white">Email</Form.Label>
                                                                <Form.Control
                                                                    type="email"
                                                                    name="email"
                                                                    value={formData.email}
                                                                    onChange={handleInputChange}
                                                                    disabled
                                                                />
                                                                <Form.Text className="text-muted">
                                                                    Email cannot be changed
                                                                </Form.Text>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white">Country</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="country"
                                                                    value={formData.country}
                                                                    onChange={handleInputChange}
                                                                    disabled={!editMode}
                                                                    placeholder="Enter your country"
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white">Level</Form.Label>
                                                                <Form.Select
                                                                    name="level"
                                                                    value={formData.level}
                                                                    onChange={handleInputChange}
                                                                    disabled={!editMode}
                                                                >
                                                                    <option value="BEGINNER">Beginner</option>
                                                                    <option value="INTERMEDIATE">Intermediate</option>
                                                                    <option value="ADVANCED">Advanced</option>
                                                                    <option value="EXPERT">Expert</option>
                                                                </Form.Select>
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </Form>

                                                <div className="mt-4 pt-3 border-top">
                                                    <Button
                                                        variant="outline-danger"
                                                        onClick={() => setShowPasswordModal(true)}
                                                    >
                                                        Change Password
                                                    </Button>
                                                </div>
                                            </Card.Body>
                                        </Card>

                                        <Card className="cyber-card">
                                            <Card.Header>
                                                <h5 className="mb-0">Performance Summary</h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <Row>
                                                    <Col md={6} className="mb-3">
                                                        <div className="stat-item">
                                                            <small className="text-white d-block mb-1">Average Score</small>
                                                            <h4 className="text-neon mb-0">{stats?.averageScore || 0}</h4>
                                                        </div>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <div className="stat-item">
                                                            <small className="text-white d-block mb-1">Total Score</small>
                                                            <h4 className="text-purple mb-0">{stats?.totalScore?.toLocaleString() || 0}</h4>
                                                        </div>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <div className="stat-item">
                                                            <small className="text-white d-block mb-1">Training Sessions</small>
                                                            <h4 className="text-energy-green mb-0">{stats?.trainingSessions || 0}</h4>
                                                        </div>
                                                    </Col>
                                                    <Col md={6} className="mb-3">
                                                        <div className="stat-item">
                                                            <small className="text-white d-block mb-1">Favorite Game</small>
                                                            <h4 className="text-cyber-red mb-0 text-truncate">{stats?.favoriteGame || 'N/A'}</h4>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>

            {/* Avatar Selection Modal */}
            <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
                <Modal.Header closeButton style={{ background: '#1F1F23', borderColor: '#2A2A2E' }}>
                    <Modal.Title className="text-white">Choose Avatar</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: '#1F1F23' }}>
                    <div className="d-flex flex-wrap gap-3 justify-content-center">
                        {availableAvatars.map((avatar, index) => (
                            <div
                                key={index}
                                onClick={() => handleAvatarChange(avatar)}
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    background: currentAvatar === avatar 
                                        ? 'linear-gradient(45deg, #00F0FF, #9B00FF)' 
                                        : '#2A2A2E',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '2.5rem',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s',
                                    border: currentAvatar === avatar ? '3px solid #00F0FF' : 'none'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                {avatar}
                            </div>
                        ))}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Password Change Modal */}
            <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                <Modal.Header closeButton style={{ background: '#1F1F23', borderColor: '#2A2A2E' }}>
                    <Modal.Title style={{ color: '#ffffff' }}>Change Password</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ background: '#1F1F23' }}>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>Current Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter current password"
                                style={{
                                    background: '#2A2A2E',
                                    border: '1px solid #3A3A3E',
                                    color: '#ffffff'
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                placeholder="Enter new password"
                                style={{
                                    background: '#2A2A2E',
                                    border: '1px solid #3A3A3E',
                                    color: '#ffffff'
                                }}
                            />
                            <Form.Text style={{ color: '#B0B0B0', fontSize: '0.875rem' }}>
                                Must be at least 6 characters
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label style={{ color: '#ffffff', fontWeight: '500' }}>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                placeholder="Confirm new password"
                                style={{
                                    background: '#2A2A2E',
                                    border: '1px solid #3A3A3E',
                                    color: '#ffffff'
                                }}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer style={{ background: '#1F1F23', borderColor: '#2A2A2E' }}>
                    <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        className="btn-cyber" 
                        onClick={handlePasswordUpdate}
                        disabled={saving}
                    >
                        {saving ? 'Updating...' : 'Update Password'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}

export default Profile