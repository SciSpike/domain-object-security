'use strict'

const { Trait, traits } = require('mutrait')

const { Defaults } = require('./Defaults')
const { PERMIT, DENY } = require('./StaticAccessControlStrategy')
const ValueValidationError = require('./ValueValidationError')
const ObjectValidationError = require('./ObjectValidationError')

const Ace = Trait(s => class extends s {
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
    this._actions = [...(this.checkActions(value))]
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

  permits (principal, actions, securable, ...data) {
    if (!this._principal.equals(principal)) return false
    if (!this._securable.equals(securable)) return false
    if (!(actions || []).every(it => this._actions.includes(it))) return false

    let permitted = null
    for (const strategy of this._strategies) {
      if (strategy.denies(principal, actions, securable, ...data)) return false
      if (strategy.permits(principal, actions, securable, ...data)) permitted = true
    }
    return permitted || Defaults.permitOnAbstention
  }

  denies (principal, actions, securable, ...data) {
    if (!this._principal.equals(principal)) return false
    if (!this._securable.equals(securable)) return false
    if (!actions.every(it => this._actions.includes(it))) return false

    for (const strategy of this._strategies) {
      if (strategy.denies(principal, actions, securable, ...data)) return true
    }
    return false
  }

  permit (principal, securable, ...actions) {
    return permitOrDeny(this, PERMIT, principal, securable, ...actions)
  }

  deny (principal, securable, ...actions) {
    return permitOrDeny(this, DENY, principal, securable, ...actions)
  }

  _valueValidationError (name, value, message) {
    return new ValueValidationError(Object.getPrototypeOf(this), name, value, null, message)
  }

  _objectValidationError (values, message) {
    return new ObjectValidationError(Object.getPrototypeOf(this), values, null, message)
  }
})

const permitOrDeny = (ace, strategy, principal, securable, ...actions) => {
  if (ace.denies(principal, securable, actions)) return ace

  ace._principal = principal
  ace._actions = [...actions]
  ace._securable = securable
  ace._strategies.push(strategy)

  return ace
}

Ace.Class = class extends traits(Ace) {}

module.exports = Ace
