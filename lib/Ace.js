'use strict'

const { Trait, traits, superclass } = require('mutrait')

const { Defaults } = require('./Defaults')
const { PERMIT, DENY } = require('./StaticAccessControlStrategy')
const Validatable = require('./Validatable')

const Ace = Trait(s => class extends superclass(s).expressing(Validatable) {
  static permitting (principal, securable, ...actions) {
    return create(PERMIT, principal, securable, ...actions)
  }

  static denying (principal, securable, ...actions) {
    return create(DENY, principal, securable, ...actions)
  }

  constructor () {
    super(...arguments)

    this._principal = null
    this._actions = []
    this._securable = null
    this._strategies = []
  }

  get principal () {
    return this._principal
  }

  set principal (value) {
    this._principal = this.checkPrincipal(value)
  }

  testPrincipal (value) {
    if (!value) return this._valueValidationError('principal', value, 'no principal given')
  }

  checkPrincipal (value) {
    const error = this.testPrincipal(value)
    if (error) throw error
    return value
  }

  withPrincipal (value) {
    this.principal = value
    return this
  }

  get actions () {
    return [...this._actions]
  }

  set actions (value) {
    this._actions = [...this.checkActions(value)]
  }

  testActions (value) {
    if (!value || !value.length) return this._valueValidationError('actions', value, 'no actions given')
  }

  checkActions (value) {
    const error = this.testActions(value)
    if (error) throw error
    return value
  }

  withActions (value) {
    this.actions = value
    return this
  }

  get securable () {
    return this._securable
  }

  set securable (value) {
    this._securable = this.checkSecurable(value)
  }

  testSecurable (value) {
    if (!value) return this._valueValidationError('securable', value, 'no securable given')
  }

  checkSecurable (value) {
    const error = this.testSecurable(value)
    if (error) throw error
    return value
  }

  withSecurable (value) {
    this.securable = value
    return this
  }

  get strategies () {
    return [...this._strategies]
  }

  set strategies (value) {
    this._strategies = [...(this.checkStrategies(value))]
  }

  testStrategies (value) {
    if (!value || !value.length) return this._valueValidationError('strategies', value, 'no strategies given')
  }

  checkStrategies (value) {
    const error = this.testStrategies(value)
    if (error) throw error
    return value
  }

  withStrategies (value) {
    this.strategies = value
    return this
  }

  addStrategies (...strategies) {
    this._strategies.push(...strategies)
  }

  permits (principal, actions, securable, data) {
    if (!equals(this._principal, principal)) return false
    if (!equals(this._securable, securable)) return false
    if (!(actions || []).every(it => this._actions.includes(it))) return false

    if (this.denies(principal, actions, securable, data)) return false

    let permitted = null
    for (const strategy of this._strategies) {
      if (strategy.permits(principal, actions, securable, data)) permitted = true
    }
    return permitted || Defaults.permitOnAbstention
  }

  denies (principal, actions, securable, data) {
    if (!equals(this._principal, principal)) return false
    if (!equals(this._securable, securable)) return false
    if (!(actions || []).every(it => this._actions.includes(it))) return false

    for (const strategy of this._strategies) {
      if (strategy.denies(principal, actions, securable, data)) return true
    }
    return false
  }
})

const equals = (that, other) => {
  return that === other || ((typeof that.equals === 'function') && that.equals(other))
}

const create = (strategy, principal, securable, ...actions) => {
  const ace = new Ace.Class()

  ace.principal = principal
  ace.actions = actions
  ace.securable = securable
  ace.addStrategies(strategy)

  return ace
}

Ace.Class = class extends traits(Ace) {
}

module.exports = Ace
