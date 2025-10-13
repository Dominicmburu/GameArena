import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { Mail, User, Lock, Eye, EyeOff, Gamepad2, Shield, Zap } from 'lucide-react'
import '../styles/auth.css'

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})
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

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear specific error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        // Username validation (only for signup)
        if (!isLogin) {
            if (!formData.username) {
                newErrors.username = 'Username is required'
            } else if (formData.username.length < 3) {
                newErrors.username = 'Username must be at least 3 characters'
            }
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else if (!isLogin && formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }

        // Confirm password validation (only for signup)
        if (!isLogin) {
            if (!formData.confirmPassword) {
                newErrors.confirmPassword = 'Please confirm your password'
            } else if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match'
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            if (isLogin) {
                await login({
                    email: formData.email,
                    password: formData.password
                })
            } else {
                await signup({
                    email: formData.email,
                    username: formData.username,
                    password: formData.password
                })
            }

            // Redirect to homepage on success
            navigate('/')
        } catch (error) {
            setErrors({
                general: error.message || 'Something went wrong. Please try again.'
            })
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
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    return (
        <div
            className="min-vh-100 d-flex align-items-center"
        >
            <Container>
                <Row className="justify-content-center">
                    <Col lg={5} md={7} sm={9}>
                        {/* Auth Card */}
                        <Card
                            className="border-0 shadow-lg"
                            style={{
                                background: 'rgba(31, 31, 35, 0.95)',
                                border: '1px solid rgba(0, 240, 255, 0.3)',
                                borderRadius: '20px',
                                backdropFilter: 'blur(20px)',
                                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Animated background elements */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '-50%',
                                    left: '-50%',
                                    width: '200%',
                                    height: '200%',
                                    background: `
                    radial-gradient(circle at 30% 20%, rgba(0, 240, 255, 0.05) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(155, 0, 255, 0.05) 0%, transparent 50%)
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
                                                background: isLogin ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                                                border: `1px solid ${isLogin ? 'rgba(0, 240, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`
                                            }}
                                        >
                                            <Shield size={20} />
                                        </div>
                                        <div
                                            className={`p-2 rounded ${!isLogin ? 'text-white' : 'text-muted'}`}
                                            style={{
                                                background: !isLogin ? 'rgba(155, 0, 255, 0.2)' : 'transparent',
                                                border: `1px solid ${!isLogin ? 'rgba(155, 0, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`
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
                                            : 'Start your competitive journey'
                                        }
                                    </p>
                                </div>

                                <Form onSubmit={handleSubmit}>
                                    {errors.general && (
                                        <Alert
                                            className="border-0 mb-4"
                                            style={{
                                                background: 'rgba(255, 0, 60, 0.1)',
                                                border: '1px solid rgba(255, 0, 60, 0.3)',
                                                color: '#FF003C',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div className="d-flex align-items-center">
                                                <Shield size={16} className="me-2" />
                                                {errors.general}
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
                                                placeholder="Choose your gamer tag"
                                                disabled={isLoading}
                                                isInvalid={!!errors.username}
                                                className="py-3"
                                                style={{
                                                    background: 'rgba(20, 20, 25, 0.8)',
                                                    border: '1px solid rgba(155, 0, 255, 0.3)',
                                                    borderRadius: '12px',
                                                    color: 'white',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {errors.username}
                                            </Form.Control.Feedback>
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
                                            placeholder="Enter your email"
                                            disabled={isLoading}
                                            isInvalid={!!errors.email}
                                            className="py-3"
                                            style={{
                                                background: 'rgba(20, 20, 25, 0.8)',
                                                border: '1px solid rgba(0, 240, 255, 0.3)',
                                                borderRadius: '12px',
                                                color: 'white',
                                                fontSize: '1rem'
                                            }}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {errors.email}
                                        </Form.Control.Feedback>
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
                                                placeholder="Enter your password"
                                                disabled={isLoading}
                                                isInvalid={!!errors.password}
                                                className="py-3 pe-5"
                                                style={{
                                                    background: 'rgba(20, 20, 25, 0.8)',
                                                    border: '1px solid rgba(0, 240, 255, 0.3)',
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
                                        <Form.Control.Feedback type="invalid">
                                            {errors.password}
                                        </Form.Control.Feedback>
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
                                                    placeholder="Confirm your password"
                                                    disabled={isLoading}
                                                    isInvalid={!!errors.confirmPassword}
                                                    className="py-3 pe-5"
                                                    style={{
                                                        background: 'rgba(20, 20, 25, 0.8)',
                                                        border: '1px solid rgba(155, 0, 255, 0.3)',
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
                                            <Form.Control.Feedback type="invalid">
                                                {errors.confirmPassword}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-100 py-3 fw-bold text-uppercase letter-spacing-1 mb-4"
                                        style={{
                                            background: 'linear-gradient(45deg, #00F0FF, #9B00FF)',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#0E0E10',
                                            fontSize: '1rem',
                                            transition: 'all 0.3s ease',
                                            boxShadow: '0 5px 15px rgba(0, 240, 255, 0.3)'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isLoading) {
                                                e.target.style.transform = 'translateY(-2px)'
                                                e.target.style.boxShadow = '0 10px 25px rgba(0, 240, 255, 0.4)'
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isLoading) {
                                                e.target.style.transform = 'translateY(0)'
                                                e.target.style.boxShadow = '0 5px 15px rgba(0, 240, 255, 0.3)'
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
                                                color: '#00F0FF',
                                                textDecoration: 'none',
                                                border: 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.target.style.color = '#9B00FF'
                                                e.target.style.textDecoration = 'underline'
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.color = '#00F0FF'
                                                e.target.style.textDecoration = 'none'
                                            }}
                                        >
                                            {isLogin ? 'Create Account' : 'Sign In'}
                                        </Button>
                                    </div>
                                </Form>
                            </Card.Body>
                        </Card>

                        {/* Footer */}
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