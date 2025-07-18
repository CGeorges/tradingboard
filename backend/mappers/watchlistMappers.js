/**
 * Transform database row to API watchlist object
 * @param {Object} row - Database row from PostgreSQL
 * @returns {Object} - Formatted watchlist object for API response
 */
export function mapWatchlistFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    symbols: row.symbols || [],
    pinnedSymbols: row.pinned_symbols || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDefault: row.is_default || false
  };
}

/**
 * Transform API watchlist object to database format
 * @param {Object} watchlist - Watchlist object from API request
 * @returns {Object} - Formatted object for database insertion
 */
export function mapWatchlistToDb(watchlist) {
  return {
    id: watchlist.id,
    name: watchlist.name,
    symbols: watchlist.symbols || [],
    pinned_symbols: watchlist.pinnedSymbols || [],
    created_at: watchlist.createdAt || new Date(),
    updated_at: watchlist.updatedAt || new Date(),
    is_default: watchlist.isDefault || false
  };
}

/**
 * Sanitize and validate watchlist input data
 * @param {Object} data - Raw input data from request
 * @returns {Object} - Sanitized watchlist data
 */
export function sanitizeWatchlistInput(data) {
  return {
    id: data.id?.toString().trim(),
    name: data.name?.toString().trim(),
    symbols: Array.isArray(data.symbols) ? data.symbols : [],
    pinnedSymbols: Array.isArray(data.pinnedSymbols) ? data.pinnedSymbols : [],
    isDefault: Boolean(data.isDefault)
  };
}

/**
 * Transform multiple database rows to API watchlist objects
 * @param {Array} rows - Array of database rows
 * @returns {Array} - Array of formatted watchlist objects
 */
export function mapWatchlistsFromDb(rows) {
  return rows.map(mapWatchlistFromDb);
} 