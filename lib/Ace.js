'use strict'

const StaticAccessControlStrategy = require('./StaticAccessControlStrategy')
const GRANT = StaticAccessControlStrategy.GRANT
const DENY = StaticAccessControlStrategy.DENY
const DEFAULT_SAMENESS_TESTER = require('./SamenessTester')

/**
 * An access control entry.
 */
class Ace {
  static granting ({ principal, securable, action, samenessTesterFn } = {}) {
    return Ace.of({ strategy: GRANT, principal, securable, action, samenessTesterFn })
  }

  static denying ({ principal, securable, action, samenessTesterFn } = {}) {
    return Ace.of({ strategy: DENY, principal, securable, action, samenessTesterFn })
  }

  static of ({ strategy, principal, securable, action, samenessTesterFn } = {}) {
    return new Ace({ strategy, principal, securable, action, samenessTesterFn })
  }

  constructor ({ strategy, principal, securable, action, samenessTesterFn = DEFAULT_SAMENESS_TESTER }) {
    this._principal = this._testSetPrincipal(principal)
    this._action = this._testSetAction(action)
    this._strategy = this._testSetStrategy(strategy)
    this._securable = this._testSetSecurable(securable)
    this._testSameness = samenessTesterFn
  }

  get principal () {
    return this._principal
  }

  _testSetPrincipal (principal) {
    return principal
  }

  get action () {
    return this._action
  }

  _testSetAction (action) {
    return action
  }

  get securable () {
    return this._securable
  }

  _testSetSecurable (securable) {
    return securable
  }

  get strategy () {
    return this._strategy
  }

  _testSetStrategy (strategy) {
    if (!strategy) throw new Error('no strategy given')
    return strategy
  }

  /**
   * Determines if this Ace applies to the given principal, securable, and action.
   * @private
   */
  _applies ({ principal, securable, action }) {
    return (
      this.hasSecurable(securable) &&
      this.hasAction(action) &&
      (!this._principal || this._testSameness(this._principal, principal))
    )
  }

  grants ({ principal, action, securable, data } = {}) {
    return (
      this._applies({ principal, securable, action }) &&
      !this._strategy.denies({ principal, action, securable, data }) &&
      this._strategy.grants({ principal, action, securable, data })
    )
  }

  denies ({ principal, action, securable, data } = {}) {
    return (
      this._applies({ principal, securable, action }) &&
      this._strategy.denies({ principal, action, securable, data })
    )
  }

  hasPrincipal (principal) {
    return !this._principal || this._testSameness(principal, this._principal)
  }

  hasAction (action) {
    return !this._action || this._testSameness(action, this._action)
  }

  hasSecurable (securable) {
    return !this._securable || this._testSameness(securable, this._securable)
  }

  hasStrategy (strategy) {
    return this._testSameness(strategy, this._strategy)
  }
}

module.exports = Ace
