
export interface ConfigBase {
  url?: string,
  headers?: Object
}

export interface Config {
  [key : string]: any | ConfigBase
}

export interface Data {
  [key : string]: any
}
