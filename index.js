/**
 * Book Review API - Main Server File
 * 
 * This file initializes the Express application, sets up middleware,
 * configures authentication, and starts the server.
 * 
 * @module index
 * @requires express
 * @requires jsonwebtoken
 * @requires express-session
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Express middleware configuration
 */
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

/**
 * Session configuration for authenticated routes
 * 
 * Sessions are used to maintain user authentication state across requests.
 * Only applied to routes under '/customer' path.
 */
app.use("/customer", session({
    secret: process.env.SESSION_SECRET || "fingerprint_customer",
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        httpOnly: true, // Prevent client-side JS from accessing the cookie
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

/**
 * Authentication Middleware
 * 
 * Validates JWT tokens for authenticated routes under '/customer/auth/*'.
 * This middleware ensures that only authenticated users can access
 * protected endpoints.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = (req, res, next) => {
    // Check if user has an active session with authorization
    if (req.session.authorization) {
        const token = req.session.authorization.accessToken;

        // Verify JWT token
        jwt.verify(token, process.env.JWT_SECRET || "access", (err, decoded) => {
            if (err) {
                // Token verification failed
                return res.status(403).json({
                    success: false,
                    message: "Authentication failed. Please log in again.",
                    error: err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
                });
            }

            // Token is valid, attach user info to request
            req.user = decoded;
            next();
        });
    } else {
        // No session found
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in.",
            error: "No active session"
        });
    }
};

/**
 * Apply authentication middleware to all routes under '/customer/auth/*'
 */
app.use("/customer/auth/*", authMiddleware);

/**
 * Route handlers
 */
app.use("/customer", customerRoutes); // Authenticated user routes
app.use("/", generalRoutes); // Public routes

/**
 * Global Error Handler
 * 
 * Catches all unhandled errors and returns consistent error responses.
 * This should be the last middleware in the chain.
 */
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack);

    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;

    res.status(statusCode).json({
        success: false,
        message: message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

/**
 * 404 Handler
 * 
 * Catches requests to undefined routes
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.path} not found`,
        suggestion: "Check the API documentation for available endpoints"
    });
});

/**
 * Health Check Endpoint
 * 
 * Used by monitoring tools to verify service availability
 */
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Service is healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

/**
 * Start the server
 * 
 * @listens {number} PORT - The port on which the server will listen
 */
const server = app.listen(PORT, () => {
    console.log(`
    📚 Book Review API Server Started
    =================================
    ✅ Server is running on port: ${PORT}
    ✅ Environment: ${process.env.NODE_ENV || 'development'}
    ✅ Time: ${new Date().toISOString()}
    ✅ Health check: http://localhost:${PORT}/health
    `);
});

/**
 * Graceful Shutdown Handler
 * 
 * Ensures the server closes properly on termination signals
 */
const gracefulShutdown = (signal) => {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
};

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = { app, server };