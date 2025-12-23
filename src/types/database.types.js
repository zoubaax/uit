/**
 * Database type definitions (JavaScript version)
 * For TypeScript projects, use database.types.ts instead
 */

/**
 * @typedef {Object} Admin
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} created_at
 */

/**
 * @typedef {Object} Team
 * @property {string} id
 * @property {string} name
 * @property {string|null} description
 * @property {string} created_at
 */

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string} content
 * @property {string} team_id
 * @property {string|null} created_by - Admin ID or null for anonymous notes
 * @property {string} created_at
 * @property {string|null} category
 */

/**
 * @typedef {Object} WeeklyEvaluation
 * @property {string} id
 * @property {string} team_id
 * @property {number|null} rating - Rating from 1 to 5
 * @property {string|null} feedback
 * @property {string} week_start_date - Date in YYYY-MM-DD format
 * @property {string} created_at
 */

