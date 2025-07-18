import express from 'express';
import { WatchlistService } from '../services/watchlistService.js';
import { 
  validateCreateWatchlist, 
  validateWatchlistId, 
  validateBulkWatchlists, 
  validateUpdateWatchlist 
} from '../middleware/watchlistValidation.js';
import { handleError, handleSuccess, handleNotFound } from '../utils/errorHandler.js';
import { MESSAGES, HTTP_STATUS } from '../constants/watchlistConstants.js';

export function createWatchlistRoutes(dbService) {
  const router = express.Router();
  const watchlistService = new WatchlistService(dbService);

  // Get all watchlists
  router.get('/', async (req, res) => {
    try {
      const watchlists = await watchlistService.getAllWatchlists();
      handleSuccess(res, watchlists, MESSAGES.OPERATIONS.FETCH_WATCHLISTS);
    } catch (error) {
      handleError(res, error, MESSAGES.OPERATIONS.FETCH_WATCHLISTS);
    }
  });

  // Get a specific watchlist by ID
  router.get('/:id', validateWatchlistId, async (req, res) => {
    try {
      const { id } = req.params;
      const watchlist = await watchlistService.getWatchlistById(id);
      
      if (!watchlist) {
        return handleNotFound(res, 'watchlist', id);
      }

      handleSuccess(res, watchlist, MESSAGES.OPERATIONS.FETCH_WATCHLIST, id);
    } catch (error) {
      handleError(res, error, MESSAGES.OPERATIONS.FETCH_WATCHLIST, req.params.id);
    }
  });

  // Create a new watchlist
  router.post('/', validateCreateWatchlist, async (req, res) => {
    try {
      const watchlist = await watchlistService.createWatchlist(req.sanitizedBody);
      handleSuccess(res, watchlist, MESSAGES.OPERATIONS.CREATE_WATCHLIST, watchlist.id, HTTP_STATUS.CREATED);
    } catch (error) {
      handleError(res, error, MESSAGES.OPERATIONS.CREATE_WATCHLIST, req.sanitizedBody?.id);
    }
  });

  // Update an existing watchlist
  router.put('/:id', validateWatchlistId, validateUpdateWatchlist, async (req, res) => {
    try {
      const { id } = req.params;
      const updatedWatchlist = await watchlistService.updateWatchlist(id, req.sanitizedBody);
      
      if (!updatedWatchlist) {
        return handleNotFound(res, 'watchlist', id);
      }

      handleSuccess(res, updatedWatchlist, MESSAGES.OPERATIONS.UPDATE_WATCHLIST, id);
    } catch (error) {
      handleError(res, error, MESSAGES.OPERATIONS.UPDATE_WATCHLIST, req.params.id);
    }
  });

  // Delete a watchlist
  router.delete('/:id', validateWatchlistId, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await watchlistService.deleteWatchlist(id);
      
      if (!deleted) {
        return handleNotFound(res, 'watchlist', id);
      }

      const successData = {
        success: true,
        message: MESSAGES.WATCHLIST_DELETED(id)
      };
      
      handleSuccess(res, successData, MESSAGES.OPERATIONS.DELETE_WATCHLIST, id);
    } catch (error) {
      handleError(res, error, MESSAGES.OPERATIONS.DELETE_WATCHLIST, req.params.id);
    }
  });

  // Bulk save watchlists (replace all non-default watchlists)
  router.post('/bulk', validateBulkWatchlists, async (req, res) => {
    try {
      const { watchlists } = req.body;
      await watchlistService.bulkSaveWatchlists(watchlists);
      
      const successData = {
        success: true,
        message: MESSAGES.BULK_SAVED(watchlists.length)
      };
      
      handleSuccess(res, successData, MESSAGES.OPERATIONS.BULK_SAVE_WATCHLISTS);
    } catch (error) {
      handleError(res, error, MESSAGES.OPERATIONS.BULK_SAVE_WATCHLISTS);
    }
  });

  return router;
} 