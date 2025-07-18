import { MESSAGES, HTTP_STATUS } from '../constants/watchlistConstants.js';
import { sanitizeWatchlistInput } from '../mappers/watchlistMappers.js';

/**
 * Validate required fields for creating a watchlist
 */
export function validateCreateWatchlist(req, res, next) {
  const sanitizedData = sanitizeWatchlistInput(req.body);
  
  if (!sanitizedData.id || !sanitizedData.name) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Missing required fields',
      message: MESSAGES.MISSING_REQUIRED_FIELDS
    });
  }

  // Attach sanitized data to request for use in route handler
  req.sanitizedBody = sanitizedData;
  next();
}

/**
 * Validate watchlist ID parameter
 */
export function validateWatchlistId(req, res, next) {
  const { id } = req.params;
  
  if (!id || id.trim() === '') {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Invalid watchlist ID',
      message: 'Watchlist ID is required and cannot be empty'
    });
  }

  req.params.id = id.trim();
  next();
}

/**
 * Validate bulk watchlists input
 */
export function validateBulkWatchlists(req, res, next) {
  const { watchlists } = req.body;

  if (!Array.isArray(watchlists)) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'Invalid input',
      message: MESSAGES.INVALID_BULK_INPUT
    });
  }

  // Sanitize all watchlists
  const sanitizedWatchlists = watchlists.map(sanitizeWatchlistInput);
  
  // Validate each watchlist has required fields
  for (let i = 0; i < sanitizedWatchlists.length; i++) {
    const watchlist = sanitizedWatchlists[i];
    if (!watchlist.id || !watchlist.name) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: 'Invalid watchlist data',
        message: `Watchlist at index ${i} is missing required fields (id or name)`
      });
    }
  }

  req.body.watchlists = sanitizedWatchlists;
  next();
}

/**
 * Validate update watchlist input (optional fields)
 */
export function validateUpdateWatchlist(req, res, next) {
  const { name, symbols, pinnedSymbols, isDefault } = req.body;
  
  // Check if at least one field is provided for update
  if (name === undefined && symbols === undefined && pinnedSymbols === undefined && isDefault === undefined) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: 'No update data provided',
      message: 'At least one field (name, symbols, pinnedSymbols, isDefault) must be provided for update'
    });
  }

  // Sanitize only the provided fields
  const sanitizedData = {};
  if (name !== undefined) sanitizedData.name = name?.toString().trim();
  if (symbols !== undefined) sanitizedData.symbols = Array.isArray(symbols) ? symbols : [];
  if (pinnedSymbols !== undefined) sanitizedData.pinnedSymbols = Array.isArray(pinnedSymbols) ? pinnedSymbols : [];
  if (isDefault !== undefined) sanitizedData.isDefault = Boolean(isDefault);

  req.sanitizedBody = sanitizedData;
  next();
} 