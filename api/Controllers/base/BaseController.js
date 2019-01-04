const ValidatorClass = require('fastest-validator');
const Validator = new ValidatorClass();

/**
 * all route controller extends BaseController
 */
class BaseController{

  constructor(props){
    this.validate = this.validate.bind(this);
    this.error = this.error.bind(this);
    this.success = this.success.bind(this);
    this.badRequest = this.badRequest.bind(this);
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
  error(Response, error){
    console.log(`${this.TAG} error: ${error.message}`);
    return Response.status(500).json({
      error: error.message
    })
  }

  /**
   * request success
   * @param {*} Response 
   * @param {*} data 
   */
  success(Response, data){
    return Response.status(200).json(data)
  }

  /**
   * request rejest
   * @param {*} Response 
   * @param {*} error 
   */
  badRequest(Response, error){
    console.log(`${this.TAG} bad request: ${error.message}`);
    return Response.status(400).json({
      error: error.message
    })
  }
}

module.exports = BaseController;