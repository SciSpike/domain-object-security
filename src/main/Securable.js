'use strict'

const { Trait } = require('mutrait')

const { Acl, StaticAccessControlStrategy, PrimitiveAction } = require('@scispike/acl')
const GRANT = StaticAccessControlStrategy.GRANT
const DENY = StaticAccessControlStrategy.DENY
const SECURE = PrimitiveAction.SECURE

const AuthorizationError = require('./AuthorizationError')

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
  grants ({ principals, actions, data }) {
    return !this.secured || this._acl.grants({ principals, actions, securable: this, data })
  }

  /**
   * Determines whether the given principal is explicitly denied the ability to take any of the given actions against this securable.
   */
  denies ({ principals, actions, data }) {
    return this.secured && this._acl.denies({ principals, actions, securable: this, data })
  }

  /**
   * Cause this securable to grant to the given principal the given action.
   *
   * Note: The principal must already be granted the right to secure this securable, unless this securable is not yet secured.
   */
  grant ({ principal, action, securor }) {
    return this.secure({ principal, action, strategy: GRANT, securor })
  }

  /**
   * Cause this securable to no longer grant to the given principal the given action.
   *
   * Note: The securor must already be granted the right to secure this securable, unless this securable is not yet secured.
   */
  ungrant ({ principal, action, securor }) {
    return this.unsecure({ principal, action, strategy: GRANT, securor })
  }

  /**
   * Cause this securable to explicitly deny from the given principal the ability to take given action.
   *
   * Note: The securor must already be granted the right to secure this securable, unless this securable is not yet secured.
   */
  deny ({ principal, action, securor }) {
    return this.secure({ principal, action, strategy: DENY, securor })
  }

  /**
   * Cause this securable to no longer explicitly deny from the given principal the ability to take given action.
   *
   * Note: The securor must already be granted the right to secure this securable, unless this securable is not yet secured.
   */
  undeny ({ principal, action, securor }) {
    if (!this.secured) return this

    return this.unsecure({ principal, action, strategy: DENY, securor })
  }

  /**
   * Cause this securable to secure itself with the given security strategy to be used with the given principal for the given action.
   *
   * Note: The securor must already be granted the right to secure this securable, unless this securable is not yet secured.
   */
  secure ({ strategy, principal, action, securor }) {
    return this._secure({ strategy, principal, action, securor, add: true })
  }

  /**
   * Cause this securable to no longer secure itself with the given security strategy with the given principal for the given action.
   *
   * Note: The securor must already be granted the right to secure this securable, unless this securable is not yet secured.
   */
  unsecure ({ strategy, principal, action, securor }) {
    if (!this.secured) return this

    return this._secure({ strategy, principal, action, securor, add: false })
  }

  _secure ({ strategy, principal, action, securor = null, add = true }) {
    if (!this.secured) {
      this._ensureAcl()._secure({ strategy: GRANT, principal: securor || principal, action: SECURE, add: true })
    } else {
      this._authorizeSecurabilityBy(securor || principal)
    }
    this._acl._secure({ strategy, principal, action, add })

    return this
  }

  _ensureAcl () {
    return (this._acl = this._acl || new Acl())
  }

  _authorizeSecurabilityBy (principal) {
    if (this.secured && !this.grants({ principals: principal, actions: SECURE })) {
      throw new AuthorizationError({ principal, action: SECURE })
    }
  }
})

module.exports = Securable
