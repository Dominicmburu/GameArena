// This file handles API calls related to user authentication. 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Function to register a new user
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

// Function to log in a user
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

// Function to log out a user
export const logoutUser = async () => {
    const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
    });
    return response.json();
};

// Function to get the current user's profile
export const getCurrentUser = async () => {
    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        credentials: 'include',
    });
    return response.json();
};