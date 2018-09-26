'use strict'

const ApplicationError = require('./ApplicationError')

class ValueValidationError extends ApplicationError {
  /**
   * Thrown when a value being set would have been invalid.
   * @param type The class of the object
   * @param name The name of the field, property or parameter
   * @param value The offending value
   * @param [cause] The cause of the error, if any
   * @param [rest=[]] The remaining arguments, if any
   */
  constructor (type, name, value, cause, ...rest) {
    super(cause, ...rest)
    this.type = type
    this.name = name
    this.value = value
  }

  toString () {
    return `invalid value: type [${this.type && this.type.name}], name [${this.name}], value [${this.value}]`
  }
}

module.exports = ValueValidationError
