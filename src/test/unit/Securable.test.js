/* global describe,it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const uuid = require('uuid/v4')
const { Trait, traits } = require('mutrait')

const Securable = require('../../main/Securable')
const SimpleAction = require('../../main/PrimitiveAction')
const CommonPrincipal = require('../lib/CommonPrincipal')

const Identifiable = Trait(s => class extends s {
  constructor () {
    super(...arguments)
    this._id = uuid()
  }

  get id () {
    return this._id
  }

  identifies (that) {
    return this === that || (that && this.id === that.id)
  }
})

class SomeSecurable extends traits(Identifiable, Securable) {}
class SomePrincipal extends traits(Identifiable) {}

describe('Securable', () => {
  describe('static security', () => {
    it('should grant when permitted', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      s.grant(p1, a)
      expect(s.grants(p1, [a])).to.be.true()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
    })

    it('should deny when denied', () => {
      const p1 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      s.deny(p1, a)
      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.true()
    })

    it('should not grant by default', () => {
      const p1 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
    })

    it('should deny when denied even if permitted', () => {
      const p1 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      s.grant(p1, a)
      s.deny(p1, a)
      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.true()
    })

    it('should grant all principals an action', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
      s.grant(CommonPrincipal.ALL, a)
      expect(s.grants(p1, [a])).to.be.true()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.true()
      expect(s.denies(p2, [a])).to.be.false()
    })

    it('should grant a principal all actions', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      s.grant(p1, SimpleAction.ALL)
      expect(s.grants(p1, [a])).to.be.true()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
    })

    it('should grant all principal all actions', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
      s.grant(CommonPrincipal.ALL, SimpleAction.ALL)
      expect(s.grants(p1, [a])).to.be.true()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.true()
      expect(s.denies(p2, [a])).to.be.false()
    })

    it('should deny all principals an action', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
      s.deny(CommonPrincipal.ALL, a)
      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.true()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.true()
    })

    it('should deny a principal all actions', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      s.deny(p1, SimpleAction.ALL)
      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.true()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
    })

    it('should deny all principals all actions', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
      s.deny(CommonPrincipal.ALL, SimpleAction.ALL)
      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.true()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.true()
    })

    it('should deny a principal all actions even if permitted', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      s.grant(p1, a)
      s.deny(p1, SimpleAction.ALL)
      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.true()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
    })

    it('should deny all principals all actions even if permitted', () => {
      const p1 = new SomePrincipal()
      const p2 = new SomePrincipal()
      const s = new SomeSecurable()
      const a = SimpleAction.SECURE

      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.false()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.false()
      s.grant(CommonPrincipal.ALL, a)
      s.deny(CommonPrincipal.ALL, SimpleAction.ALL)
      expect(s.grants(p1, [a])).to.be.false()
      expect(s.denies(p1, [a])).to.be.true()
      expect(s.grants(p2, [a])).to.be.false()
      expect(s.denies(p2, [a])).to.be.true()
    })
  })

  describe('dynamic security', () => {
    class Account extends traits(Identifiable, Securable) {
      constructor (initialBalance) {
        super(...arguments)
        this.balance = initialBalance
      }
    }

    class Teller extends traits(Identifiable) {}
    class Manager extends traits(Identifiable) {}

    class ManagersCanEditButTellersCanOnlyReadHighValueAccounts {
      constructor (threshold) {
        this.threshold = threshold
        this._deniedActions = [SimpleAction.UPDATE, SimpleAction.DELETE, SimpleAction.SECURE]
      }

      grants (principal) {
        if (principal instanceof Manager) return true
        if (principal instanceof Teller) return true
        return false
      }

      denies (principal, actions, account) {
        if (principal instanceof Teller) {
          actions = actions || []
          return account.balance >= this.threshold &&
            actions.some(it => this._deniedActions.includes(it))
        }
        return false
      }
    }

    it('should deny algorithmically', () => {
      const threshold = 10000
      const strategy = new ManagersCanEditButTellersCanOnlyReadHighValueAccounts(threshold)
      const lo = new Account(threshold - 1)
      const hi = new Account(threshold + 1)
      const teller = new Teller()
      const manager = new Manager()

      lo.secureWith(strategy)
      hi.secureWith(strategy)

      expect(lo.grants(teller, SimpleAction.instanceActions())).to.be.true()
      expect(lo.denies(teller, SimpleAction.instanceActions())).to.be.false()
      expect(hi.grants(teller, SimpleAction.instanceActions())).to.be.false()
      expect(hi.denies(teller, SimpleAction.instanceActions())).to.be.true()

      expect(lo.grants(manager, SimpleAction.instanceActions())).to.be.true()
      expect(lo.denies(manager, SimpleAction.instanceActions())).to.be.false()
      expect(hi.grants(manager, SimpleAction.instanceActions())).to.be.true()
      expect(hi.denies(manager, SimpleAction.instanceActions())).to.be.false()
    })
  })
})
