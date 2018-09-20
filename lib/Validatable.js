'use strict'

const { Trait } = require('mutrait')

const ValueValidationError = require('./ValueValidationError')
const ObjectValidationError = require('./ObjectValidationError')

const Validatable = Trait(s => class extends s {
  _valueValidationError (name, value, message) {
    return new ValueValidationError(Object.getPrototypeOf(this), name, value, null, message)
  }

  _objectValidationError (values, message) {
    return new ObjectValidationError(Object.getPrototypeOf(this), values, null, message)
  }
})

module.exports = Validatable
