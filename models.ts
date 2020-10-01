import { Converter } from "./converter";

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
  };
}

export class Interface {
  constructor(public readonly name: string, public attributes: MapObject<Attribute>) {}
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
    public readonly type: TypeChoices,
    public readonly interfaceClass?: Interface,
    public readonly generic: Array<Type> = [],
    public readonly acceptedValues: Set<any> = new Set(),
  ) {
    if (!this.genericableTypes.includes(type) && generic.length > 0) {
      throw Error(`Type: ${type} cannot have generics`);
    }
  }
}

export class Attribute {
  public readonly types: Array<Type>;
  public readonly isOptional: boolean | string;

  constructor(types: Array<Type>) {
    let isOptional = false;
    this.types = types.filter((type: Type) => {
      if (type.type == TypeChoices.undefined) {
        isOptional = true;
      }
      return type.type !== TypeChoices.undefined;
    });
    this.isOptional = isOptional;
  }
}
