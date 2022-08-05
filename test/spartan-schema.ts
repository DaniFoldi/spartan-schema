/* eslint-disable sort-keys */

import { describe, it } from 'mocha'
import { expect } from 'chai'
import {
  isSchema,
  MatchesSchema,
  matchesSchema,
  Schema,
  SchemaError,
  zeroValue
} from '../src/schema'
import { PathArray } from '../src/path'


const personSchema = {
  schema: {
    firstName: 'string',
    lastName: 'string',
    age: 'integer'
  }
} as const

const pathSchema = {
  schema: [ 'array', [ 'oneof', 'string', 'integer' ]]
} as const

const stoplightSchema = {
  schema: {
    stoplight: [ 'enum', 'red', 'yellow', 'green' ]
  }
} as const

const refSchema = {
  let: {
    Veggie: {
      veggieName: 'string',
      veggieLike: 'boolean'
    }
  },
  schema: {
    fruits: [ 'array', 'string' ],
    vegetables: [ 'array', [ 'ref', 'Veggie' ]]
  }
} as const

const primitivesSchema = {
  schema: {
    null1: null,
    null2: 'null',
    boolean: 'boolean',
    integer: 'integer',
    float1: 'float',
    float2: 'number',
    string: 'string',
    date: 'date',
    binary: 'binary'
  }
} as const

const tuplesSchema = {
  schema: [
    'array',
    [ 'tuple', 'integer' ],
    [ 'tuple', 'string', 'string', 'boolean' ]
  ]
} as const

const infiniteSchema = {
  let: { Forever: { loop: [ 'ref', 'Forever' ] } },
  schema: [ 'ref', 'Forever' ]
} as const

const lengthSchema = {
  schema: {
    test: 'string(3,5)'
  }
} as const

const spartanSchemaSchema = {
  spartan: 1,
  let: {
    EnumValue: [ 'oneof', null, 'boolean', 'number', 'string' ],
    Type: [
      'oneof',
      [
        'enum',
        null,
        'null',
        'boolean',
        'integer',
        'float',
        'number',
        'string',
        'date',
        'binary'
      ],
      [ 'array', [ 'enum', 'enum' ], [ 'ref', 'EnumValue' ], [ 'ref', 'EnumValue' ]],
      [ 'array', [ 'enum', 'oneof' ], [ 'ref', 'Type' ], [ 'ref', 'Type' ]],
      [ 'array', [ 'enum', 'tuple' ], [ 'ref', 'Type' ], [ 'ref', 'Type' ]],
      [ 'array', [ 'enum', 'array' ], [ 'ref', 'Type' ], [ 'ref', 'Type' ]],
      [ 'tuple', [ 'enum', 'dictionary' ], [ 'ref', 'Type' ]],
      [ 'tuple', [ 'enum', 'ref' ], 'string' ],
      [
        'dictionary',
        [
          'oneof',
          [ 'tuple', [ 'enum', 'optional' ], [ 'ref', 'Type' ]],
          [ 'ref', 'Type' ]
        ]
      ]
    ]
  },
  schema: {
    spartan: [ 'optional', [ 'enum', 1 ]],
    let: [ 'optional', [ 'dictionary', [ 'ref', 'Type' ]]],
    schema: [ 'ref', 'Type' ]
  }
} as const

function expectToMatch<S extends Schema>(schema: S): (v: MatchesSchema<S>) => void {
  return (value: MatchesSchema<S>) => expect(matchesSchema(schema)(value)).to.equal(true)
}

function expectNotToMatch(schema: Schema, value: unknown): void {
  expect(matchesSchema(schema)(value)).to.equal(false)
}

function expectOneError(schema: unknown, errorLocation: PathArray) {
  const errors: SchemaError[] = []
  const valid = isSchema(schema, errors)
  expect(errors).to.have.length(1)
  expect(errors[0].location).to.deep.equal(errorLocation)
  expect(valid).to.equal(false)
}

describe('Spartan Schema', () => {
  describe('object schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(personSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('matches a basic object', () => {
      expectToMatch(personSchema)({
        firstName: 'Adam',
        lastName: 'Nelson',
        age: 31
      })
    })
    it('doesn\'t match missing keys', () => {
      expectNotToMatch(personSchema, { firstName: 'Adam', lastName: 'Nelson' })
    })
    it('doesn\'t match key type mismatch', () => {
      expectNotToMatch(personSchema, {
        firstName: 'Adam',
        lastName: 'Nelson',
        age: null
      })
    })
    it('doesn\'t match an array', () => {
      expectNotToMatch(personSchema, [ 'Adam', 'Nelson', 31 ])
    })
    it('has a zero value', () => {
      expect(zeroValue(personSchema)).to.deep.equal({
        firstName: '',
        lastName: '',
        age: 0
      })
    })
  })

  describe('path schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(pathSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('matches various paths', () => {
      expectToMatch(pathSchema)([])
      expectToMatch(pathSchema)([ 1 ])
      expectToMatch(pathSchema)([ 'foo' ])
      expectToMatch(pathSchema)([ 'foo', 'bar', 'baz' ])
      expectToMatch(pathSchema)([ -1, 0, 1 ])
      expectToMatch(pathSchema)([ 1, 2, 'd' ])
    })
    it('doesn\'t match paths with floats, infinity, or NaN', () => {
      expectNotToMatch(pathSchema, [ 1.1 ])
      expectNotToMatch(pathSchema, [ Number.POSITIVE_INFINITY ])
      expectNotToMatch(pathSchema, [ Number.NEGATIVE_INFINITY ])
      expectNotToMatch(pathSchema, [ Number.NaN ])
    })
    it('has a zero value', () => {
      expect(zeroValue(pathSchema)).to.deep.equal([])
    })
  })

  describe('enum schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(stoplightSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('matches enum values', () => {
      expectToMatch(stoplightSchema)({ stoplight: 'red' })
      expectToMatch(stoplightSchema)({ stoplight: 'yellow' })
      expectToMatch(stoplightSchema)({ stoplight: 'green' })
    })
    it('doesn\'t match unspecified values', () => {
      expectNotToMatch(stoplightSchema, { stoplight: 'blue' })
    })
    it('has a zero value', () => {
      expect(zeroValue(stoplightSchema)).to.deep.equal({ stoplight: 'red' })
    })
  })

  describe('primitives schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(primitivesSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    const matchingObject = {
      null1: null,
      null2: null,
      boolean: true,
      integer: 1,
      float1: 1.5,
      // eslint-disable-next-line mocha/no-setup-in-describe
      float2: Number.POSITIVE_INFINITY,
      string: 'foo',
      date: new Date(),
      // eslint-disable-next-line mocha/no-setup-in-describe
      binary: Uint8Array.of(1, 2, 3)
    } as const
    it('matches all primitive types', () => {
      expectToMatch(primitivesSchema)(matchingObject)
    })
    it('doesn\'t match wrong primitive types', () => {
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        null1: true
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        null2: true
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        boolean: 'true'
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        integer: 1.5
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        integer: '1'
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        float1: '1'
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        float2: '1'
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        string: true
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        date: {}
      })
      expectNotToMatch(primitivesSchema, {
        ...matchingObject,
        binary: []
      })
    })
    it('has a zero value', () => {
      expect(zeroValue(primitivesSchema)).to.deep.equal({
        null1: null,
        null2: null,
        boolean: false,
        integer: 0,
        float1: 0,
        float2: 0,
        string: '',
        date: new Date(0),
        binary: Uint8Array.of()
      })
    })
  })

  describe('tuples schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(tuplesSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('matches array prefix without suffix', () => {
      expectToMatch(tuplesSchema)([[ 1 ]])
    })
    it('matches array with typed suffix', () => {
      expectToMatch(tuplesSchema)([[ 2 ], [ 'foo', 'bar', true ]])
      expectToMatch(tuplesSchema)([
        [ 3 ],
        [ 'foo', 'bar', true ],
        [ 'baz', 'qux', false ]
      ])
    })
    it('has a zero value', () => {
      expect(zeroValue(refSchema)).to.deep.equal({
        fruits: [],
        vegetables: []
      })
    })
  })

  describe('ref schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(refSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('matches a simple object', () => {
      expectToMatch(refSchema)({
        fruits: [ 'apple', 'banana' ],
        vegetables: [{ veggieName: 'broccoli', veggieLike: false }]
      })
    })
    it('has a zero value', () => {
      expect(zeroValue(refSchema)).to.deep.equal({
        fruits: [],
        vegetables: []
      })
    })
  })

  describe('infinite schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(infiniteSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('throws an exception when used with zeroValue', () => {
      expect(() => zeroValue(infiniteSchema)).to.throw('Cannot determine zero value of the infinite schema type {"loop":["ref","Forever"]}')
    })
  })


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

  describe('Spartan Schema recursive schema', () => {
    it('is a valid schema', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(spartanSchemaSchema, errors)
      expect(errors).to.deep.equal([])
      expect(valid).to.equal(true)
    })
    it('matches the other schemas', () => {
      expectToMatch(spartanSchemaSchema)(personSchema)
      expectToMatch(spartanSchemaSchema)(pathSchema)
      expectToMatch(spartanSchemaSchema)(stoplightSchema)
      expectToMatch(spartanSchemaSchema)(primitivesSchema)
      expectToMatch(spartanSchemaSchema)(refSchema)
    })
    it('matches itself', () => {
      expectToMatch(spartanSchemaSchema)(spartanSchemaSchema)
    })
    it('has a zero value', () => {
      expect(zeroValue(spartanSchemaSchema)).to.deep.equal({ schema: null })
    })
  })

  describe('isSchema', () => {
    it('detects missing "schema" field', () => {
      expectOneError({}, [])
    })
    it('detects invalid root type', () => {
      expectOneError([ 'foo' ], [])
    })
    it('detects wrong "spartan" version', () => {
      expectOneError({ schema: null, spartan: 2 }, [ 'spartan' ])
      expectOneError({ schema: null, spartan: null }, [ 'spartan' ])
      expectOneError({ schema: null, spartan: '1' }, [ 'spartan' ])
    })
    it('detects that "let" is not an object', () => {
      expectOneError({ schema: null, let: [] }, [ 'let' ])
      expectOneError({ schema: null, let: null }, [ 'let' ])
    })
    it('detects an invalid scalar type', () => {
      expectOneError({ schema: 'fhqwhgads' }, [ 'schema' ])
      expectOneError({ schema: 1 }, [ 'schema' ])
      expectOneError({ schema: false }, [ 'schema' ])
      expectOneError({ schema: new Date(0) }, [ 'schema' ])
    })
    it('detects an invalid directive type', () => {
      expectOneError({ schema: [] }, [ 'schema' ])
      expectOneError({ schema: [ 'foo' ] }, [ 'schema' ])
      expectOneError({ schema: [ 'foo', null ] }, [ 'schema', 0 ])
      expectOneError({ schema: [[ 'foo', null ], null ] }, [ 'schema', 0 ])
      expectOneError({ schema: [[[[]]]] }, [ 'schema' ])
    })
    it('detects invalid directive arguments', () => {
      expectOneError({ schema: [ 'enum' ] }, [ 'schema' ])
      expectOneError({ schema: [ 'enum', []] }, [ 'schema', 1 ])
      expectOneError({ schema: [ 'enum', new Date(0) ] }, [ 'schema', 1 ])
      expectOneError({ schema: [ 'array' ] }, [ 'schema' ])
      expectOneError({ schema: [ 'array', 1 ] }, [ 'schema', 1 ])
      expectOneError({ schema: [ 'dictionary', 'number', 'string' ] }, [ 'schema' ])
    })
    it('detects invalid refs', () => {
      expectOneError({ schema: [ 'ref', 'nonexistent' ] }, [ 'schema', 1 ])
      expectOneError({ schema: [ 'ref', 'FOO' ], let: { foo: null } }, [
        'schema',
        1
      ])
      expectOneError({ schema: [ 'ref', true ], let: { true: null } }, [
        'schema',
        1
      ])
      expectOneError({ schema: [ 'ref', 'foo', 'foo' ], let: { foo: null } }, [ 'schema' ])
    })
    it('detects "optional" outside of object keys', () => {
      expectOneError({ schema: [ 'optional', 'integer' ] }, [ 'schema' ])
      expectOneError({ schema: [ 'tuple', [ 'optional', 'integer' ]] }, [
        'schema',
        1
      ])
      expectOneError({ schema: [ 'array', [ 'optional', 'integer' ]] }, [
        'schema',
        1
      ])
      expectOneError({ schema: [ 'dictionary', [ 'optional', 'integer' ]] }, [
        'schema',
        1
      ])
      expectOneError(
        {
          schema: { bar: [ 'ref', 'foo' ] },
          let: { foo: [ 'optional', 'integer' ] }
        },
        [ 'let', 'foo' ]
      )
    })
    it('detects and reports multiple invalid object keys', () => {
      const errors: SchemaError[] = []
      const valid = isSchema(
        { schema: { foo: 'foo', bar: null, baz: 'baz' } },
        errors
      )
      expect(errors).to.have.length(2)
      expect(valid).to.equal(false)
    })
    it('detects and reports multiple invalid tuple elements', () => {
      const errors: SchemaError[] = []
      const valid = isSchema({ schema: [ 'tuple', 'foo', null, 'baz' ] }, errors)
      expect(errors).to.have.length(2)
      expect(valid).to.equal(false)
    })
  })
})
