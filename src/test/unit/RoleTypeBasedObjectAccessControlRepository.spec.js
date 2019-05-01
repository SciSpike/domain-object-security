/* global describe, it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const uuid = require('uuid/v4')

const RoleTypeBasedObjectAccessControlRepository = require('../../main/RoleTypeBasedObjectAccessControlRepository')

describe('unit tests of StaticRbacRepository', () => {
  it('should grant Admin', () => {
    const repo = new RoleTypeBasedObjectAccessControlRepository()
    const rcm = { role: ['Admin'], clazz: 'Foo', method: 'bar' }

    expect(repo.denies(rcm)).to.be.false()
    expect(repo.grants(rcm)).to.be.true()
  })

  it('should deny unknown role', () => {
    const policy = [
      {
        roles: /^Manager$/,
        classes: /^.*$/,
        methods: /^.*$/,
        strategy: true
      }
    ]
    const repo = new RoleTypeBasedObjectAccessControlRepository(policy)
    const rcm = { role: [uuid()], clazz: 'Foo', method: 'bar' }

    expect(repo.denies(rcm)).to.be.false()
    expect(repo.grants(rcm)).to.be.false()
  })

  it('should deny', () => {
    const clazz = 'Foo'
    const method = 'bar'
    const role = 'Cowboy'
    const repo = new RoleTypeBasedObjectAccessControlRepository([ {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: false
    } ])

    const rcm = { role: [role], clazz, method }

    expect(repo.denies(rcm)).to.be.true()
    expect(repo.grants(rcm)).to.be.false()
  })

  it('should deny with a single denial', () => {
    const clazz = 'Foo'
    const method = 'bar'
    const role = 'Cowboy'
    const repo = new RoleTypeBasedObjectAccessControlRepository([ {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: true
    }, {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: true
    }, {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^${role}$`),
      strategy: false
    } ])

    const rcm = { role: [role], clazz, method }

    expect(repo.denies(rcm)).to.be.true()
    expect(repo.grants(rcm)).to.be.false()
  })

  it('should work with custom strategy', () => {
    const clazz = 'Account'
    const method = 'close'
    const manager = 'Manager'
    const owner = 'Owner'
    const strategy = it => it?.role === manager || it?.role === owner

    const repo = new RoleTypeBasedObjectAccessControlRepository([ {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^.*$`),
      strategy
    } ])

    const rcm = { role: [manager, owner], clazz, method }

    expect(repo.denies(rcm)).to.be.false()
    expect(repo.grants(rcm)).to.be.true()

    expect(repo.denies({ role: 'TELLER', clazz, method })).to.be.false()
    expect(repo.grants({ role: 'TELLER', clazz, method })).to.be.false()
  })

  it('should work with crazy custom strategy', () => {
    const clazz = 'Account'
    const method = 'close'
    const manager = 'MANAGER'
    // Managers can only close accounts on even calendar days
    const strategy = it => it?.role === manager && it?.data?.dayOfMonth % 2 === 0

    const repo = new RoleTypeBasedObjectAccessControlRepository([ {
      classes: new RegExp(`^${clazz}$`),
      methods: new RegExp(`^${method}$`),
      roles: new RegExp(`^.*$`),
      strategy
    } ])

    let dayOfMonth = 1
    expect(repo.denies({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(repo.grants({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.false()

    expect(repo.denies({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(repo.grants({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()

    dayOfMonth = 2
    expect(repo.denies({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(repo.grants({ role: manager, clazz, method, data: { dayOfMonth } })).to.be.true()

    expect(repo.denies({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()
    expect(repo.grants({ role: 'TELLER', clazz, method, data: { dayOfMonth } })).to.be.false()
  })

  it('should grant when one role of many is granted', () => {
    const policy = [
      {
        roles: /^Manager$/,
        classes: /^.*$/,
        methods: /^.*$/,
        strategy: true
      },
      {
        roles: /^Teller$/,
        classes: /^Foo$/,
        methods: /^snafu$/,
        strategy: true
      }
    ]
    const repo = new RoleTypeBasedObjectAccessControlRepository(policy)
    const rcm = { role: ['Teller', 'Manager'], clazz: 'Foo', method: 'bar' }

    expect(repo.denies(rcm)).to.be.false()
    expect(repo.grants(rcm)).to.be.true()
  })

  it('should deny when a role among many is denied', () => {
    const policy = [
      {
        roles: /^Dummy$/,
        classes: /^.*$/,
        methods: /^.*$/,
        strategy: false
      },
      {
        roles: /^Teller$/,
        classes: /^Foo$/,
        methods: /^bar$/,
        strategy: true
      }
    ]
    const repo = new RoleTypeBasedObjectAccessControlRepository(policy)
    const rcm = { role: ['Teller', 'Dummy'], clazz: 'Foo', method: 'bar' }

    expect(repo.denies(rcm)).to.be.true()
    expect(repo.grants(rcm)).to.be.false()
  })
})
