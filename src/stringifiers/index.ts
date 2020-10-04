import { Enum, Interface, Settings } from "../models";

export interface StringifierFunction {
  (interfaceObject: Interface | Enum, settings: Settings): string
}