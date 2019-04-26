/* global describe,it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect

const uuid = require('uuid/v4')
const { Trait, traits } = require('mutrait')

const Acl = require('../../main/Acl')

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

describe('Acl', () => {
  it('should work', function () {

  })
})
