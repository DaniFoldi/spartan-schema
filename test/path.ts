import { describe, it } from 'mocha'
import { expect } from 'chai'
import { pathToString } from '../src/path'


describe('PathArray', () => {
  it('can be rendered as a string', () => {
    expect(pathToString([])).toEqual('$')
    expect(pathToString([ 1, 2, 3 ])).toEqual('$[1][2][3]')
    expect(pathToString([ 'foo', 'bar', 'baz' ])).toEqual('$.foo.bar.baz')
    expect(pathToString([ '1' ])).toEqual('$["1"]')
    expect(pathToString([ 'foo_bar', 'baz-qux' ])).toEqual('$.foo_bar["baz-qux"]')
  })
})
