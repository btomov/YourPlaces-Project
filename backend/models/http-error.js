class HttpError extends Error {
  constructor(message, errorCode, actualError) {
    super(message);
    this.code = errorCode;
    console.log(actualError);
  }
}

module.exports = HttpError;
