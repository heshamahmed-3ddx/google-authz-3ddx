/**
 * @file database.js
 * @description MySQL database connection service with connection pooling
 * @author 3D Diagnostix Development Team
 * @created 2025-10-27
 * @version 1.0.0
 * @copyright 2025 3D Diagnostix, Inc. All rights reserved.
 */
import dotenv from 'dotenv';
dotenv.config();
import mysql from 'mysql2/promise';
import { createContextLogger } from './logger.js';

const logger = createContextLogger('DatabaseService', 'DatabaseService');

/**
 * Database configuration from environment variables
 */
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  // Timeout settings to prevent hanging connections
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT) || 10000, // 10 seconds to establish connection
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000, // 60 seconds to get connection from pool
  timeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000, // 30 seconds for query execution
  // Security and performance settings
  multipleStatements: false, // Prevent SQL injection
  dateStrings: true, // Return dates as strings for consistent formatting
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
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        database: dbConfig.database,
        connectionLimit: dbConfig.connectionLimit
      });

      pool = mysql.createPool(dbConfig);

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
    try {
      // Get connection from pool (timeout handled by acquireTimeout config)
      connection = await this.getPool().getConnection();
      
      logger.debug('Executing database query', {
        sql: sql.substring(0, 100) + (sql.length > 100 ? '...' : ''),
        paramsCount: params.length
      });

      // Execute query (timeout handled by timeout config)
      const [rows] = await connection.execute(sql, params);
      
      logger.debug('Query executed successfully', {
        rowCount: Array.isArray(rows) ? rows.length : 'N/A'
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
   * @param {Function} callback - Async function that receives connection
   * @returns {Promise<any>} Transaction result
   * @throws {Error} If transaction fails
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
