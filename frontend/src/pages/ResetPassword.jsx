import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Lock, Eye, EyeOff, Shield, CheckCircle2, AlertTriangle } from 'lucide-react'
import authService from '../services/authService'
import '../styles/auth.css'

const ResetPassword = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const params = new URLSearchParams(location.search)
    const token = params.get('token') || ''

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [tokenInvalid, setTokenInvalid] = useState(false)

    useEffect(() => {
        if (!token) setTokenInvalid(true)
    }, [token])

    const validate = () => {
        const next = {}
        if (!password) next.password = 'Password is required'
        else if (password.length < 6) next.password = 'Password must be at least 6 characters'

        if (!confirmPassword) next.confirmPassword = 'Please confirm your password'
        else if (password !== confirmPassword) next.confirmPassword = 'Passwords do not match'

        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setIsLoading(true)
        setErrors({})

        try {
            await authService.resetPassword({ token, password })
            setSuccess(true)
            setTimeout(() => navigate('/auth'), 3000)
        } catch (err) {
            if (['INVALID', 'USED', 'EXPIRED'].includes(err.code)) {
                setTokenInvalid(true)
                setErrors({ general: err.message })
            } else {
                setErrors({ general: err.message || 'Failed to reset password' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const renderInvalidToken = () => (
        <>
            <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle mb-3"
                    style={{
                        background: 'rgba(197, 48, 48, 0.15)',
                        border: '1px solid rgba(197, 48, 48, 0.4)'
                    }}>
                    <AlertTriangle size={28} color="#C53030" />
                </div>
                <h3 className="text-white fw-bold mb-1">Link not valid</h3>
                <p className="text-grey small mb-0">
                    {errors.general || 'This reset link is invalid, expired, or has already been used.'}
                </p>
            </div>
            <Link
                to="/forgot-password"
                className="btn w-100 py-3 fw-bold text-uppercase mb-3"
                style={{
                    background: 'linear-gradient(45deg, #3182CE, #805AD5)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0E0E10',
                    fontSize: '1rem',
                    textDecoration: 'none',
                    boxShadow: '0 5px 15px rgba(49, 130, 206, 0.3)'
                }}
            >
                Request a new link
            </Link>
            <div className="text-center">
                <Link to="/auth" className="text-grey small" style={{ textDecoration: 'none' }}>
                    Back to sign in
                </Link>
            </div>
        </>
    )

    const renderSuccess = () => (
        <div className="text-center">
            <div className="d-inline-flex p-3 rounded-circle mb-3"
                style={{
                    background: 'rgba(56, 161, 105, 0.15)',
                    border: '1px solid rgba(56, 161, 105, 0.4)'
                }}>
                <CheckCircle2 size={28} color="#48BB78" />
            </div>
            <h3 className="text-white fw-bold mb-1">Password updated</h3>
            <p className="text-grey small mb-4">
                Your password has been reset successfully. Redirecting to sign in...
            </p>
            <Link
                to="/auth"
                className="btn w-100 py-3 fw-bold text-uppercase"
                style={{
                    background: 'linear-gradient(45deg, #3182CE, #805AD5)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#0E0E10',
                    fontSize: '1rem',
                    textDecoration: 'none'
                }}
            >
                Sign in now
            </Link>
        </div>
    )

    const renderForm = () => (
        <>
            <div className="text-center mb-4">
                <div className="d-inline-flex p-3 rounded-circle mb-3"
                    style={{
                        background: 'rgba(49, 130, 206, 0.15)',
                        border: '1px solid rgba(49, 130, 206, 0.4)'
                    }}>
                    <Lock size={28} color="#3182CE" />
                </div>
                <h3 className="text-white fw-bold mb-1">Set a new password</h3>
                <p className="text-grey small mb-0">
                    Choose a strong password you haven't used before
                </p>
            </div>

            <Form onSubmit={handleSubmit}>
                {errors.general && (
                    <Alert
                        className="border-0 mb-3"
                        style={{
                            background: 'rgba(197, 48, 48, 0.1)',
                            border: '1px solid rgba(197, 48, 48, 0.3)',
                            color: '#C53030',
                            borderRadius: '12px'
                        }}
                    >
                        <div className="d-flex align-items-center">
                            <Shield size={16} className="me-2" />
                            {errors.general}
                        </div>
                    </Alert>
                )}

                <Form.Group className="mb-3">
                    <Form.Label className="text-white fw-medium mb-2">
                        <Lock size={16} className="me-2" />
                        New Password
                    </Form.Label>
                    <div className="position-relative">
                        <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })) }}
                            placeholder="Enter new password"
                            disabled={isLoading}
                            isInvalid={!!errors.password}
                            className="py-3 pe-5"
                            style={{
                                background: 'rgba(20, 20, 25, 0.8)',
                                border: '1px solid rgba(49, 130, 206, 0.3)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <Button
                            variant="link"
                            className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                            style={{ border: 'none', background: 'transparent' }}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                    <Form.Label className="text-white fw-medium mb-2">
                        <Lock size={16} className="me-2" />
                        Confirm New Password
                    </Form.Label>
                    <div className="position-relative">
                        <Form.Control
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setErrors(p => ({ ...p, confirmPassword: '' })) }}
                            placeholder="Confirm new password"
                            disabled={isLoading}
                            isInvalid={!!errors.confirmPassword}
                            className="py-3 pe-5"
                            style={{
                                background: 'rgba(20, 20, 25, 0.8)',
                                border: '1px solid rgba(128, 90, 213, 0.3)',
                                borderRadius: '12px',
                                color: 'white',
                                fontSize: '1rem'
                            }}
                        />
                        <Button
                            variant="link"
                            className="position-absolute top-50 end-0 translate-middle-y pe-3 text-muted"
                            style={{ border: 'none', background: 'transparent' }}
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            tabIndex={-1}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
                </Form.Group>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-100 py-3 fw-bold text-uppercase mb-3"
                    style={{
                        background: 'linear-gradient(45deg, #3182CE, #805AD5)',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#0E0E10',
                        fontSize: '1rem',
                        boxShadow: '0 5px 15px rgba(49, 130, 206, 0.3)'
                    }}
                >
                    {isLoading ? (
                        <div className="d-flex align-items-center justify-content-center">
                            <Spinner animation="border" size="sm" className="me-2"
                                style={{ width: '18px', height: '18px' }} />
                            Updating...
                        </div>
                    ) : (
                        'Update password'
                    )}
                </Button>

                <div className="text-center">
                    <Link to="/auth" className="text-grey small" style={{ textDecoration: 'none' }}>
                        Back to sign in
                    </Link>
                </div>
            </Form>
        </>
    )

    return (
        <div className="min-vh-100 d-flex align-items-center">
            <Container>
                <Row className="justify-content-center">
                    <Col lg={5} md={7} sm={9}>
                        <Card
                            className="border-0 shadow-lg"
                            style={{
                                background: 'rgba(31, 31, 35, 0.95)',
                                border: '1px solid rgba(49, 130, 206, 0.3)',
                                borderRadius: '20px',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <Card.Body className="p-4 p-md-5 position-relative">
                                {tokenInvalid ? renderInvalidToken() : success ? renderSuccess() : renderForm()}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default ResetPassword
