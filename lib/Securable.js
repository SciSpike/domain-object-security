'use strict'

const { Trait } = require('mutrait')

const Acl = require('./Acl').Class

const Securable = Trait(s => class extends s {
  constructor () {
    super(...arguments)
    this._acl = new Acl()
  }

  permits (principal, actions, data) {
    return this._acl.permits(principal, actions, this, data)
  }

  denies (principal, actions, data) {
    return this._acl.denies(principal, actions, this, data)
  }

  permit (principal, ...actions) {
    this._acl.permit(principal, this, ...actions)
  }

  deny (principal, ...actions) {
    this._acl.deny(principal, this, ...actions)
  }
})

module.exports = Securable
