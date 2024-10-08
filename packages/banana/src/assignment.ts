import { Field, MetaData } from './type'
import { each, getValue } from './utils'

export function assignment(source: Record<string, any>, data: MetaData) {
  each<Field>(data as any, (field, i) => {
    let { set, key, children } = field

    if (children) {
      assignment(source, children)
    }

    const value = source[key ?? i]
    if (typeof set === 'function') {
      set(source, field, data)
    } else if (typeof value !== 'undefined') {
      Object.assign(field, { value: getValue(value) })
    }
  })
}
