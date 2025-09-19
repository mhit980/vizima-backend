/**
 * Wraps an async function to handle errors in Express route handlers
 * @param {Function} fn - The async function to wrap
 * @returns {Function} A new function that handles errors properly
 */
module.exports = fn => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
