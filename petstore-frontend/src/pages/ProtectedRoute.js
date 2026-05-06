import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const savedUser = localStorage.getItem('user');
    // 1. Get the JWT token from storage
    const token = localStorage.getItem('token');

    // 2. If no token, kick to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    if (!savedUser || !token) {
            return <Navigate to="/login" replace />;
        }

    const user = JSON.parse(savedUser);
    try {
        // 3. Decode the token to find the role
        const decodedToken = jwtDecode(token);
        
        // Assuming your Spring Boot backend saves the role as "role" or "authorities"
        const userRole = decodedToken.role; // e.g., 'CUSTOMER', 'VENDOR', 'ADMIN'

        // 4. Check if the token is expired
        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return <Navigate to="/login" replace />;
        }

        // 5. Check if the user's role is allowed on this page
        if (!allowedRoles.includes(userRole)) {
            alert("Unauthorized Access: You do not have permission to view this page.");
            // Redirect based on their actual role
            if (userRole === 'VENDOR') return <Navigate to="/vendor-dashboard" replace />;
            if (userRole === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
            return <Navigate to="/" replace />;
        }
        if (allowedRoles && !allowedRoles.includes(user.role)) {
                return <Navigate to="/" replace />;
        }

        // 6. If everything is good, render the page!
        return children;

    } catch (error) {
        console.error("Invalid Token", error);
        localStorage.removeItem('token');
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;