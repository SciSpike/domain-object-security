'use strict'

const DEFAULT_STATIC_RBAC_POLICY = require('./default-static-rbac-policy')

class RoleTypeBasedObjectAccessControlRepository {
  constructor (policy) {
    policy = policy || DEFAULT_STATIC_RBAC_POLICY
    this._policy = policy
  }

  grants ({ role, clazz, method, data }) {
    if (Array.isArray(role)) {
      return !role.map(it => this.denies({ role: it, clazz, method, data })).includes(true) &&
        role.map(it => this.grants({ role: it, clazz, method, data })).includes(true)
    }

    const entries = this._findEntries({ role, clazz, method })

    return !this._denies({ entries, role, clazz, method, data }) &&
      this._grants({ entries, role, clazz, method, data })
  }

  denies ({ role, clazz, method, data }) {
    if (Array.isArray(role)) {
      const results = role.map(it => this.denies({ role: it, clazz, method, data }))
      return results.includes(true)
    }

    return this._denies({
      role, clazz, method, data, entries: this._findEntries({ role, clazz, method })
    })
  }

  _grants ({ entries, role, clazz, method, data }) {
    return this._interrogate({ entries, role, clazz, method, data, grant: true })
  }

  _denies ({ entries, role, clazz, method, data }) {
    return this._interrogate({ entries, role, clazz, method, data, grant: false })
  }

  _interrogate ({ entries, role, clazz, method, data, grant }) {
    for (const it of entries) {
      if (typeof it.strategy === 'boolean' && it.strategy === grant) {
        return true
      }
      if (typeof it.strategy === 'function') {
        const granted = it.strategy({ role, clazz, method, data })
        if (grant && granted) return true
        if (!grant && !granted) return false
      }
    }
    return false
  }

  _findEntries ({ role, clazz, method }) {
    return this._policy.filter(it =>
      it?.roles.test(role) && it?.classes.test(clazz) && it?.methods.test(method)
    )
  }
}

module.exports = RoleTypeBasedObjectAccessControlRepository
