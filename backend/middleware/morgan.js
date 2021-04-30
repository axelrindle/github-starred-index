// Require modules
const WritableStream = require('stream').Writable;
const morgan = require('morgan');
const { Logger } = require('../logger');

class PipeStream extends WritableStream {

  /**
   * @param {Logger} logger
   */
  constructor(logger) {
    super();

    /** @type {Logger} */
    this._logger = logger;
  }

  /**
   * @param {any} chunk
   * @param {BufferEncoding} _encoding
   * @param {(error?: Error | null) => void} callback
   */
  _write (chunk, _encoding, callback) {
    // trim ending newline
    chunk = chunk?.toString();
    if (typeof chunk === 'string' && chunk.endsWith('\n')) {
      chunk = chunk.replace(/\n$/, '');
    }

    this._logger.info(chunk);
    callback();
  }

}

/**
 * @param {Logger} logger
 */
module.exports = (logger) => {
    const format = process.env.HTTP_LOGGING_FORMAT || 'short';
    return morgan(format, {
        stream: new PipeStream(logger)
    });
};
