'use strict'

const { Trait, traits } = require('mutrait')

const Defaults = require('./Defaults')
const { PERMIT, DENY } = require('./StaticAccessControlStrategy')
const Ace = require('./Ace').Class

const Acl = Trait(s => class extends s {
  constructor () {
    super(...arguments)
    this._aces = []
  }

  get entries () {
    return [...this._aces]
  }

  permits (principal, actions, securable, data) {
    let permitted = null
    for (const ace of this._aces) {
      if (ace.denies(principal, actions, securable, data)) return false
      if (ace.permits(principal, actions, securable, data)) permitted = true
    }
    return permitted || Defaults.permitOnAbstention
  }

  denies (principal, actions, securable, data) {
    for (const ace of this._aces) {
      if (ace.denies(principal, actions, securable, data)) return true
    }
    return false
  }

  permit (principal, securable, ...actions) {
    return this.secureWith(PERMIT, principal, securable, ...actions)
  }

  deny (principal, securable, ...actions) {
    return this.secureWith(DENY, principal, securable, ...actions)
  }

  secureWith (strategy, principal, securable, ...actions) {
    this._aces.push(Ace.securingWith(strategy, principal, securable, ...actions))
    return this
  }
})

Acl.Class = class extends traits(Acl) {}

module.exports = Acl
