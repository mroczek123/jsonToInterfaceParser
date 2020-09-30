export type MapObject<T> = {
  [key: string]: T,
  [key: number]: T
};


export interface AggregatedObject<T> {
  [key: string]: Array<T>;
  [key: number]: Array<T>;
};

export class Interface {
  constructor(
    public readonly name: string,
    public attributes: MapObject<Attribute>
  ) {}
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

  constructor(
    public readonly type: TypeChoices | Interface,
    public readonly generic ?: Set<Type>,
    public readonly acceptedValues ?: Set<any>
  ) {}
}

export class Attribute {
  public readonly types: Set<Type>;
  public readonly isOptional: boolean | string;

  constructor(
    types: Array<Type> | Set<Type>
  ) {
    let isOptional = false;
    const typesFiltered: Set<Type> = new Set();
    types.forEach((type: Type) => {
      if (type.type == TypeChoices.undefined) {
        isOptional = true;
      }
      typesFiltered.add(type);
    })
    this.types = typesFiltered;
  }
}