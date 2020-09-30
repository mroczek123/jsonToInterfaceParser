export type MapObject = {
  [key: string]: any,
  [key: number]: any
};

export const interfacesRegistry: { [name: string]: Interface } = {};

export interface AggregatedObject {
  [key: string]: Array<any>;
  [key: number]: Array<any>;
};

export class Interface {
  readonly name;
  constructor(
    name: string,
    public attributes: MapObject
  ) {
    this.name = this.calculateName(name)
    interfacesRegistry[this.name] = this;
  }

  private calculateName(name: string): string {
    let nameIter = 0;
    let canidateName = name;
    while (interfacesRegistry[canidateName]) {
      nameIter++;
      canidateName = `${name}${nameIter}`
    }
    return canidateName;
  }
}

enum TypeChoices {
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
  static readonly string = "string";
  static readonly number = "number";
  static readonly bigint = "bigint";
  static readonly boolean = "boolean";
  static readonly symbol = "symbol";
  static readonly undefined = "undefined";
  static readonly object = "object";
  static readonly function = "function";
  static readonly null = "null";
  static readonly unknown = "unknown";
  static readonly Array = "Array";

  constructor(
    public readonly type: TypeChoices | string, // by string i mean key in interface
    public readonly generic ?: Set<Type>,
  ) {}
}

export class Attribute {
  public readonly types: Set<Type>;
  public readonly isOptional: boolean;

  constructor(
    types: Array<Type> | Set<Type>
  ) {
    let isOptional = false;
    const typesFiltered: Set<Type> = new Set();
    types.forEach((type: Type) => {
      if (type.type == Type.undefined) {
        isOptional = true;
      }
      typesFiltered.add(type);
    })
    this.types = typesFiltered;
  }

  toTypeScript(name: string) {
    let typesString = "";
    let loop = 0 
    this.types.forEach((type) => {
      typesString += `${type.type}${this.types.size < loop-1 ? ' | ': ''}`;
      loop++;
    })
    return `${this.isOptional ? '?' : ''}: ${typesString}`
  }
}

