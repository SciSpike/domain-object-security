'use strict'

const VError = require('verror')

class AuthorizationError extends VError {
  constructor ({ principal, actions, data } = {}) {
    super({
      name: 'E_UNAUTHORIZED',
      info: {
        principal,
        actions,
        data
      }
    })
  }
}

module.exports = AuthorizationError
