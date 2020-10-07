import { Converter } from "..";

export type MapObject<T> = {
  [key: string]: T;
  [key: number]: T;
};

export interface AggregatedObject<T> {
  [key: string]: Array<T>;
  [key: number]: Array<T>;
}

export enum QuoteChoices {
  SINGLE = "'",
  DOUBLE = '"',
  CURVA = "`"
}

export interface TypeConverterFunctionInterface {
  (values: Array<unknown>, attributeName: string, converter: Converter): Array<Type>;
}

export interface Settings {
  typeCheckers: Array<TypeConverterFunctionInterface>,
  stringifyingSettings: {
    stringQuotes: QuoteChoices,
    indentSpacesAmount: number
  }
}


export class Interface {
  constructor(public readonly name: string, public attributes: MapObject<Attribute>) { }
}

export class Enum {
  constructor(public readonly name: string, public readonly attributeValueMap: MapObject<unknown>) { }
}

export enum TypeChoices {
  string = "string",
  number = "number",
  bigint = "bigint",
  boolean = "boolean",
  symbol = "symbol",
  undefined = "undefined",
  object = "object",
  function = "function",
  null = "null",
  unknown = "unknown",
  Array = "Array",
}

export class Type {
  private genericableTypes = [TypeChoices.Array, TypeChoices.function, TypeChoices.object];
  constructor(
    public readonly type: TypeChoices | Interface | Enum,
    public readonly generic: Array<Type> = [],
  ) {
    if (!this.genericableTypes.includes(type as any) && generic.length > 0) { // TODO: remove any
      throw Error(`Type: ${type} cannot have generics`);
    }
  }
}

export class Attribute {
  public readonly isOptional: boolean;

  constructor(public readonly types: Array<Type>) {
    this.types = types;
    this.isOptional = Boolean(types.find((type) => type.type == TypeChoices.undefined));
  }
}
