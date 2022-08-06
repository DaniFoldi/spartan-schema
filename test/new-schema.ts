/* eslint-disable sort-keys */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  isSchema,
  SchemaError
} from '../src/schema'
import {expectToMatch, expectNotToMatch} from './spartan-schema'


const lengthSchema = {
  schema: {
    test: 'string(3,5)'
  }
} as const

const integerSchema = {
  schema: {
    test: 'integer(-5,5)'
  }
} as const

const numberSchema = {
  schema: {
    test: 'number(1.5,3)'
  }
} as const

const floatSchema = {
  schema: {
    test: 'number(-1.2,2.4)'
  }
} as const

describe('new schemas', () => {
  describe('length schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(lengthSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('allows strings of the minimum length', () => {
      expectToMatch(lengthSchema)({ test: 'foo' })
    })
    it('allows strings of the maximum length', () => {
      expectToMatch(lengthSchema)({ test: 'foooo' })
    })
    it('rejects strings below the minimum length', () => {
      expectNotToMatch(lengthSchema, { test: 'fo' })
    })
    it('rejects strings above the maximum length', () => {
      expectNotToMatch(lengthSchema, { test: 'fooooo' })
    })
  })

  describe('integer schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(integerSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('allows numbers of the minimum', () => {
      expectToMatch(integerSchema)({ test: -5 })
    })
    it('allows numbers of the maximum', () => {
      expectToMatch(integerSchema)({ test: 5 })
    })
    it('rejects numbers below the minimum', () => {
      expectNotToMatch(integerSchema, { test: -5.6 })
    })
    it('rejects numbers above the maximum', () => {
      expectNotToMatch(integerSchema, { test: 10 })
    })
  })

  describe('float schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(floatSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('allows numbers of the minimum', () => {
      expectToMatch(floatSchema)({ test: -1.2 })
    })
    it('allows numbers of the maximum', () => {
      expectToMatch(floatSchema)({ test: 2.4 })
    })
    it('rejects numbers below the minimum', () => {
      expectNotToMatch(floatSchema, { test: -5.6 })
    })
    it('rejects numbers above the maximum', () => {
      expectNotToMatch(floatSchema, { test: 10 })
    })
  })

  describe('number schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(numberSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('allows numbers of the minimum', () => {
      expectToMatch(numberSchema)({ test: 1.5 })
    })
    it('allows numbers of the maximum', () => {
      expectToMatch(numberSchema)({ test: 3 })
    })
    it('rejects numbers below the minimum', () => {
      expectNotToMatch(numberSchema, { test: -1 })
    })
    it('rejects numbers above the maximum', () => {
      expectNotToMatch(numberSchema, { test: 5.5 })
    })
  })
})