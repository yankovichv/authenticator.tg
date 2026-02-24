import { createRef } from 'react'
import objectPath from 'object-path'

export default class Ref {
  constructor() {
    /**
     *
     * @type {Object}
     * @private
     */
    this._storage = {}
  }

  /**
   *
   * @param {string} id
   * @returns {Ref}
   */
  create(id) {
    this._storage[id] = createRef()
    return this
  }

  /**
   *
   * @param {string} id
   * @returns {LegacyRef<HTMLSpanElement> }
   */
  upsert(id) {
    return this._storage[id] || (this._storage[id] = createRef())
  }

  /**
   *
   * @param {string} id
   * @param {number} [deep]
   * @returns {null|HTMLElement}
   */
  element(id, deep = 0) {
    let ref = objectPath.get(this._storage, [id, 'current'])
    for (let i = 0; i < deep; i++) {
      ref = objectPath.get(ref, ['ref', 'current'])
      if (!ref) {
        return null
      }
    }
    return ref
  }
}
