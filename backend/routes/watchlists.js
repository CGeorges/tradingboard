import express from 'express';

export function createWatchlistRoutes(dbService) {
  const router = express.Router();

  // Get all watchlists
  router.get('/', async (req, res) => {
    try {
      const result = await dbService.query(
        'SELECT * FROM watchlists ORDER BY created_at ASC'
      );

      const watchlists = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        symbols: row.symbols || [],
        pinnedSymbols: row.pinned_symbols || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isDefault: row.is_default || false
      }));

      console.log(`✅ Retrieved ${watchlists.length} watchlists`);
      res.json(watchlists);
    } catch (error) {
      console.error('❌ Error fetching watchlists:', error);
      res.status(500).json({
        error: 'Failed to fetch watchlists',
        message: error.message
      });
    }
  });

  // Get a specific watchlist by ID
  router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await dbService.query(
        'SELECT * FROM watchlists WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Watchlist not found',
          message: `Watchlist with ID ${id} does not exist`
        });
      }

      const row = result.rows[0];
      const watchlist = {
        id: row.id,
        name: row.name,
        symbols: row.symbols || [],
        pinnedSymbols: row.pinned_symbols || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isDefault: row.is_default || false
      };

      res.json(watchlist);
    } catch (error) {
      console.error('❌ Error fetching watchlist:', error);
      res.status(500).json({
        error: 'Failed to fetch watchlist',
        message: error.message
      });
    }
  });

  // Create a new watchlist
  router.post('/', async (req, res) => {
    try {
      const { id, name, symbols = [], pinnedSymbols = [], isDefault = false } = req.body;

      if (!id || !name) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Both id and name are required'
        });
      }

      const now = new Date();
      await dbService.query(
        `INSERT INTO watchlists (id, name, symbols, pinned_symbols, created_at, updated_at, is_default) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [id, name, symbols, pinnedSymbols, now, now, isDefault]
      );

      const watchlist = {
        id,
        name,
        symbols,
        pinnedSymbols,
        createdAt: now,
        updatedAt: now,
        isDefault
      };

      console.log(`✅ Created watchlist: ${id}`);
      res.status(201).json(watchlist);
    } catch (error) {
      console.error('❌ Error creating watchlist:', error);
      if (error.code === '23505') { // PostgreSQL unique violation
        res.status(409).json({
          error: 'Watchlist already exists',
          message: `Watchlist with ID ${req.body.id} already exists`
        });
      } else {
        res.status(500).json({
          error: 'Failed to create watchlist',
          message: error.message
        });
      }
    }
  });

  // Update an existing watchlist
  router.put('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, symbols, pinnedSymbols, isDefault } = req.body;

      // Check if watchlist exists
      const existingResult = await dbService.query(
        'SELECT * FROM watchlists WHERE id = $1',
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          error: 'Watchlist not found',
          message: `Watchlist with ID ${id} does not exist`
        });
      }

      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (name !== undefined) {
        updateFields.push(`name = $${paramCount++}`);
        updateValues.push(name);
      }
      if (symbols !== undefined) {
        updateFields.push(`symbols = $${paramCount++}`);
        updateValues.push(symbols);
      }
      if (pinnedSymbols !== undefined) {
        updateFields.push(`pinned_symbols = $${paramCount++}`);
        updateValues.push(pinnedSymbols);
      }
      if (isDefault !== undefined) {
        updateFields.push(`is_default = $${paramCount++}`);
        updateValues.push(isDefault);
      }

      updateFields.push(`updated_at = $${paramCount++}`);
      updateValues.push(new Date());
      updateValues.push(id); // For WHERE clause

      await dbService.query(
        `UPDATE watchlists SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        updateValues
      );

      // Fetch updated watchlist
      const result = await dbService.query(
        'SELECT * FROM watchlists WHERE id = $1',
        [id]
      );

      const row = result.rows[0];
      const watchlist = {
        id: row.id,
        name: row.name,
        symbols: row.symbols || [],
        pinnedSymbols: row.pinned_symbols || [],
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        isDefault: row.is_default || false
      };

      console.log(`✅ Updated watchlist: ${id}`);
      res.json(watchlist);
    } catch (error) {
      console.error('❌ Error updating watchlist:', error);
      res.status(500).json({
        error: 'Failed to update watchlist',
        message: error.message
      });
    }
  });

  // Delete a watchlist
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;

      const result = await dbService.query(
        'DELETE FROM watchlists WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: 'Watchlist not found',
          message: `Watchlist with ID ${id} does not exist`
        });
      }

      console.log(`✅ Deleted watchlist: ${id}`);
      res.json({
        success: true,
        message: `Watchlist ${id} deleted successfully`
      });
    } catch (error) {
      console.error('❌ Error deleting watchlist:', error);
      res.status(500).json({
        error: 'Failed to delete watchlist',
        message: error.message
      });
    }
  });

  // Bulk save watchlists (replace all non-default watchlists)
  router.post('/bulk', async (req, res) => {
    try {
      const { watchlists } = req.body;

      if (!Array.isArray(watchlists)) {
        return res.status(400).json({
          error: 'Invalid input',
          message: 'Expected an array of watchlists'
        });
      }

      await dbService.transaction(async (client) => {
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

      console.log(`✅ Bulk saved ${watchlists.length} watchlists`);
      res.json({
        success: true,
        message: `${watchlists.length} watchlists saved successfully`
      });
    } catch (error) {
      console.error('❌ Error bulk saving watchlists:', error);
      res.status(500).json({
        error: 'Failed to bulk save watchlists',
        message: error.message
      });
    }
  });

  return router;
} 