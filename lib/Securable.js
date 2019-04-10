'use strict'

const { Trait } = require('mutrait')

const Acl = require('./Acl').Class

const Securable = Trait(s => class extends s {
  constructor () {
    super(...arguments)
    this._acl = new Acl()
  }

  grants (principal, actions, data) {
    return this._acl.grants(principal, actions, this, data)
  }

  denies (principal, actions, data) {
    return this._acl.denies(principal, actions, this, data)
  }

  grant (principal, ...actions) {
    this._acl.grant(principal, this, ...actions)
  }

  deny (principal, ...actions) {
    this._acl.deny(principal, this, ...actions)
  }

  secureWith (strategy, principal, ...actions) {
    this._acl.secureWith(strategy, principal, this, ...actions)
  }
})

module.exports = Securable
