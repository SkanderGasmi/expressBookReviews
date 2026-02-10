/**
 * Public Routes Module
 * 
 * This module contains routes that are accessible without authentication.
 * These include book search, registration, and viewing reviews.
 * 
 * @module general
 * @requires express
 * @requires ./booksdb
 * @requires ./auth_users
 */

const express = require('express');
const booksdb = require("./booksdb.js");
const authUtils = require("./auth_users.js");

const publicRouter = express.Router();

/**
 * User Registration Route
 * 
 * POST /register
 * Registers a new user in the system
 * 
 * @route POST /register
 * @group Authentication - User registration
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Desired username (3-30 alphanumeric chars)
 * @param {string} req.body.password - Password (min 6 characters)
 * @returns {Object} 201 - User registered successfully
 * @returns {Object} 400 - Invalid input data
 * @returns {Object} 409 - Username already exists
 */
publicRouter.post("/register", (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Input validation
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

    // Validate username
    if (!authUtils.isValidUsername(username)) {
      return res.status(400).json({
        success: false,
        message: "Invalid username format",
        errors: {
          username: "Username must be 3-30 alphanumeric characters (underscores allowed)"
        }
      });
    }

    // Validate password
    const passwordValidation = authUtils.validatePassword(password);
    if (!passwordValidation.success) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
        errors: {
          password: passwordValidation.message
        }
      });
    }

    // Check if user already exists
    const userExists = authUtils.users.some(user => user.username === username);
    if (userExists) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
        error: "USERNAME_EXISTS"
      });
    }

    // Register new user
    const newUser = {
      username,
      password, // In production, hash the password before storing
      registeredAt: new Date().toISOString()
    };

    authUtils.users.push(newUser);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        username,
        registeredAt: newUser.registeredAt
      }
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Get All Books Route (Async/Await Implementation)
 * 
 * GET /
 * Returns all books available in the shop
 * 
 * @route GET /
 * @group Books - Book retrieval operations
 * @returns {Object} 200 - List of all books
 * @returns {Object} 500 - Server error
 */
publicRouter.get('/', async (req, res, next) => {
  try {
    // Using async/await with the book database promise
    const books = await booksdb.getAllBooks();

    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: books,
      count: Object.keys(books).length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Get Book by ISBN Route (Promise Implementation)
 * 
 * GET /isbn/:isbn
 * Returns book details for the specified ISBN
 * 
 * @route GET /isbn/:isbn
 * @group Books - Book retrieval operations
 * @param {string} isbn.path.required - Book ISBN
 * @returns {Object} 200 - Book details
 * @returns {Object} 404 - Book not found
 * @returns {Object} 500 - Server error
 */
publicRouter.get('/isbn/:isbn', (req, res, next) => {
  const { isbn } = req.params;

  // Validate ISBN parameter
  if (!isbn || isbn.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "ISBN parameter is required",
      error: "MISSING_ISBN"
    });
  }

  // Using Promise with error handling
  booksdb.getBookByISBN(isbn)
    .then(book => {
      return res.status(200).json({
        success: true,
        message: "Book retrieved successfully",
        data: book,
        isbn: isbn
      });
    })
    .catch(error => {
      return res.status(404).json({
        success: false,
        message: error.message || "Book not found",
        error: "BOOK_NOT_FOUND",
        requestedIsbn: isbn
      });
    })
    .catch(next); // Pass unexpected errors to error handler
});

/**
 * Search Books by Author Route (Async/Await Implementation)
 * 
 * GET /author/:author
 * Returns books by the specified author
 * 
 * @route GET /author/:author
 * @group Books - Book search operations
 * @param {string} author.path.required - Author name (partial match supported)
 * @returns {Object} 200 - Matching books
 * @returns {Object} 404 - No books found
 * @returns {Object} 500 - Server error
 */
publicRouter.get('/author/:author', async (req, res, next) => {
  try {
    const { author } = req.params;

    // Validate author parameter
    if (!author || author.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Author parameter is required",
        error: "MISSING_AUTHOR"
      });
    }

    // Search books using async/await
    const matchingBooks = await booksdb.searchByAuthor(author.trim());

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({
        success: false,
        message: `No books found by author containing "${author}"`,
        error: "NO_BOOKS_FOUND",
        searchTerm: author
      });
    }

    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: matchingBooks,
      count: Object.keys(matchingBooks).length,
      searchTerm: author,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Search Books by Title Route (Async/Await Implementation)
 * 
 * GET /title/:title
 * Returns books with titles containing the specified text
 * 
 * @route GET /title/:title
 * @group Books - Book search operations
 * @param {string} title.path.required - Title text (partial match supported)
 * @returns {Object} 200 - Matching books
 * @returns {Object} 404 - No books found
 * @returns {Object} 500 - Server error
 */
publicRouter.get('/title/:title', async (req, res, next) => {
  try {
    const { title } = req.params;

    // Validate title parameter
    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Title parameter is required",
        error: "MISSING_TITLE"
      });
    }

    // Search books using async/await
    const matchingBooks = await booksdb.searchByTitle(title.trim());

    if (Object.keys(matchingBooks).length === 0) {
      return res.status(404).json({
        success: false,
        message: `No books found with title containing "${title}"`,
        error: "NO_BOOKS_FOUND",
        searchTerm: title
      });
    }

    return res.status(200).json({
      success: true,
      message: "Books retrieved successfully",
      data: matchingBooks,
      count: Object.keys(matchingBooks).length,
      searchTerm: title,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    next(error);
  }
});

/**
 * Get Book Reviews Route (Promise Implementation)
 * 
 * GET /review/:isbn
 * Returns all reviews for the specified book
 * 
 * @route GET /review/:isbn
 * @group Reviews - Review retrieval operations
 * @param {string} isbn.path.required - Book ISBN
 * @returns {Object} 200 - Book reviews
 * @returns {Object} 404 - Book not found
 * @returns {Object} 500 - Server error
 */
publicRouter.get('/review/:isbn', (req, res, next) => {
  const { isbn } = req.params;

  // Validate ISBN parameter
  if (!isbn || isbn.trim() === '') {
    return res.status(400).json({
      success: false,
      message: "ISBN parameter is required",
      error: "MISSING_ISBN"
    });
  }

  // Get reviews using Promise
  booksdb.getReviews(isbn)
    .then(reviews => {
      const reviewCount = Object.keys(reviews).length;

      return res.status(200).json({
        success: true,
        message: reviewCount === 0
          ? "No reviews found for this book"
          : "Reviews retrieved successfully",
        data: reviews,
        isbn: isbn,
        count: reviewCount,
        hasReviews: reviewCount > 0
      });
    })
    .catch(error => {
      return res.status(404).json({
        success: false,
        message: error.message || "Book not found",
        error: "BOOK_NOT_FOUND",
        requestedIsbn: isbn
      });
    })
    .catch(next); // Pass unexpected errors to error handler
});

/**
 * Health Check Route
 * 
 * GET /health
 * Returns service health status
 * 
 * @route GET /health
 * @group System - System information
 * @returns {Object} 200 - Service is healthy
 */
publicRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy",
    timestamp: new Date().toISOString(),
    service: "Book Review API",
    version: "1.0.0"
  });
});

/**
 * API Documentation Route
 * 
 * GET /api-docs
 * Returns API documentation
 * 
 * @route GET /api-docs
 * @group System - System information
 * @returns {Object} 200 - API documentation
 */
publicRouter.get('/api-docs', (req, res) => {
  const documentation = {
    service: "Book Review API",
    version: "1.0.0",
    description: "RESTful API for managing book reviews with JWT authentication",
    endpoints: {
      public: [
        { method: "GET", path: "/", description: "Get all books" },
        { method: "GET", path: "/isbn/:isbn", description: "Get book by ISBN" },
        { method: "GET", path: "/author/:author", description: "Search books by author" },
        { method: "GET", path: "/title/:title", description: "Search books by title" },
        { method: "GET", path: "/review/:isbn", description: "Get book reviews" },
        { method: "POST", path: "/register", description: "Register new user" },
        { method: "GET", path: "/health", description: "Service health check" }
      ],
      authenticated: [
        { method: "POST", path: "/customer/login", description: "User login" },
        { method: "PUT", path: "/customer/auth/review/:isbn", description: "Add/update review" },
        { method: "DELETE", path: "/customer/auth/review/:isbn", description: "Delete review" },
        { method: "GET", path: "/customer/auth/profile", description: "Get user profile" }
      ]
    },
    authentication: "JWT token required for authenticated endpoints",
    note: "Use the login endpoint to obtain a JWT token"
  };

  res.status(200).json({
    success: true,
    data: documentation
  });
});

// Export the router
module.exports = {
  general: publicRouter
};