import { mapWatchlistFromDb, mapWatchlistsFromDb, mapWatchlistToDb } from '../mappers/watchlistMappers.js';

export class WatchlistService {
  constructor(dbService) {
    this.dbService = dbService;
  }

  /**
   * Get all watchlists from database
   * @returns {Promise<Array>} Array of watchlist objects
   */
  async getAllWatchlists() {
    const result = await this.dbService.query(
      'SELECT * FROM watchlists ORDER BY created_at ASC'
    );
    return mapWatchlistsFromDb(result.rows);
  }

  /**
   * Get a specific watchlist by ID
   * @param {string} id - Watchlist ID
   * @returns {Promise<Object|null>} Watchlist object or null if not found
   */
  async getWatchlistById(id) {
    const result = await this.dbService.query(
      'SELECT * FROM watchlists WHERE id = $1',
      [id]
    );
    return result.rows.length > 0 ? mapWatchlistFromDb(result.rows[0]) : null;
  }

  /**
   * Create a new watchlist
   * @param {Object} watchlistData - Sanitized watchlist data
   * @returns {Promise<Object>} Created watchlist object
   */
  async createWatchlist(watchlistData) {
    const now = new Date();
    const { id, name, symbols, pinnedSymbols, isDefault } = watchlistData;

    await this.dbService.query(
      `INSERT INTO watchlists (id, name, symbols, pinned_symbols, created_at, updated_at, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, name, symbols, pinnedSymbols, now, now, isDefault]
    );

    return {
      id,
      name,
      symbols,
      pinnedSymbols,
      createdAt: now,
      updatedAt: now,
      isDefault
    };
  }

  /**
   * Update an existing watchlist
   * @param {string} id - Watchlist ID
   * @param {Object} updateData - Sanitized update data
   * @returns {Promise<Object|null>} Updated watchlist object or null if not found
   */
  async updateWatchlist(id, updateData) {
    // Check if watchlist exists
    const existingWatchlist = await this.getWatchlistById(id);
    if (!existingWatchlist) {
      return null;
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.entries(updateData).forEach(([key, value]) => {
      const dbKey = this._mapApiKeyToDbKey(key);
      updateFields.push(`${dbKey} = $${paramCount++}`);
      updateValues.push(value);
    });

    updateFields.push(`updated_at = $${paramCount++}`);
    updateValues.push(new Date());
    updateValues.push(id); // For WHERE clause

    await this.dbService.query(
      `UPDATE watchlists SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
      updateValues
    );

    // Return updated watchlist
    return await this.getWatchlistById(id);
  }

  /**
   * Delete a watchlist
   * @param {string} id - Watchlist ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteWatchlist(id) {
    const result = await this.dbService.query(
      'DELETE FROM watchlists WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * Bulk save watchlists (replace all existing watchlists)
   * @param {Array} watchlists - Array of watchlist objects
   * @returns {Promise<void>}
   */
  async bulkSaveWatchlists(watchlists) {
    await this.dbService.transaction(async (client) => {
      // Clear all existing watchlists
      await client.query('DELETE FROM watchlists');
      
      // Insert new watchlists
      for (const watchlist of watchlists) {
        await client.query(
          `INSERT INTO watchlists (id, name, symbols, pinned_symbols, created_at, updated_at, is_default) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (id) DO UPDATE SET
             name = EXCLUDED.name,
             symbols = EXCLUDED.symbols,
             pinned_symbols = EXCLUDED.pinned_symbols,
             updated_at = EXCLUDED.updated_at,
             is_default = EXCLUDED.is_default`,
          [
            watchlist.id,
            watchlist.name,
            watchlist.symbols || [],
            watchlist.pinnedSymbols || [],
            new Date(watchlist.createdAt),
            new Date(watchlist.updatedAt),
            watchlist.isDefault || false
          ]
        );
      }
    });
  }

  /**
   * Check if a watchlist exists
   * @param {string} id - Watchlist ID
   * @returns {Promise<boolean>} True if exists, false otherwise
   */
  async watchlistExists(id) {
    const result = await this.dbService.query(
      'SELECT 1 FROM watchlists WHERE id = $1 LIMIT 1',
      [id]
    );
    return result.rows.length > 0;
  }

  /**
   * Map API property names to database column names
   * @private
   */
  _mapApiKeyToDbKey(apiKey) {
    const mapping = {
      'name': 'name',
      'symbols': 'symbols',
      'pinnedSymbols': 'pinned_symbols',
      'isDefault': 'is_default'
    };
    return mapping[apiKey] || apiKey;
  }
} 