# domain-object-security

This library allows you to secure your domain objects, so that you can ask questions like "Can Sally read Bob's account balance?" or "Can bank teller Jan close account #123?"

The primary export of this module is a trait called `Securable`, which you can cause your class(es) to express; see our [`mutrait`](https://npmjs.com/package/mutrait) package for full trait support in JavaScript.

## TL;DR

File `Account.js`:

```js
const { traits } = require('mutrait')
const { Securable } = require('@scispike/domain-object-security')

class Account extends traits(Securable) {
  constructor (balance = 0, openedAt = new Date()) {
    super(balance, openedAt)
    this._balance = balance
    this.openedAt = openedAt
    this.closedAt = null
  }

  get balance () { return this._balance }
  deposit (amount) { this._balance += amount } 
  withdraw (amount) { this._balance -= amount }
  close (at = new Date()) { this.closedAt = at }
  get open () { return !this.closed }
  get closed () { return !!this.closedAt }
}

module.exports = Account
```

File `index.js`:

```js
const Account = require('./Account')

const sally = 'sally'
const keith = 'keith'
const acct = new Account()

console.log(acct.secured) // false
console.log(acct.grants({ principals: sally, actions: 'get balance' })) // true
console.log(acct.grants({ principals: sally, actions: 'close' }))       // true
console.log(acct.grants({ principals: keith, actions: 'get balance' })) // true
console.log(acct.grants({ principals: keith, actions: 'close' }))       // true

acct.grant({ principal: sally, action: 'get balance' })
acct.grant({ principal: sally, action: 'close' })

console.log(acct.secured) // true

console.log(acct.grants({ principals: sally, actions: 'get balance' })) // true
console.log(acct.grants({ principals: keith, actions: 'close' }))       // false
console.log(acct.grants({ principals: sally, actions: 'get balance' })) // true
console.log(acct.grants({ principals: keith, actions: 'close' }))       // false
```

> TIP: When you combine this library with method interception via [`@scispike/aspectify`](https://www.npmjs.com/package/@scispike/aspectify) and with [`ClsHookedContext` or `ZoneJsContext`](https://github.com/SciSpike/nodejs-support/tree/master/src/main/context) from [`@scispike/nodejs-support`](https://www.npmjs.com/package/@scispike/nodejs-support), you can completely isolate the crosscutting concern of security.

File `Secured.js`:

```js
const { Before } = require('@scispike/aspectify')
const Context = require('@scispike/nodejs-support/context/ClsHookedContext')

const Secured =  Before(({ thisJoinPoint }) => {
  if (!thisJoinPoint.thiz || thisJoinPoint?.thiz === thisJoinPoint?.clazz) {
    return // because we're in a static context or there's no securable to call securable.grants on
  }
    
  const token = Context().get('token')

  if (!thisJoinPoint.thiz.grants({
    principals: token.principal,
    actions: thisJoinPoint.fullName
  })) {
    const e = new Error(`E_UNAUTHORIZED`)
    e.principal = token.principal
    e.clazz = thisJoinPoint.clazz.constructor.name
    e.method = thisJoinPoint.fullName
    
    throw e
  }
})

module.exports = Secured
```

File `Account.js`:

```js
const { traits } = require('mutrait')
const { Securable } = require('@scispike/domain-object-security')
const Secured = require('./Secured')

class Account extends traits(Securable) {
  constructor (balance = 0, openedAt = new Date()) {
    super(balance, openedAt)
    this._balance = balance
    this.openedAt = openedAt
    this.closedAt = null
  }

  @Secured
  get balance () { return this._balance }

  @Secured
  deposit (amount) { this._balance += amount } 

  @Secured
  withdraw (amount) { this._balance -= amount }

  @Secured
  close (at = new Date()) { this.closedAt = at }

  @Secured
  get open () { return !this.closed }

  @Secured
  get closed () { return !!this.closedAt }
}

module.exports = Account
``` 

## TODO
There's more to write here, but for now, see the tests in `src/test/unit/Securable.spec.js` for usage.
