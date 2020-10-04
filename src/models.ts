import { Converter } from "..";

export type MapObject<T> = {
  [key: string]: T;
  [key: number]: T;
};

export interface AggregatedObject<T> {
  [key: string]: Array<T>;
  [key: number]: Array<T>;
}

export interface TypeConverterFunctionInterface {
  (input: Array<{ type: Type; value: any }>, attributeName: string, converter: Converter): {
    valsWithTypesArray: Array<{ type: Type; value: any }>;
    discoveredTypes: Array<Type>;
  };
}

export interface Settings {
  typeCheckers: {
    [TypeChoices.string]: TypeConverterFunctionInterface;
    [TypeChoices.Array]: TypeConverterFunctionInterface;
    [TypeChoices.object]: TypeConverterFunctionInterface;
  },
  stringifyingSettings: {
    stringQuotes: '"' | "'" | "`",
    indentSpacesAmount: number
  }
}


export class Interface {
  constructor(public readonly name: string, public attributes: MapObject<Attribute>) { }
}

export class Enum {
  constructor(public readonly name: string, public readonly attributeValueMap: MapObject<any>) { }
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
    if (!this.genericableTypes.includes(type as any) && generic.length > 0) {
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
