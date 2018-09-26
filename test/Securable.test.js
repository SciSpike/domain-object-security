/* global describe,it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const Securable = require('../lib/Securable')
const { traits } = require('mutrait')
const SimpleAction = require('../lib/SimpleAction')

class S extends traits(Securable) {
  constructor () {
    super(...arguments)
    this._id = new Date().getTime()
  }
}
class P {
  constructor () {
    this._id = new Date().getTime()
  }
}

describe('Securable', () => {
  it('should not permit by default', () => {
    const p = new P()
    const s = new S()

    expect(s.permits(p, [SimpleAction.SECURE])).to.equal(false)
    expect(s.denies(p, [SimpleAction.SECURE])).to.equal(false)
  })

  it('should permit when permitted', () => {
    const p = new P()
    const s = new S()

    expect(s.permits(p, [SimpleAction.SECURE])).to.equal(false)
    expect(s.denies(p, [SimpleAction.SECURE])).to.equal(false)
    s.permit(p, SimpleAction.SECURE)
    expect(s.permits(p, [SimpleAction.SECURE])).to.equal(true)
    expect(s.denies(p, [SimpleAction.SECURE])).to.equal(false)
  })

  it('should deny when denied', () => {
    const p = new P()
    const s = new S()

    expect(s.permits(p, [SimpleAction.SECURE])).to.equal(false)
    expect(s.denies(p, [SimpleAction.SECURE])).to.equal(false)
    s.deny(p, SimpleAction.SECURE)
    expect(s.permits(p, [SimpleAction.SECURE])).to.equal(false)
    expect(s.denies(p, [SimpleAction.SECURE])).to.equal(true)
  })

  it('should deny when denied even if permitted', () => {
    const p = new P()
    const s = new S()

    expect(s.permits(p, [SimpleAction.SECURE])).to.equal(false)
    expect(s.denies(p, [SimpleAction.SECURE])).to.equal(false)
    s.permit(p, SimpleAction.SECURE)
    s.deny(p, SimpleAction.SECURE)
    expect(s.permits(p, [SimpleAction.SECURE])).to.equal(false)
    expect(s.denies(p, [SimpleAction.SECURE])).to.equal(true)
  })
})
