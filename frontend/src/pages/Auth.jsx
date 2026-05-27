import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Mail, User, Lock, Eye, EyeOff, Shield, Zap, AlertCircle, CheckCircle2 } from 'lucide-react'
import '../styles/auth.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

const validateField = (name, value, formData, isLogin) => {
    switch (name) {
        case 'email':
            if (!value.trim()) return 'Email is required'
            if (value.length > 254) return 'Email is too long'
            if (!EMAIL_REGEX.test(value.trim())) return 'Enter a valid email address'
            return ''

        case 'username':
            if (isLogin) return ''
            if (!value.trim()) return 'Username is required'
            if (value.length < 3) return 'Username must be at least 3 characters'
            if (value.length > 20) return 'Username must be 20 characters or fewer'
            if (!USERNAME_REGEX.test(value)) return 'Only letters, numbers, and underscores'
            return ''

        case 'password':
            if (!value) return 'Password is required'
            if (!isLogin) {
                if (value.length < 6) return 'Password must be at least 6 characters'
                if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter'
                if (!/[0-9]/.test(value)) return 'Password must contain at least one number'
            }
            return ''

        case 'confirmPassword':
            if (isLogin) return ''
            if (!value) return 'Please confirm your password'
            if (value !== formData.password) return 'Passwords do not match'
            return ''

        default:
            return ''
    }
}

const FieldError = ({ message }) => {
    if (!message) return null
    return (
        <div
            className="d-flex align-items-center mt-2"
            style={{ color: '#FC8181', fontSize: '0.8rem' }}
        >
            <AlertCircle size={13} className="me-1 flex-shrink-0" />
            <span>{message}</span>
        </div>
    )
}

const errorBorder = (hasError, baseColor) =>
    hasError ? '1px solid rgba(252, 129, 129, 0.6)' : `1px solid ${baseColor}`

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [touched, setTouched] = useState({})
    const [unverifiedEmail, setUnverifiedEmail] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
    })

    const { login, signup } = useAuth()
    const navigate = useNavigate()

    const runValidation = (data = formData) => {
        const fields = isLogin ? ['email', 'password'] : ['email', 'username', 'password', 'confirmPassword']
        const next = {}
        for (const f of fields) {
            const msg = validateField(f, data[f], data, isLogin)
            if (msg) next[f] = msg
        }
        return next
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        const nextData = { ...formData, [name]: value }
        setFormData(nextData)

        if (touched[name]) {
            const msg = validateField(name, value, nextData, isLogin)
            setErrors(prev => ({ ...prev, [name]: msg }))
        }

        if (name === 'password' && touched.confirmPassword) {
            const msg = validateField('confirmPassword', nextData.confirmPassword, nextData, isLogin)
            setErrors(prev => ({ ...prev, confirmPassword: msg }))
        }

        if (errors.general) {
            setErrors(prev => ({ ...prev, general: '' }))
        }
        if (unverifiedEmail) setUnverifiedEmail('')
    }

    const handleBlur = (e) => {
        const { name, value } = e.target
        setTouched(prev => ({ ...prev, [name]: true }))
        const msg = validateField(name, value, formData, isLogin)
        setErrors(prev => ({ ...prev, [name]: msg }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const validationErrors = runValidation()
        if (Object.keys(validationErrors).length > 0) {
            const allTouched = Object.keys(validationErrors).reduce((acc, k) => {
                acc[k] = true
                return acc
            }, {})
            setTouched(prev => ({ ...prev, ...allTouched }))
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)
        setErrors({})
        setUnverifiedEmail('')

        try {
            if (isLogin) {
                await login({
                    email: formData.email.trim(),
                    password: formData.password
                })
                navigate('/')
            } else {
                const response = await signup({
                    email: formData.email.trim(),
                    username: formData.username.trim(),
                    password: formData.password
                })

                if (response?.requiresVerification) {
                    navigate(`/verify-email?email=${encodeURIComponent(formData.email.trim())}`)
                    return
                }

                navigate('/')
            }
        } catch (error) {
            if (error.code === 'EMAIL_NOT_VERIFIED') {
                setUnverifiedEmail(error.data?.email || formData.email.trim())
                setErrors({})
            } else {
                setErrors({
                    general: error.message || 'Something went wrong. Please try again.'
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    const toggleMode = () => {
        setIsLogin(!isLogin)
        setFormData({
            email: '',
            username: '',
            password: '',
            confirmPassword: ''
        })
        setErrors({})
        setTouched({})
        setUnverifiedEmail('')
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    const passwordsMatch =
        !isLogin &&
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword

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
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: `
                    radial-gradient(circle at 30% 20%, rgba(49, 130, 206, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(128, 90, 213, 0.05) 0%, transparent 50%)
                  `,
                                    animation: 'rotate 20s linear infinite'
                                }}
                            />

                            <Card.Body className="p-4 p-md-5 position-relative">
                                <div className="text-center mb-4">
                                    <div className="d-flex justify-content-center gap-2 mb-3">
                                        <div
                                            className={`p-2 rounded ${isLogin ? 'text-white' : 'text-muted'}`}
                                            style={{
                                                background: isLogin ? 'rgba(49, 130, 206, 0.2)' : 'transparent',
                                                border: `1px solid ${isLogin ? 'rgba(49, 130, 206, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`
                                            }}
                                        >
                                            <Shield size={20} />
                                        </div>
                                        <div
                                            className={`p-2 rounded ${!isLogin ? 'text-white' : 'text-muted'}`}
                                            style={{
                                                background: !isLogin ? 'rgba(128, 90, 213, 0.2)' : 'transparent',
                                                border: `1px solid ${!isLogin ? 'rgba(128, 90, 213, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`
                                            }}
                                        >
                                            <Zap size={20} />
                                        </div>
                                    </div>
                                    <h3 className="text-white fw-bold mb-1">
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                    </h3>
                                    <p className="text-grey small mb-0">
                                        {isLogin
                                            ? 'Access your gaming dashboard'
                                            : 'Start your competitive journey'}
                                    </p>
                                </div>

                                <Form onSubmit={handleSubmit} noValidate>
                                    {errors.general && (
                                        <Alert
                                            className="border-0 mb-4"
                                            style={{
                                                background: 'rgba(197, 48, 48, 0.1)',
                                                border: '1px solid rgba(197, 48, 48, 0.3)',
                                                color: '#FC8181',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <AlertCircle size={16} className="me-2 flex-shrink-0" />
                                                {errors.general}
                                            </div>
                                        </Alert>
                                    )}

                                    {unverifiedEmail && (
                                        <Alert
                                            className="border-0 mb-4"
                                            style={{
                                                background: 'rgba(49, 130, 206, 0.08)',
                                                border: '1px solid rgba(49, 130, 206, 0.4)',
                                                color: '#90CDF4',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div className="d-flex align-items-start">
                                                <Mail size={16} className="me-2 mt-1 flex-shrink-0" />
                                                <div>
                                                    <div className="fw-bold mb-1">One more step</div>
                                                    <div className="small mb-2">
                                                        Please confirm your email address to continue. We can send a code to your inbox.
                                                    </div>
                                                    <Link
                                                        to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                                                        className="fw-bold"
                                                        style={{ color: '#90CDF4', textDecoration: 'underline' }}
                                                    >
                                                        Continue to verification →
                                                    </Link>
                                                </div>
                                            </div>
                                        </Alert>
                                    )}

                                    {/* Username Field (Signup only) */}
                                    {!isLogin && (
                                        <Form.Group className="mb-3">
                                            <Form.Label className="text-white fw-medium mb-2">
                                                <User size={16} className="me-2" />
                                                Username
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                placeholder="Choose your gamer tag"
                                                disabled={isLoading}
                                                autoComplete="username"
                                                maxLength={20}
                                                className="py-3"
                                                style={{
                                                    background: 'rgba(20, 20, 25, 0.8)',
                                                    border: errorBorder(!!errors.username, 'rgba(128, 90, 213, 0.3)'),
                                                    borderRadius: '12px',
                                                    color: 'white',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                            <FieldError message={errors.username} />
                                        </Form.Group>
                                    )}

                                    {/* Email Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-white fw-medium mb-2">
                                            <Mail size={16} className="me-2" />
                                            Email Address
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            placeholder="Enter your email"
                                            disabled={isLoading}
                                            autoComplete="email"
                                            className="py-3"
                                            style={{
                                                background: 'rgba(20, 20, 25, 0.8)',
                                                border: errorBorder(!!errors.email, 'rgba(49, 130, 206, 0.3)'),
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <FieldError message={errors.email} />
                                    </Form.Group>

                                    {/* Password Field */}
                                    <Form.Group className="mb-3">
                                        <Form.Label className="text-white fw-medium mb-2">
                                            <Lock size={16} className="me-2" />
                                            Password
                                        </Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                placeholder={isLogin ? "Enter your password" : "At least 6 characters"}
                                                disabled={isLoading}
                                                autoComplete={isLogin ? "current-password" : "new-password"}
                                                className="py-3 pe-5"
                                                style={{
                                                    background: 'rgba(20, 20, 25, 0.8)',
                                                    border: errorBorder(!!errors.password, 'rgba(49, 130, 206, 0.3)'),
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
                                        <FieldError message={errors.password} />
                                        {isLogin && (
                                            <div className="text-end mt-2">
                                                <Link
                                                    to="/forgot-password"
                                                    className="small fw-medium"
                                                    style={{
                                                        color: '#3182CE',
                                                        textDecoration: 'none'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.target.style.color = '#805AD5'
                                                        e.target.style.textDecoration = 'underline'
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.target.style.color = '#3182CE'
                                                        e.target.style.textDecoration = 'none'
                                                    }}
                                                >
                                                    Forgot password?
                                                </Link>
                                            </div>
                                        )}
                                    </Form.Group>

                                    {/* Confirm Password Field (Signup only) */}
                                    {!isLogin && (
                                        <Form.Group className="mb-4">
                                            <Form.Label className="text-white fw-medium mb-2">
                                                <Lock size={16} className="me-2" />
                                                Confirm Password
                                            </Form.Label>
                                            <div className="position-relative">
                                                <Form.Control
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    onBlur={handleBlur}
                                                    placeholder="Re-enter your password"
                                                    disabled={isLoading}
                                                    autoComplete="new-password"
                                                    className="py-3 pe-5"
                                                    style={{
                                                        background: 'rgba(20, 20, 25, 0.8)',
                                                        border: errorBorder(
                                                            !!errors.confirmPassword,
                                                            passwordsMatch ? 'rgba(72, 187, 120, 0.5)' : 'rgba(128, 90, 213, 0.3)'
                                                        ),
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
                                            <FieldError message={errors.confirmPassword} />
                                            {!errors.confirmPassword && passwordsMatch && (
                                                <div
                                                    className="d-flex align-items-center mt-2"
                                                    style={{ color: '#48BB78', fontSize: '0.8rem' }}
                                                >
                                                    <CheckCircle2 size={13} className="me-1" />
                                                    <span>Passwords match</span>
                                                </div>
                                            )}
                                        </Form.Group>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-100 py-3 fw-bold text-uppercase letter-spacing-1 mb-4"
                                        style={{
                                            background: 'linear-gradient(45deg, #3182CE, #805AD5)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#0E0E10',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 5px 15px rgba(49, 130, 206, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isLoading) {
                                                e.target.style.transform = 'translateY(-2px)'
                                                e.target.style.boxShadow = '0 10px 25px rgba(49, 130, 206, 0.4)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isLoading) {
                                                e.target.style.transform = 'translateY(0)'
                                                e.target.style.boxShadow = '0 5px 15px rgba(49, 130, 206, 0.3)'
                                            }
                                        }}
                                    >
                                        {isLoading ? (
                                            <div className="d-flex align-items-center justify-content-center">
                                                <Spinner
                                                    animation="border"
                                                    size="sm"
                                                    className="me-2"
                                                    style={{
                                                        width: '18px',
                                                        height: '18px',
                                                        borderColor: 'rgba(14, 14, 16, 0.3)',
                                                        borderTopColor: '#0E0E10'
                                                    }}
                                                />
                                                {isLogin ? 'Signing In...' : 'Creating Account...'}
                                            </div>
                                        ) : (
                                            <div className="d-flex align-items-center justify-content-center">
                                                {isLogin ? <Shield size={18} className="me-2" /> : <Zap size={18} className="me-2" />}
                                                {isLogin ? 'Enter Arena' : 'Join Arena'}
                                            </div>
                                        )}
                                    </Button>

                                    {/* Toggle Mode */}
                                    <div className="text-center">
                                        <span className="text-white me-2">
                                            {isLogin ? "New to GameArena?" : "Already have an account?"}
                                        </span>
                                        <Button
                                            variant="link"
                                            onClick={toggleMode}
                                            disabled={isLoading}
                                            className="p-0 fw-bold"
                                            style={{
                                                color: '#3182CE',
                                                textDecoration: 'none',
                                                border: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.color = '#805AD5'
                                                e.target.style.textDecoration = 'underline'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.color = '#3182CE'
                                                e.target.style.textDecoration = 'none'
                                            }}
                                        >
                                            {isLogin ? 'Create Account' : 'Sign In'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        <div className="text-center mt-4">
                            <p className="text-white small mb-0">
                                By continuing, you agree to our Terms of Service and Privacy Policy
                            </p>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Auth
