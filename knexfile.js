/**
 * @file knexfile.cjs
 * @description Knex.js configuration for database migrations
 * @author 3D Diagnostix Development Team
 * @created 2026-01-21
 * @version 1.0.0
 */

const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from server/.env.development or server/.env
dotenv.config({ path: path.resolve(__dirname, 'server/.env.development') });
dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

/**
 * Base configuration shared across all environments
 */
const baseConfig = {
  client: 'mysql2',
  migrations: {
    directory: './database/migrations',
    tableName: 'knex_migrations',
    extension: 'cjs',
    loadExtensions: ['.cjs']
  },
  seeds: {
    directory: './database/seeds'
  },
  pool: {
    min: 2,
    max: 10,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  }
};

/**
 * Development environment configuration
 */
const development = {
  ...baseConfig,
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'insighthub_dev',
    charset: 'utf8mb4',
    timezone: 'UTC'
  },
  debug: false
};

/**
 * Test environment configuration
 */
const test = {
  ...baseConfig,
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME_TEST || 'insighthub_test',
    charset: 'utf8mb4',
    timezone: 'UTC'
  }
};

/**
 * Production environment configuration
 */
const production = {
  ...baseConfig,
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: 'utf8mb4',
    timezone: 'UTC',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  },
  pool: {
    min: 5,
    max: 20,
    acquireTimeoutMillis: 60000,
    idleTimeoutMillis: 30000
  }
};

/**
 * Export configuration based on NODE_ENV
 */
module.exports = {
  development,
  test,
  production
};
