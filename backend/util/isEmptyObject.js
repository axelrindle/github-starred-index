/**
 * Tests whether an object is empty. Does not test for nested objects.
 *
 * @param {any} obj The object to test.
 * @returns {boolean}
 * @see https://stackoverflow.com/a/32108184/5423625
 */
module.exports = obj => !! obj && Object.keys(obj).length === 0 && obj.constructor === Object;
