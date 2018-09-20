'use strict'

const ApplicationError = require('./ApplicationError')

class ObjectValidationError extends ApplicationError {
  /**
   * Thrown when this state of an object would have been invalid.
   * @param type The class of the object
   * @param [values={}] A literal object containing the offending values
   * @param [cause] The cause of the error, if any
   * @param [rest=[]] The remaining arguments, if any
   */
  constructor (type, values, cause, ...rest) {
    super(cause, ...rest)
    this.type = type
    this.values = values || {}
  }

  toString () {
    return `invalid object: type [${this.type && this.type.name}], values [${Object.entries(this.values).map(it => `${it[0]} [${it[1]}]`).join(',')}]`
  }
}
