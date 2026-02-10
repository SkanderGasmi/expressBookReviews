/**
 * Book Database Module
 * 
 * This module contains the in-memory book database with sample data.
 * In a production environment, this would be replaced with a proper
 * database connection (MongoDB, PostgreSQL, etc.).
 * 
 * @module booksdb
 * @type {Object}
 */

/**
 * Books database object
 * 
 * Structure:
 * {
 *   [isbn]: {
 *     author: string,
 *     title: string,
 *     reviews: {
 *       [username]: string
 *     }
 *   }
 * }
 */
const books = {
      1: {
            author: "Chinua Achebe",
            title: "Things Fall Apart",
            reviews: {},
            genre: ["Fiction", "Historical"],
            year: 1958,
            rating: 4.5
      },
      2: {
            author: "Hans Christian Andersen",
            title: "Fairy tales",
            reviews: {},
            genre: ["Fantasy", "Children"],
            year: 1837,
            rating: 4.3
      },
      3: {
            author: "Dante Alighieri",
            title: "The Divine Comedy",
            reviews: {},
            genre: ["Epic Poetry", "Classic"],
            year: 1320,
            rating: 4.7
      },
      4: {
            author: "Unknown",
            title: "The Epic Of Gilgamesh",
            reviews: {},
            genre: ["Epic Poetry", "Ancient"],
            year: -2100,
            rating: 4.2
      },
      5: {
            author: "Unknown",
            title: "The Book Of Job",
            reviews: {},
            genre: ["Religious", "Philosophy"],
            year: -600,
            rating: 4.4
      },
      6: {
            author: "Unknown",
            title: "One Thousand and One Nights",
            reviews: {},
            genre: ["Folklore", "Fantasy"],
            year: 800,
            rating: 4.6
      },
      7: {
            author: "Unknown",
            title: "Njál's Saga",
            reviews: {},
            genre: ["Saga", "Historical"],
            year: 1280,
            rating: 4.1
      },
      8: {
            author: "Jane Austen",
            title: "Pride and Prejudice",
            reviews: {},
            genre: ["Romance", "Classic"],
            year: 1813,
            rating: 4.8
      },
      9: {
            author: "Honoré de Balzac",
            title: "Le Père Goriot",
            reviews: {},
            genre: ["Realism", "Fiction"],
            year: 1835,
            rating: 4.0
      },
      10: {
            author: "Samuel Beckett",
            title: "Molloy, Malone Dies, The Unnamable, the trilogy",
            reviews: {},
            genre: ["Modernist", "Philosophical"],
            year: 1951,
            rating: 4.2
      }
};

/**
 * Book database helper functions
 */
const bookDatabase = {
      /**
       * Get all books
       * @returns {Promise<Object>} All books in the database
       */
      getAllBooks: () => {
            return new Promise((resolve) => {
                  setTimeout(() => resolve(books), 50); // Simulate async operation
            });
      },

      /**
       * Get book by ISBN
       * @param {string|number} isbn - The ISBN of the book
       * @returns {Promise<Object|null>} Book object or null if not found
       */
      getBookByISBN: (isbn) => {
            return new Promise((resolve, reject) => {
                  setTimeout(() => {
                        const book = books[isbn];
                        if (book) {
                              resolve(book);
                        } else {
                              reject(new Error(`Book with ISBN ${isbn} not found`));
                        }
                  }, 50);
            });
      },

      /**
       * Search books by author
       * @param {string} author - Author name to search for
       * @returns {Promise<Object>} Object containing matching books
       */
      searchByAuthor: (author) => {
            return new Promise((resolve) => {
                  setTimeout(() => {
                        const results = {};
                        for (const isbn in books) {
                              if (books[isbn].author.toLowerCase().includes(author.toLowerCase())) {
                                    results[isbn] = books[isbn];
                              }
                        }
                        resolve(results);
                  }, 50);
            });
      },

      /**
       * Search books by title
       * @param {string} title - Title to search for
       * @returns {Promise<Object>} Object containing matching books
       */
      searchByTitle: (title) => {
            return new Promise((resolve) => {
                  setTimeout(() => {
                        const results = {};
                        for (const isbn in books) {
                              if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
                                    results[isbn] = books[isbn];
                              }
                        }
                        resolve(results);
                  }, 50);
            });
      },

      /**
       * Add or update a book review
       * @param {string|number} isbn - The ISBN of the book
       * @param {string} username - Username of the reviewer
       * @param {string} review - Review content
       * @returns {Promise<Object>} Updated book object
       */
      addReview: (isbn, username, review) => {
            return new Promise((resolve, reject) => {
                  setTimeout(() => {
                        if (!books[isbn]) {
                              reject(new Error(`Book with ISBN ${isbn} not found`));
                              return;
                        }

                        books[isbn].reviews[username] = review;
                        resolve(books[isbn]);
                  }, 50);
            });
      },

      /**
       * Delete a book review
       * @param {string|number} isbn - The ISBN of the book
       * @param {string} username - Username of the reviewer
       * @returns {Promise<Object>} Updated book object
       */
      deleteReview: (isbn, username) => {
            return new Promise((resolve, reject) => {
                  setTimeout(() => {
                        if (!books[isbn]) {
                              reject(new Error(`Book with ISBN ${isbn} not found`));
                              return;
                        }

                        if (!books[isbn].reviews[username]) {
                              reject(new Error(`No review found for user ${username}`));
                              return;
                        }

                        delete books[isbn].reviews[username];
                        resolve(books[isbn]);
                  }, 50);
            });
      },

      /**
       * Get reviews for a book
       * @param {string|number} isbn - The ISBN of the book
       * @returns {Promise<Object>} Reviews object
       */
      getReviews: (isbn) => {
            return new Promise((resolve, reject) => {
                  setTimeout(() => {
                        if (!books[isbn]) {
                              reject(new Error(`Book with ISBN ${isbn} not found`));
                              return;
                        }

                        resolve(books[isbn].reviews);
                  }, 50);
            });
      }
};

module.exports = bookDatabase;