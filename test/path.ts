import { describe, it } from 'mocha'
import { expect } from 'chai'
import { pathToString } from '../src/path'


describe('PathArray', () => {
  it('can be rendered as a string', () => {
    expect(pathToString([])).to.equal('$')
    expect(pathToString([ 1, 2, 3 ])).to.equal('$[1][2][3]')
    expect(pathToString([ 'foo', 'bar', 'baz' ])).to.equal('$.foo.bar.baz')
    expect(pathToString([ '1' ])).to.equal('$["1"]')
    expect(pathToString([ 'foo_bar', 'baz-qux' ])).to.equal('$.foo_bar["baz-qux"]')
  })
})
