/**
 * @file database.js
 * @description MySQL database connection service with connection pooling
 * @author InsightHub Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 InsightHub. All rights reserved.
 */
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('DatabaseService', 'DatabaseService');

/**
 * Connection configuration object for MySQL connections
 * @typedef {Object} ConnectionConfig
 * @property {string} host - Database host address
 * @property {number} port - Database port number
 * @property {string} user - Database username
 * @property {string} password - Database password
 * @property {string} database - Database name
 * @property {number} connectTimeout - Connection timeout in milliseconds (default: 10000)
 * @property {boolean} enableKeepAlive - Enable keep-alive for connections
 * @property {number} keepAliveInitialDelay - Initial delay for keep-alive
 * @property {boolean} multipleStatements - Allow multiple statements (disabled for security)
 * @property {boolean} dateStrings - Return dates as strings instead of Date objects
 */

/**
 * Connection configuration (passed to each connection in the pool)
 * @type {ConnectionConfig}
 */
const connectionConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000, // 10 seconds to establish connection
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false, // Prevent SQL injection
  dateStrings: true, // Return dates as strings for consistent formatting
};

/**
 * Pool configuration object extending connection config with pool-specific options
 * @typedef {ConnectionConfig} PoolConfig
 * @property {boolean} waitForConnections - Wait for available connections when pool is full
 * @property {number} connectionLimit - Maximum number of connections in pool (default: 10)
 * @property {number} queueLimit - Maximum number of queued connection requests (0 = unlimited)
 */

/**
 * Pool configuration
 * mysql2 createPool() accepts both pool options and connection options in one object.
 * However, pool-specific options like acquireTimeout trigger warnings when passed to connections.
 * We'll create the pool with all options, but mysql2 will only use pool options for the pool.
 * @type {PoolConfig}
 */
const poolConfig = {
  ...connectionConfig,
  // Pool-specific options
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  // Note: acquireTimeout causes a warning but is necessary for pool configuration.
  // The default is 60000ms if not specified, so we can omit it to avoid the warning.
  // acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
};

/**
 * Connection pool instance
 * @type {mysql.Pool}
 */
let pool = null;

/**
 * Database Service Class
 * Provides MySQL connection pooling and query execution
 */
class DatabaseService {
  /**
   * Initialize database connection pool
   * @returns {Promise<mysql.Pool>} Connection pool instance
   * @throws {Error} If connection fails
   */
  async initialize() {
  // ...existing code...
    try {
      logger.info('Initializing database connection pool', {
        host: poolConfig.host,
        port: poolConfig.port,
        user: poolConfig.user,
        database: poolConfig.database,
        connectionLimit: poolConfig.connectionLimit,
        connectTimeout: poolConfig.connectTimeout,
        acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000
      });

      // Create pool without acquireTimeout to avoid warnings
      // mysql2 default acquireTimeout is 60000ms, which is usually sufficient
      pool = mysql.createPool(poolConfig);

      // Test connection
      const connection = await pool.getConnection();
      logger.info('Database connection status: SUCCESS', {
        threadId: connection.threadId
      });
      connection.release();

      return pool;
    } catch (error) {
      logger.error('Database connection status: FAILURE', {
        error: error.message,
        code: error.code,
        stack: error.stack
      });
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }

  /**
   * Check if database is initialized and available
   * @returns {boolean} True if database is available
   */
  isAvailable() {
    return pool !== null;
  }

  /**
   * Get connection pool instance
   * @returns {mysql.Pool} Connection pool
   * @throws {Error} If pool is not initialized
   */
  getPool() {
    if (!pool) {
      throw new Error('Database pool not initialized. Call initialize() first.');
    }
    return pool;
  }

  /**
   * Execute a parameterized query with automatic connection management
   * @param {string} sql - SQL query with placeholders
   * @param {Array} params - Query parameters
   * @returns {Promise<Array>} Query results
   * @throws {Error} If query fails
   */
  async query(sql, params = []) {
    let connection;
    const queryStartTime = process.hrtime();
    try {
      // Get connection from pool (timeout handled by acquireTimeout config)
      connection = await this.getPool().getConnection();
      
      logger.debug('Executing database query', {
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        paramsCount: params.length
      });

      // Execute query (connectTimeout handles connection establishment)
      const [rows] = await connection.execute(sql, params);
      
      // Calculate execution time
      const queryDuration = process.hrtime(queryStartTime);
      const queryDurationMs = queryDuration[0] * 1000 + queryDuration[1] / 1e6;
      
      // Log query execution with timing (info level for queries >100ms, debug otherwise)
      const logLevel = queryDurationMs > 100 ? 'info' : 'debug';
      logger[logLevel]('Database query executed', {
        duration: `${queryDurationMs.toFixed(2)}ms`,
        rowCount: Array.isArray(rows) ? rows.length : 'N/A',
        sql: sql.substring(0, 200) + (sql.length > 200 ? '...' : ''),
        paramsCount: params.length
      });

      return rows;
    } catch (error) {
      // Check if it's a timeout error
      const isTimeout = error.code === 'ETIMEDOUT' || 
                       error.errno === -60 || // ETIMEDOUT errno on macOS/Linux
                       error.message.includes('timeout') || 
                       error.message.includes('Timeout');
      
      logger.error('Database query failed', {
        error: error.message,
        code: error.code,
        errno: error.errno,
        isTimeout,
        sql: sql.substring(0, 200),
        paramsCount: params.length,
        stack: error.stack
      });
      
      // For timeout errors, provide more helpful error message
      if (isTimeout) {
        const timeoutError = new Error(`Database operation timed out. This may indicate network issues or database server overload. Original error: ${error.message}`);
        timeoutError.code = error.code || 'ETIMEDOUT';
        timeoutError.errno = error.errno;
        timeoutError.originalError = error;
        throw timeoutError;
      }
      
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  /**
   * Execute a transaction with automatic rollback on error
   * @param {Function} callback - Async function that receives connection and performs operations
   * @param {mysql.PoolConnection} callback.connection - Database connection for transaction
   * @returns {Promise<any>} Transaction result from callback
   * @throws {Error} If transaction fails (automatic rollback performed)
   * @example
   * await databaseService.transaction(async (connection) => {
   *   await connection.execute('INSERT INTO users ...', [name, email]);
   *   await connection.execute('INSERT INTO profiles ...', [userId, bio]);
   *   return { success: true };
   * });
   */
  async transaction(callback) {
    const connection = await this.getPool().getConnection();
    try {
      await connection.beginTransaction();
      logger.debug('Transaction started');

      const result = await callback(connection);

      await connection.commit();
      logger.debug('Transaction committed');

      return result;
    } catch (error) {
      await connection.rollback();
      logger.error('Transaction rolled back', {
        error: error.message,
        stack: error.stack
      });
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Test database connection health
   * @returns {Promise<boolean>} Connection status
   */
  async healthCheck() {
    try {
      const [rows] = await this.query('SELECT 1 as health');
      return rows[0]?.health === 1;
    } catch (error) {
      logger.error('Database health check failed', {
        error: error.message
      });
      return false;
    }
  }

  /**
   * Close all connections in the pool
   * @returns {Promise<void>}
   */
  async close() {
    if (pool) {
      logger.info('Closing database connection pool');
      await pool.end();
      pool = null;
      logger.info('Database connection pool closed');
    }
  }
}

// Export singleton instance
export default new DatabaseService();
