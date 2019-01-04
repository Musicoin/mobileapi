const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();
const constant = require('../../constant');

/**
 * all route controller extends BaseController
 */
class BaseController {

  constructor(props) {
    // constant var
    this.constant = constant;

    this.validate = this.validate.bind(this);
    this.error = this.error.bind(this);
    this.success = this.success.bind(this);
    this.reject = this.reject.bind(this);
  }

  /**
   * validate request params
   * @param {*} body 
   * @param {*} schema 
   */
  validate(body, schema) {
    return Validator.validate(body, schema);
  }

  /**
   * request error
   * @param {*} Response 
   * @param {*} error 
   */
  error(Response, error) {
    if (typeof error === "string") {
      this.log(`${this.TAG} error: ${error}`);
      Response.status(500).json({
        error: error
      })
    } else {
      this.log(`${this.TAG} error: `, error);
      Response.status(500).json({
        error: error.message
      })
    }
  }

  /**
   * request success
   * @param {*} Response 
   * @param {*} data 
   */
  success(Response, data) {
    Response.status(200).json(data)
  }

  /**
   * request rejest
   * @param {*} Response 
   * @param {*} error 
   */
  reject(Response, message) {
    this.log(`${this.TAG} bad request: ${message}`);
    Response.status(400).json({
      error: message
    })
  }

  log(message, ...params) {
    if (params) {
      console.log(message, ...params);
    } else {
      console.log(message);
    }
  }
}

module.exports = BaseController;