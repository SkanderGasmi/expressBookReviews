/**
 * Authenticated User Routes Module
 * 
 * This module contains routes that require user authentication.
 * These routes are protected by JWT and session-based authentication.
 * 
 * @module auth_users
 * @requires express
 * @requires jsonwebtoken
 * @requires ./booksdb
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const booksdb = require("./booksdb.js");

const authenticatedUsersRouter = express.Router();

// In-memory user store (in production, use a database)
let users = [];

/**
 * Validation Utilities
 */

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid
 */
const isValidUsername = (username) => {
  // Username must be 3-30 characters, alphanumeric with optional underscores
  const usernameRegex = /^[a-zA-Z0-9_]{3,30}$/;
  return usernameRegex.test(username);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with success boolean and message
 */
const validatePassword = (password) => {
  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters long"
    };
  }

  if (password.length > 100) {
    return {
      success: false,
      message: "Password must be less than 100 characters"
    };
  }

  return { success: true };
};

/**
 * Authenticates user credentials
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {boolean} True if credentials are valid
 */
const authenticateUser = (username, password) => {
  return users.some(user =>
    user.username === username && user.password === password
  );
};

/**
 * Login Route
 * 
 * POST /customer/login
 * Authenticates user and returns JWT token
 * 
 * @route POST /customer/login
 * @group Authentication - User authentication operations
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - User's username
 * @param {string} req.body.password - User's password
 * @returns {Object} 200 - Login successful
 * @returns {Object} 400 - Missing credentials
 * @returns {Object} 401 - Invalid credentials
 */
authenticatedUsersRouter.post("/login", (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required",
        errors: {
          username: !username ? "Username is required" : undefined,
          password: !password ? "Password is required" : undefined
        }
      });
    }

    // Validate username format
    if (!isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: "Invalid username format",
        errors: {
          username: "Username must be 3-30 alphanumeric characters (underscores allowed)"
        }
      });
    }

    // Authenticate user
    if (!authenticateUser(username, password)) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
        error: "AUTH_FAILED"
      });
    }

    // Generate JWT token
    const tokenPayload = {
      username,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    };

    const accessToken = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || "access",
      { algorithm: 'HS256' }
    );

    // Store token in session
    req.session.authorization = {
      accessToken,
      username,
      loggedInAt: new Date().toISOString()
    };

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        username,
        token: accessToken,
        expiresIn: "1 hour"
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Add or Update Book Review Route
 * 
 * PUT /customer/auth/review/:isbn
 * Allows authenticated users to add or update their review for a book
 * 
 * @route PUT /customer/auth/review/:isbn
 * @group Reviews - Book review operations
 * @param {string} isbn.path.required - Book ISBN
 * @param {Object} req.body - Request body
 * @param {string} req.body.review - Review content
 * @returns {Object} 200 - Review added/updated successfully
 * @returns {Object} 400 - Review content missing
 * @returns {Object} 401 - User not authenticated
 * @returns {Object} 404 - Book not found
 */
authenticatedUsersRouter.put("/auth/review/:isbn", async (req, res, next) => {
  try {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.session.authorization.username;

    // Validate review content
    if (!review || review.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Review content is required and cannot be empty",
        error: "REVIEW_CONTENT_REQUIRED"
      });
    }

    if (review.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Review must be less than 1000 characters",
        error: "REVIEW_TOO_LONG"
      });
    }

    // Add or update review using async/await
    try {
      const updatedBook = await booksdb.addReview(isbn, username, review.trim());

      const action = updatedBook.reviews[username] === review.trim()
        ? "added"
        : "updated";

      return res.status(200).json({
        success: true,
        message: `Review ${action} successfully`,
        data: {
          isbn,
          username,
          review: review.trim(),
          timestamp: new Date().toISOString(),
          action
        }
      });
    } catch (dbError) {
      return res.status(404).json({
        success: false,
        message: dbError.message,
        error: "BOOK_NOT_FOUND"
      });
    }

  } catch (error) {
    next(error);
  }
});

/**
 * Delete Book Review Route
 * 
 * DELETE /customer/auth/review/:isbn
 * Allows authenticated users to delete their review for a book
 * 
 * @route DELETE /customer/auth/review/:isbn
 * @group Reviews - Book review operations
 * @param {string} isbn.path.required - Book ISBN
 * @returns {Object} 200 - Review deleted successfully
 * @returns {Object} 401 - User not authenticated
 * @returns {Object} 404 - Book or review not found
 */
authenticatedUsersRouter.delete("/auth/review/:isbn", async (req, res, next) => {
  try {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    // Delete review using async/await
    try {
      const updatedBook = await booksdb.deleteReview(isbn, username);

      return res.status(200).json({
        success: true,
        message: "Review deleted successfully",
        data: {
          isbn,
          username,
          deletedAt: new Date().toISOString()
        }
      });
    } catch (dbError) {
      const statusCode = dbError.message.includes("not found") ? 404 : 400;

      return res.status(statusCode).json({
        success: false,
        message: dbError.message,
        error: dbError.message.includes("No review")
          ? "REVIEW_NOT_FOUND"
          : "BOOK_NOT_FOUND"
      });
    }

  } catch (error) {
    next(error);
  }
});

/**
 * Get User Profile Route
 * 
 * GET /customer/auth/profile
 * Returns the authenticated user's profile information
 * 
 * @route GET /customer/auth/profile
 * @group User - User profile operations
 * @returns {Object} 200 - User profile
 * @returns {Object} 401 - User not authenticated
 */
authenticatedUsersRouter.get("/auth/profile", (req, res) => {
  const { username } = req.session.authorization;

  const user = users.find(u => u.username === username);

  return res.status(200).json({
    success: true,
    data: {
      username,
      registeredAt: user?.registeredAt || "Unknown",
      lastLogin: req.session.authorization.loggedInAt
    }
  });
});

// Export routes and utilities
module.exports = {
  /**
   * Authenticated user router
   */
  authenticated: authenticatedUsersRouter,

  /**
   * Username validation utility
   */
  isValidUsername,

  /**
   * Password validation utility
   */
  validatePassword,

  /**
   * User authentication utility
   */
  authenticateUser,

  /**
   * In-memory user store (exported for testing and other modules)
   */
  users
};