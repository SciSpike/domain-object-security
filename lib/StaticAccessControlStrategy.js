'use strict'

const { Enum } = require('enumify')

class StaticAccessControlStrategy extends Enum {
  permits () {
    return this === StaticAccessControlStrategy.PERMIT
  }

  denies () {
    return this === StaticAccessControlStrategy.DENY
  }
}

StaticAccessControlStrategy.initEnum(['PERMIT', 'DENY'])

module.exports = StaticAccessControlStrategy
