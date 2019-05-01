'use strict'

const { Ace, Acl, PrimitiveAction, SamenessTester, StaticAccessControlStrategy } = require('@scispike/acl')

module.exports = {
  AuthorizationError: require('./AuthorizationError'),
  Securable: require('./Securable'),
  RoleTypeBasedObjectAccessControlRepository: require('./RoleTypeBasedObjectAccessControlRepository'),
  defaultStaticRbacPolicy: require('./default-static-rbac-policy'),
  Ace,
  Acl,
  PrimitiveAction,
  SamenessTester,
  StaticAccessControlStrategy
}
