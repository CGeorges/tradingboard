export const MESSAGES = {
  // Success messages
  WATCHLIST_CREATED: (id) => `Created watchlist: ${id}`,
  WATCHLIST_UPDATED: (id) => `Updated watchlist: ${id}`,
  WATCHLIST_DELETED: (id) => `Watchlist ${id} deleted successfully`,
  WATCHLISTS_RETRIEVED: (count) => `Retrieved ${count} watchlists`,
  BULK_SAVED: (count) => `${count} watchlists saved successfully`,

  // Error messages
  WATCHLIST_NOT_FOUND: (id) => `Watchlist with ID ${id} does not exist`,
  WATCHLIST_ALREADY_EXISTS: (id) => `Watchlist with ID ${id} already exists`,
  MISSING_REQUIRED_FIELDS: 'Both id and name are required',
  INVALID_BULK_INPUT: 'Expected an array of watchlists',

  // Operation descriptions
  OPERATIONS: {
    FETCH_WATCHLISTS: 'fetch watchlists',
    FETCH_WATCHLIST: 'fetch watchlist',
    CREATE_WATCHLIST: 'create watchlist',
    UPDATE_WATCHLIST: 'update watchlist',
    DELETE_WATCHLIST: 'delete watchlist',
    BULK_SAVE_WATCHLISTS: 'bulk save watchlists'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

export const DB_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505'
}; 