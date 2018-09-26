'use strict'

const { Enum } = require('enumify')

class SimpleAction extends Enum {
  static staticActions () {
    return [SimpleAction.CREATE, SimpleAction.REFERENCE]
  }

  static instanceActions () {
    return [SimpleAction.READ, SimpleAction.UPDATE, SimpleAction.DELETE, SimpleAction.SECURE]
  }
}

SimpleAction.initEnum(['CREATE', 'REFERENCE', 'READ', 'UPDATE', 'DELETE', 'SECURE', 'ALL'])

module.exports = SimpleAction
