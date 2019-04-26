/* global describe,it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const uuid = require('uuid/v4')
const { Trait, traits } = require('mutrait')

const Ace = require('../lib/Ace')

const Identifiable = Trait(s => class extends s {
  constructor () {
    super(...arguments)
    this._id = uuid()
  }

  get id () {
    return this._id
  }

  set id (id) {
    this._id = id
  }

  identifies (that) {
    return this === that || (that && this.id === that.id)
  }
})

class Principal extends traits(Identifiable) {
  constructor (id) {
    super(...arguments)
    this.id = id
  }
}

describe('Ace', () => {
  it('should work with grant', function () {
    const principal = new Principal()
    const action = uuid()
    const ace = Ace.granting({ principal, action })
    expect(ace.grants({ principal, action })).to.equal(true)
    expect(ace.grants({ principal, action: uuid() })).to.equal(false)
    expect(ace.denies({ principal, action })).to.equal(false)
    expect(ace.denies({ principal, action: uuid() })).to.equal(false)
  })

  it('should work with deny', function () {
    const principal = new Principal()
    const action = uuid()
    const ace = Ace.denying({ principal, action })
    expect(ace.denies({ principal, action })).to.equal(true)
    expect(ace.denies({ principal, action: uuid() })).to.equal(false)
    expect(ace.grants({ principal, action })).to.equal(false)
    expect(ace.grants({ principal, action: uuid() })).to.equal(false)
  })

  it('should work with a custom strategy', function () {
    const sally = 'sally'
    const john = 'john'
    const felix = 'felix'
    const jan = 'jan'
    const close = 'close'

    const strategy = {
      grants: ({ principal, action, securable, data }) => {
        switch (action) {
          case close:
            switch (principal) {
              case sally: return true
              case john: return securable.balance < data.hiThreshold
              default: return securable.balance < data.loThreshold
            }
        }
      },
      denies: ({ principal, action }) => {
        switch (action) {
          case close:
            switch (principal) {
              case felix: return true
              default: return false
            }
        }
      }
    }

    const hiThreshold = 10000
    const loThreshold = 100
    const data = { hiThreshold, loThreshold }

    const hiAccount = { balance: hiThreshold + 1 }
    const medAccount = { balance: hiThreshold - 1 }
    const loAccount = { balance: loThreshold - 1 }

    const hi = Ace.of({ securable: hiAccount, strategy })
    const med = Ace.of({ securable: medAccount, strategy })
    const lo = Ace.of({ securable: loAccount, strategy })

    expect(hi.grants({ principal: sally, action: close, securable: hiAccount, data })).to.equal(true)
    expect(hi.denies({ principal: sally, action: close, securable: hiAccount, data })).to.equal(false)

    expect(med.grants({ principal: sally, action: close, securable: medAccount, data })).to.equal(true)
    expect(med.denies({ principal: sally, action: close, securable: medAccount, data })).to.equal(false)

    expect(lo.grants({ principal: sally, action: close, securable: loAccount, data })).to.equal(true)
    expect(lo.denies({ principal: sally, action: close, securable: loAccount, data })).to.equal(false)

    expect(hi.grants({ principal: john, action: close, securable: hiAccount, data })).to.equal(false)
    expect(hi.denies({ principal: john, action: close, securable: hiAccount, data })).to.equal(false)

    expect(med.grants({ principal: john, action: close, securable: medAccount, data })).to.equal(true)
    expect(med.denies({ principal: john, action: close, securable: medAccount, data })).to.equal(false)

    expect(lo.grants({ principal: john, action: close, securable: loAccount, data })).to.equal(true)
    expect(lo.denies({ principal: john, action: close, securable: loAccount, data })).to.equal(false)

    expect(hi.grants({ principal: felix, action: close, securable: hiAccount, data })).to.equal(false)
    expect(hi.denies({ principal: felix, action: close, securable: hiAccount, data })).to.equal(true)

    expect(med.grants({ principal: felix, action: close, securable: medAccount, data })).to.equal(false)
    expect(med.denies({ principal: felix, action: close, securable: medAccount, data })).to.equal(true)

    expect(lo.grants({ principal: felix, action: close, securable: loAccount, data })).to.equal(false)
    expect(lo.denies({ principal: felix, action: close, securable: loAccount, data })).to.equal(true)

    expect(hi.grants({ principal: jan, action: close, securable: hiAccount, data })).to.equal(false)
    expect(hi.denies({ principal: jan, action: close, securable: hiAccount, data })).to.equal(false)

    expect(med.grants({ principal: jan, action: close, securable: medAccount, data })).to.equal(false)
    expect(med.denies({ principal: jan, action: close, securable: medAccount, data })).to.equal(false)

    expect(lo.grants({ principal: jan, action: close, securable: loAccount, data })).to.equal(true)
    expect(lo.denies({ principal: jan, action: close, securable: loAccount, data })).to.equal(false)
  })
})
