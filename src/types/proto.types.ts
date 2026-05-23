export interface ProtoFile {
  id: string
  name: string
  content: string
  path?: string
}

export interface ProtoService {
  name: string
  methods: ProtoMethod[]
}

export interface ProtoMethod {
  name: string
  inputType: string
  outputType: string
  clientStreaming: boolean
  serverStreaming: boolean
}

export interface ProtoMessage {
  name: string
  fields: ProtoField[]
}

export interface ProtoField {
  name: string
  type: string
  number: number
  repeated: boolean
  optional: boolean
}