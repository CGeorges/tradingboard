import { MESSAGES, HTTP_STATUS, DB_ERROR_CODES } from '../constants/watchlistConstants.js';

/**
 * Centralized error handler for watchlist operations
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} operation - Operation being performed
 * @param {string} [resourceId] - Optional resource ID for more specific error messages
 */
export function handleError(res, error, operation, resourceId = null) {
  console.error(`❌ Error ${operation}:`, error);

  // Handle specific database errors
  if (error.code === DB_ERROR_CODES.UNIQUE_VIOLATION) {
    return res.status(HTTP_STATUS.CONFLICT).json({
      error: 'Watchlist already exists',
      message: resourceId 
        ? MESSAGES.WATCHLIST_ALREADY_EXISTS(resourceId)
        : 'A watchlist with this ID already exists'
    });
  }

  // Handle validation errors (if thrown by service layer)
  if (error.name === 'ValidationError') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Validation Error',
      message: error.message
    });
  }

  // Handle not found errors
  if (error.name === 'NotFoundError') {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      error: 'Resource not found',
      message: error.message
    });
  }

  // Default server error
  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    error: `Failed to ${operation}`,
    message: error.message || 'An unexpected error occurred'
  });
}

/**
 * Handle not found resources
 * @param {Object} res - Express response object
 * @param {string} resourceType - Type of resource (e.g., 'watchlist')
 * @param {string} resourceId - ID of the resource
 */
export function handleNotFound(res, resourceType, resourceId) {
  const message = resourceType === 'watchlist' 
    ? MESSAGES.WATCHLIST_NOT_FOUND(resourceId)
    : `${resourceType} with ID ${resourceId} does not exist`;

  res.status(HTTP_STATUS.NOT_FOUND).json({
    error: `${resourceType.charAt(0).toUpperCase() + resourceType.slice(1)} not found`,
    message
  });
}

/**
 * Handle successful operations with consistent logging
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} operation - Operation performed
 * @param {string} [resourceId] - Optional resource ID
 * @param {number} [statusCode] - HTTP status code (defaults to 200)
 */
export function handleSuccess(res, data, operation, resourceId = null, statusCode = HTTP_STATUS.OK) {
  // Log success message
  const logMessage = getSuccessLogMessage(operation, resourceId, data);
  if (logMessage) {
    console.log(`✅ ${logMessage}`);
  }

  res.status(statusCode).json(data);
}

/**
 * Get appropriate success log message based on operation
 * @private
 */
function getSuccessLogMessage(operation, resourceId, data) {
  switch (operation) {
    case MESSAGES.OPERATIONS.FETCH_WATCHLISTS:
      return MESSAGES.WATCHLISTS_RETRIEVED(Array.isArray(data) ? data.length : 0);
    case MESSAGES.OPERATIONS.CREATE_WATCHLIST:
      return MESSAGES.WATCHLIST_CREATED(resourceId);
    case MESSAGES.OPERATIONS.UPDATE_WATCHLIST:
      return MESSAGES.WATCHLIST_UPDATED(resourceId);
    case MESSAGES.OPERATIONS.DELETE_WATCHLIST:
      return MESSAGES.WATCHLIST_DELETED(resourceId);
    case MESSAGES.OPERATIONS.BULK_SAVE_WATCHLISTS:
      return MESSAGES.BULK_SAVED(Array.isArray(data?.watchlists) ? data.watchlists.length : 0);
    default:
      return null;
  }
}

/**
 * Create custom error classes for better error handling
 */
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
} 