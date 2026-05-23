import type { DataMappingType } from './node.types'

export type { DataMappingType, DataMapping } from './node.types'

export interface Variable {
  key: string
  value: string
  description?: string
  enabled: boolean
}

export interface Environment {
  id: string
  name: string
  variables: Variable[]
}

export interface SecretRef {
  key: string
  source: 'keychain' | 'env' | 'file'
  path?: string
}

export function resolveVariables(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return variables[key] ?? match
  })
}

export function isDataMappingType(value: string): value is DataMappingType {
  return ['jsonpath', 'script', 'visual', 'direct'].includes(value)
}