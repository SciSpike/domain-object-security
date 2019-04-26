'use strict'

const { Trait } = require('mutrait')

const Acl = require('./Acl').Class
const AuthorizationError = require('./AuthorizationError')
const StaticAccessControlStrategy = require('./StaticAccessControlStrategy')
const GRANT = StaticAccessControlStrategy.GRANT
const DENY = StaticAccessControlStrategy.DENY
const PrimitiveAction = require('./PrimitiveAction')
const SECURE = PrimitiveAction.SECURE

const Securable = Trait(s => class extends s {
  /**
   * Returns whether or not this securable is currently secured.
   */
  get secured () {
    return !!this._acl
  }

  /**
   * Determines whether the given principal can take all of the given actions against this securable.
   */
  grants ({ principal, actions, data }) {
    return !this.secured || this._acl.grants({ principal, actions, data })
  }

  /**
   * Determines whether the given principal is explicitly denied the ability to take any of the given actions against this securable.
   */
  denies ({ principal, actions, data }) {
    return this.secured && this._acl.denies({ principal, actions, data })
  }

  /**
   * Cause this securable to grant to the given principal the given action.
   *
   * Note: The principal must already be granted the right to secure this securable.
   */
  grant ({ principal, action }) {
    return this.secure({ principal, action, strategy: GRANT })
  }

  /**
   * Cause this securable to no longer grant to the given principal the given action.
   *
   * Note: The principal must already be granted the right to secure this securable.
   */
  ungrant ({ principal, action }) {
    return this.unsecure({ principal, action, strategy: GRANT })
  }

  /**
   * Cause this securable to explicitly deny from the given principal the ability to take given action.
   *
   * Note: The principal must already be granted the right to secure this securable.
   */
  deny ({ principal, action }) {
    return this.secure({ principal, action, strategy: DENY })
  }

  /**
   * Cause this securable to no longer explicitly deny from the given principal the ability to take given action.
   *
   * Note: The principal must already be granted the right to secure this securable.
   */
  undeny ({ principal, action }) {
    return this.unsecure({ principal, action, strategy: DENY })
  }

  /**
   * Cause this securable to secure itself with the given security strategy to be used with the given principal for the given action.
   *
   * Note: The principal must already be granted the right to secure this securable.
   */
  secure ({ strategy, principal, action }) {
    return this._secure({ strategy, principal, action, add: true })
  }

  /**
   * Cause this securable to no longer secure itself with the given security strategy with the given principal for the given action.
   *
   * Note: The principal must already be granted the right to secure this securable.
   */
  unsecure ({ strategy, principal, actions }) {
    if (!this.secured) return this

    return this._secure({ strategy, principal, actions, add: false })
  }

  _secure ({ strategy, principal, actions, add = true }) {
    if (!this.secured) {
      this._ensureAcl()._secure({ strategy: GRANT, principal, action: SECURE, add: true })
    } else {
      this._authorizeSecurabilityBy(principal)
    }
    this._acl._secure({ strategy, principal, actions, add })

    return this
  }

  _ensureAcl () {
    return (this._acl = this._acl || new Acl())
  }

  _authorizeSecurabilityBy (principal) {
    if (this.secured && !this.grants(principal, SECURE)) {
      throw new AuthorizationError({ principal, action: SECURE })
    }
  }
})

module.exports = Securable
