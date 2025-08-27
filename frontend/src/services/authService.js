const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });
    return response.json();
};

export const logoutUser = async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    return response.json();
};

export const getCurrentUser = async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        credentials: 'include',
    });
    return response.json();
};