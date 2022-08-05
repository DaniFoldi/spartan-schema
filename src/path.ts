// Spartan Schema
// Copyright © 2021-2022 Adam Nelson <adam@nels.onl>
// Distributed under the Blue Oak Model License

/**
 * A more general type than `PathArray`, for any iterable value that can
 * describe a specific location in a JSON document.
 */
export type Path = Iterable<string | number>

/**
 * A path to a specific location in a JSON document.
 */
export type PathArray = readonly (string | number)[]

/**
 * Returns a parseable string representation of a `Path`, in JSONPath format.
 */
export function pathToString(path: Path): string {
  let output = '$'
  for (const element of path) {
    output = typeof element === 'string' && /^[$_a-z][\w$]*$/i.test(element) ? `${output}.${element}` : `${output}[${JSON.stringify(element)}]`
  }
  return output
}
