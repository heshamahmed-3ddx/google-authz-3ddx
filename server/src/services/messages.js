/**
 * @file messages.js
 * @description Localization and message management service
 * @author InsightHub Development Team
 * @created 2025-10-20
 * @version 1.2.0
 * @copyright 2025 InsightHub. All rights reserved.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from '../config/config.js';

const __filename = 'messages.js';
const __dirname = 'messages_dir';

/**
 * Message cache for loaded languages
 */
const messageCache = new Map();

/**
 * Load messages for a specific language
 */
async function loadMessages(language = CONFIG.i18n.defaultLanguage) {
  if (messageCache.has(language)) {
    return messageCache.get(language);
  }

  try {
    const messagePath = path.join(CONFIG.i18n.messagesPath, `${language}.json`);
    const messageData = await fs.readFile(messagePath, 'utf8');
    const messages = JSON.parse(messageData);
    
    messageCache.set(language, messages);
    return messages;
  } catch (error) {
    // Failed to load messages for language, falling back to default
    
    if (language !== CONFIG.i18n.defaultLanguage) {
      return loadMessages(CONFIG.i18n.defaultLanguage);
    }
    
    // Fallback to empty object if default language fails
    return {};
  }
}

/**
 * Get a localized message by key path
 */
export async function getMessage(keyPath, language = CONFIG.i18n.defaultLanguage, params = {}) {
  const messages = await loadMessages(language);
  
  // Navigate through nested object using dot notation
  const message = keyPath.split('.').reduce((obj, key) => obj?.[key], messages);
  
  if (!message) {
    // Message not found for key in language, return key as fallback
    return keyPath; // Return key as fallback
  }

  // Replace parameters in message (e.g., {name} -> John)
  return Object.keys(params).reduce(
    (msg, param) => msg.replace(new RegExp(`{${param}}`, 'g'), params[param]),
    message
  );
}

/**
 * Get error message with details
 */
export async function getErrorMessage(errorCode, details = null, language = CONFIG.i18n.defaultLanguage) {
  const message = await getMessage(`errors.${errorCode}`, language);
  
  return {
    code: errorCode.toUpperCase(),
    http: getHttpStatusForError(errorCode),
    message,
    ...(details && { details })
  };
}

/**
 * Get success message
 */
export async function getSuccessMessage(successCode, language = CONFIG.i18n.defaultLanguage) {
  return await getMessage(`success.${successCode}`, language);
}

/**
 * Get validation message
 */
export async function getValidationMessage(validationCode, fieldName = '', language = CONFIG.i18n.defaultLanguage) {
  return await getMessage(`validation.${validationCode}`, language, { field: fieldName });
}

/**
 * Map error codes to HTTP status codes
 */
function getHttpStatusForError(errorCode) {
  const errorCodeMap = {
    auth_required: 401,
    unauthorized: 401,
    forbidden: 403,
    validation_error: 400,
    validation_required_fields: 400,
    validation_user_group_fields: 400,
    google_api_error: 500,
    internal_error: 500,
    user_rights_failed: 500,
    insufficient_scope_drive: 403,
    insufficient_scope_calendar: 403
  };

  return errorCodeMap[errorCode] || 500;
}

/**
 * Create standardized API response
 */
export async function createApiResponse(data, requestId = 'unknown', language = CONFIG.i18n.defaultLanguage) {
  return {
    data,
    requestId,
    timestamp: new Date().toISOString(),
    version: CONFIG.api.version
  };
}

/**
 * Create standardized error response
 */
export async function createErrorResponse(errorCode, details = null, requestId = 'unknown', language = CONFIG.i18n.defaultLanguage) {
  const error = await getErrorMessage(errorCode, details, language);
  
  return {
    error,
    requestId,
    timestamp: new Date().toISOString(),
    version: CONFIG.api.version
  };
}

/**
 * Preload all supported languages
 */
export async function preloadMessages() {
  const promises = CONFIG.i18n.supportedLanguages.map(lang => loadMessages(lang));
  await Promise.allSettled(promises);
  // Messages preloaded for all supported languages
}

/**
 * Clear message cache (useful for hot reloading in development)
 */
export function clearMessageCache() {
  messageCache.clear();
}

export default {
  getMessage,
  getErrorMessage,
  getSuccessMessage,
  getValidationMessage,
  createApiResponse,
  createErrorResponse,
  preloadMessages,
  clearMessageCache
};