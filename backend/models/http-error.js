//I'm not sure that's a model, potentially move away
class HttpError extends Error {
  constructor(message, errorCode, actualError) {
    super(message);
    this.code = errorCode;
    console.log(actualError);
  }
}

module.exports = HttpError;
