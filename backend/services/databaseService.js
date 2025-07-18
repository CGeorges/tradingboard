import pkg from 'pg';
const { Pool } = pkg;

export class DatabaseService {
  constructor() {
    this.pool = null;
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'tradingboard',
      user: process.env.DB_USER || 'tradingboard_user',
      password: process.env.DB_PASSWORD || 'tradingboard_password',
    };
  }

  async initializePool() {
    if (this.pool) {
      return this.pool;
    }

    try {
      this.pool = new Pool({
        host: this.config.host,
        port: this.config.port,
        database: this.config.database,
        user: this.config.user,
        password: this.config.password,
        max: 20, // Maximum number of clients in the pool
        idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
        connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
        statement_timeout: 30000, // Abort any statement that takes more than 30 seconds
        query_timeout: 30000, // Abort any query that takes more than 30 seconds
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('🔄 PostgreSQL connection pool initialized successfully');
      return this.pool;
    } catch (error) {
      console.error('❌ Failed to initialize PostgreSQL connection pool:', error);
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async getClient() {
    const pool = await this.initializePool();
    return pool.connect();
  }

  async query(text, params) {
    const pool = await this.initializePool();
    
    try {
      const start = Date.now();
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow query detected (${duration}ms):`, text.substring(0, 100));
      }
      
      return result;
    } catch (error) {
      console.error('❌ Database query error:', {
        query: text.substring(0, 100),
        params,
        error: error.message
      });
      throw error;
    }
  }

  async transaction(callback) {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async healthCheck() {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows.length === 1 && result.rows[0].health === 1;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  async close() {
    if (this.pool) {
      console.log('🔄 Closing PostgreSQL connection pool...');
      await this.pool.end();
      this.pool = null;
      console.log('✅ PostgreSQL connection pool closed');
    }
  }

  // Utility method to escape identifiers
  escapeIdentifier(identifier) {
    return '"' + identifier.replace(/"/g, '""') + '"';
  }

  // Utility method to handle array parameters for PostgreSQL
  formatArray(array) {
    return `{${array.map(item => `"${item.replace(/"/g, '\\"')}"`).join(',')}}`;
  }
} 