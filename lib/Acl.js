'use strict'

const { Trait, traits } = require('mutrait')

const Defaults = require('./Defaults')
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
    return permitOrDeny(this, true, principal, securable, ...actions)
  }

  deny (principal, securable, ...actions) {
    return permitOrDeny(this, false, principal, securable, ...actions)
  }
})

const permitOrDeny = (acl, permit, principal, securable, ...actions) => {
  if (permit && acl.permits(principal, actions, securable)) return acl
  if (!permit && acl.denies(principal, actions, securable)) return acl

  acl._aces.push(permit
    ? Ace.permitting(principal, securable, ...actions)
    : Ace.denying(principal, securable, ...actions))

  return acl
}

Acl.Class = class extends traits(Acl) {}

module.exports = Acl
