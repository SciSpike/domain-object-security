'use strict'

const { Ace, Acl, PrimitiveAction, SamenessTester, StaticAccessControlStrategy } = require('@scispike/acl')

module.exports = {
  AuthorizationError: require('./AuthorizationError'),
  Securable: require('./Securable'),
  Ace,
  Acl,
  PrimitiveAction,
  SamenessTester,
  StaticAccessControlStrategy
}
