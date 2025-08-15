import React, { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Badge, Tab, Tabs, Table, Modal, Alert, ProgressBar } from 'react-bootstrap'
import { User, Settings, Trophy, History, Edit3, Save, Camera, Award, TrendingUp, Upload, Download, Share2 } from 'lucide-react'

const Profile = () => {
    const [activeTab, setActiveTab] = useState('overview')
    const [editMode, setEditMode] = useState(false)
    const [showAvatarModal, setShowAvatarModal] = useState(false)
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const [profileData, setProfileData] = useState({
        username: 'ProGamer_2024',
        email: 'progamer@example.com',
        firstName: 'Alex',
        lastName: 'Chen',
        country: 'United States',
        timezone: 'UTC-5',
        bio: 'Competitive gamer with a passion for strategy games and esports. Always looking to improve and climb the ranks!',
        avatar: '🎮',
        dateOfBirth: '1995-03-15',
        phone: '+1 (555) 123-4567',
        website: 'https://progamer2024.com',
        socialMedia: {
            twitter: '@progamer2024',
            twitch: 'progamer2024',
            youtube: 'ProGamer2024'
        }
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        competitionAlerts: true,
        achievementNotifications: true,
        marketingEmails: false,
        publicProfile: true,
        showRealName: false,
        showEmail: false,
        language: 'en',
        theme: 'dark'
    })

    // Available avatars
    const availableAvatars = ['🎮', '🎯', '🏆', '⚡', '🔥', '💎', '🚀', '🌟', '👾', '🎪', '🎭', '🎨']

    // Load data on component mount
    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = () => {
        // Load from localStorage or API
        const savedProfile = localStorage.getItem('userProfile')
        const savedPreferences = localStorage.getItem('userPreferences')

        if (savedProfile) {
            setProfileData(JSON.parse(savedProfile))
        }
        if (savedPreferences) {
            setPreferences(JSON.parse(savedPreferences))
        }
    }

    const saveUserData = () => {
        localStorage.setItem('userProfile', JSON.stringify(profileData))
        localStorage.setItem('userPreferences', JSON.stringify(preferences))
    }

    // Mock user statistics
    const userStats = {
        totalGames: 2847,
        winRate: 87.5,
        totalPrize: 12450,
        globalRank: 42,
        totalHours: 156,
        achievements: 23,
        winStreak: 15,
        favoriteGame: 'Battle Royale'
    }

    // Mock game history
    const gameHistory = [
        {
            id: 1,
            competition: 'Cyber Clash Championship',
            game: 'Battle Royale',
            rank: 23,
            players: 2847,
            prize: 150,
            date: '2024-08-15',
            status: 'completed'
        },
        {
            id: 2,
            competition: 'Brain Hack Tournament',
            game: 'Puzzle',
            rank: 7,
            players: 892,
            prize: 425,
            date: '2024-08-12',
            status: 'completed'
        },
        {
            id: 3,
            competition: 'Speed Run Masters',
            game: 'Racing',
            rank: 156,
            players: 1500,
            prize: 25,
            date: '2024-08-10',
            status: 'completed'
        },
        {
            id: 4,
            competition: 'Strategy Wars Elite',
            game: 'Strategy',
            rank: 5,
            players: 2100,
            prize: 850,
            date: '2024-08-08',
            status: 'completed'
        },
        {
            id: 5,
            competition: 'Lightning Card Duel',
            game: 'Card Game',
            rank: 34,
            players: 567,
            prize: 75,
            date: '2024-08-05',
            status: 'completed'
        }
    ]

    // Mock achievements
    const achievements = [
        { id: 1, title: 'First Victory', description: 'Win your first competition', icon: '🏆', date: '2024-07-15', rarity: 'Common' },
        { id: 2, title: 'Top 10 Player', description: 'Reach top 10 in any competition', icon: '🥇', date: '2024-07-20', rarity: 'Rare' },
        { id: 3, title: 'Streak Master', description: 'Win 10 games in a row', icon: '🔥', date: '2024-08-01', rarity: 'Epic' },
        { id: 4, title: 'Prize Hunter', description: 'Earn $10,000 in prizes', icon: '💰', date: '2024-08-10', rarity: 'Legendary' }
    ]

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (name.includes('.')) {
            const [parent, child] = name.split('.')
            setProfileData({
                ...profileData,
                [parent]: {
                    ...profileData[parent],
                    [child]: value
                }
            })
        } else {
            setProfileData({ ...profileData, [name]: value })
        }
    }

    const handlePreferenceChange = (e) => {
        const { name, checked, value, type } = e.target
        setPreferences({
            ...preferences,
            [name]: type === 'checkbox' ? checked : value
        })
    }

    const handlePasswordChange = (e) => {
        const { name, value } = e.target
        setPasswordData({ ...passwordData, [name]: value })
    }

    const handleSave = async () => {
        if (!validateProfile()) return

        setLoading(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            saveUserData()
            setEditMode(false)
            setSuccessMessage('Profile updated successfully!')

            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            setErrorMessage('Failed to update profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordUpdate = async () => {
        if (!validatePassword()) return

        setLoading(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            setShowPasswordModal(false)
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
            setSuccessMessage('Password updated successfully!')

            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error) {
            setErrorMessage('Failed to update password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const validateProfile = () => {
        if (!profileData.username || profileData.username.length < 3) {
            setErrorMessage('Username must be at least 3 characters long')
            return false
        }
        if (!profileData.email || !/\S+@\S+\.\S+/.test(profileData.email)) {
            setErrorMessage('Please enter a valid email address')
            return false
        }
        return true
    }

    const validatePassword = () => {
        if (!passwordData.currentPassword) {
            setErrorMessage('Current password is required')
            return false
        }
        if (passwordData.newPassword.length < 8) {
            setErrorMessage('New password must be at least 8 characters long')
            return false
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setErrorMessage('New passwords do not match')
            return false
        }
        return true
    }

    const handleAvatarChange = (newAvatar) => {
        setProfileData({ ...profileData, avatar: newAvatar })
        setShowAvatarModal(false)
        if (!editMode) {
            saveUserData()
            setSuccessMessage('Avatar updated successfully!')
            setTimeout(() => setSuccessMessage(''), 3000)
        }
    }

    const handleExportData = () => {
        const dataToExport = {
            profile: profileData,
            preferences: preferences,
            exportDate: new Date().toISOString()
        }

        const dataStr = JSON.stringify(dataToExport, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)

        const link = document.createElement('a')
        link.href = url
        link.download = `gamearena-profile-${profileData.username}-${new Date().toISOString().split('T')[0]}.json`
        link.click()

        URL.revokeObjectURL(url)
    }

    const handleShareProfile = async () => {
        const profileUrl = `${window.location.origin}/player/${profileData.username}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `${profileData.username}'s GameArena Profile`,
                    text: `Check out my gaming profile on GameArena!`,
                    url: profileUrl
                })
            } catch (error) {
                copyToClipboard(profileUrl)
            }
        } else {
            copyToClipboard(profileUrl)
        }
    }

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setSuccessMessage('Profile link copied to clipboard!')
            setTimeout(() => setSuccessMessage(''), 3000)
        })
    }

    const getRankColor = (rank) => {
        if (rank <= 10) return '#FF003C'
        if (rank <= 50) return '#9B00FF'
        if (rank <= 100) return '#00F0FF'
        return '#B0B0B0'
    }

    const getRarityColor = (rarity) => {
        switch (rarity) {
            case 'Common': return '#B0B0B0'
            case 'Rare': return '#00F0FF'
            case 'Epic': return '#9B00FF'
            case 'Legendary': return '#FF003C'
            default: return '#B0B0B0'
        }
    }

    return (
        <div className="profile-page animated-bg">
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
                                                {profileData.avatar}
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
                                            <h2 className="text-white mb-2">{profileData.username}</h2>
                                            <p className="text-muted mb-3">{profileData.bio}</p>

                                            <div className="profile-badges d-flex gap-2 flex-wrap">
                                                <Badge
                                                    style={{
                                                        background: getRankColor(userStats.globalRank),
                                                        padding: '6px 12px'
                                                    }}
                                                >
                                                    Rank #{userStats.globalRank}
                                                </Badge>
                                                <Badge style={{ background: '#9B00FF', padding: '6px 12px' }}>
                                                    {userStats.favoriteGame} Player
                                                </Badge>
                                                <Badge style={{ background: '#00FF85', padding: '6px 12px' }}>
                                                    {userStats.winRate}% Win Rate
                                                </Badge>
                                            </div>
                                        </div>
                                    </Col>

                                    <Col md={3} className="text-end">
                                        {successMessage && (
                                            <Alert variant="success" className="mb-2 py-2">
                                                {successMessage}
                                            </Alert>
                                        )}
                                        {errorMessage && (
                                            <Alert variant="danger" className="mb-2 py-2">
                                                {errorMessage}
                                            </Alert>
                                        )}
                                        <div className="d-flex gap-2 justify-content-end flex-wrap">
                                            <Button
                                                className="btn-outline-cyber"
                                                onClick={handleShareProfile}
                                                size="sm"
                                            >
                                                <Share2 size={16} className="me-1" />
                                                Share
                                            </Button>
                                            <Button
                                                className={editMode ? 'btn-cyber' : 'btn-outline-cyber'}
                                                onClick={() => editMode ? handleSave() : setEditMode(true)}
                                                disabled={loading}
                                            >
                                                {loading ? (
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
                                        </div>
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
                                <h4 className="text-neon fw-bold">{userStats.totalGames.toLocaleString()}</h4>
                                <small className="text-muted">Total Games</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6} className="mb-3">
                        <Card className="cyber-card stat-card h-100">
                            <Card.Body className="text-center">
                                <Award size={30} color="#9B00FF" className="mb-2" />
                                <h4 className="text-purple fw-bold">${userStats.totalPrize.toLocaleString()}</h4>
                                <small className="text-muted">Total Winnings</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6} className="mb-3">
                        <Card className="cyber-card stat-card h-100">
                            <Card.Body className="text-center">
                                <TrendingUp size={30} color="#00FF85" className="mb-2" />
                                <h4 className="text-energy-green fw-bold">{userStats.winStreak}</h4>
                                <small className="text-muted">Win Streak</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} sm={6} className="mb-3">
                        <Card className="cyber-card stat-card h-100">
                            <Card.Body className="text-center">
                                <User size={30} color="#FF003C" className="mb-2" />
                                <h4 className="text-cyber-red fw-bold">{userStats.totalHours}h</h4>
                                <small className="text-muted">Hours Played</small>
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
                                    <Col lg={8}>
                                        {/* Game History */}
                                        <Card className="cyber-card mb-4">
                                            <Card.Header>
                                                <h5 className="mb-0 d-flex align-items-center">
                                                    <History size={20} className="me-2 text-neon" />
                                                    Recent Game History
                                                </h5>
                                            </Card.Header>
                                            <Card.Body className="p-0">
                                                <div className="table-responsive">
                                                    <Table className="mb-0" dark hover>
                                                        <thead>
                                                            <tr>
                                                                <th>Competition</th>
                                                                <th>Game</th>
                                                                <th>Rank</th>
                                                                <th>Prize</th>
                                                                <th>Date</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {gameHistory.map(game => (
                                                                <tr key={game.id}>
                                                                    <td className="text-white">{game.competition}</td>
                                                                    <td>
                                                                        <Badge style={{ background: '#9B00FF' }}>
                                                                            {game.game}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <span
                                                                            className="fw-bold"
                                                                            style={{ color: getRankColor(game.rank) }}
                                                                        >
                                                                            #{game.rank}/{game.players}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-energy-green fw-bold">
                                                                        ${game.prize}
                                                                    </td>
                                                                    <td className="text-muted">
                                                                        {new Date(game.date).toLocaleDateString()}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>

                                    <Col lg={4}>
                                        {/* Achievements */}
                                        <Card className="cyber-card">
                                            <Card.Header>
                                                <h5 className="mb-0 d-flex align-items-center">
                                                    <Award size={20} className="me-2 text-purple" />
                                                    Recent Achievements
                                                </h5>
                                            </Card.Header>
                                            <Card.Body>
                                                <div className="achievements-list">
                                                    {achievements.map(achievement => (
                                                        <div
                                                            key={achievement.id}
                                                            className="achievement-item p-3 mb-3 cyber-card"
                                                            style={{
                                                                border: `1px solid ${getRarityColor(achievement.rarity)}`
                                                            }}
                                                        >
                                                            <div className="d-flex align-items-start">
                                                                <div
                                                                    className="achievement-icon me-3"
                                                                    style={{ fontSize: '2rem' }}
                                                                >
                                                                    {achievement.icon}
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                                        <h6 className="text-white mb-0">{achievement.title}</h6>
                                                                        <Badge
                                                                            style={{
                                                                                background: getRarityColor(achievement.rarity),
                                                                                color: '#0E0E10',
                                                                                fontSize: '0.7rem'
                                                                            }}
                                                                        >
                                                                            {achievement.rarity}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-muted small mb-1">
                                                                        {achievement.description}
                                                                    </p>
                                                                    <small className="text-muted">
                                                                        {new Date(achievement.date).toLocaleDateString()}
                                                                    </small>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab>

                            <Tab eventKey="settings" title="Settings">
                                <Row>
                                    <Col lg={8}>
                                        <Card className="cyber-card">
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
                                                                    value={profileData.username}
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
                                                                    value={profileData.email}
                                                                    onChange={handleInputChange}
                                                                    disabled={!editMode}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white">First Name</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="firstName"
                                                                    value={profileData.firstName}
                                                                    onChange={handleInputChange}
                                                                    disabled={!editMode}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                        <Col md={6}>
                                                            <Form.Group className="mb-3">
                                                                <Form.Label className="text-white">Last Name</Form.Label>
                                                                <Form.Control
                                                                    type="text"
                                                                    name="lastName"
                                                                    value={profileData.lastName}
                                                                    onChange={handleInputChange}
                                                                    disabled={!editMode}
                                                                />
                                                            </Form.Group>
                                                        </Col>
                                                    </Row>
                                                </Form>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Profile;


