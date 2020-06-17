'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class P0007 extends Model {
  static get table() {
    return 'P0007'
  }

  static get incrementing() {
    return false
  }

  static get createdAtColumn() {
    return null
  }

  static get updatedAtColumn() {
    return null
  }

}

module.exports = P0007
