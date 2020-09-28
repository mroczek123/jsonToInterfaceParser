type stringifiedType = "string" | "number" | "bigint" | "boolean" | "symbol" | "undefined" | "object" | "function" | "null" | "unknown" | "array";
const interfacesRegistry: { [name: string]: Interface } = {};

class Interface {
  public name: string
  constructor(
    name: string,
    public attributes: Array<Attribute>
  ) {
    let nameIter = 0;
    while (!interfacesRegistry[`${name}${nameIter}`]) {
      nameIter++;
    }
    let nameWithIndex = "";
    if (nameIter > 0) {
      nameWithIndex = `${name}${nameIter}`
    } else {
      nameWithIndex = name;
    }
    interfacesRegistry[nameWithIndex] = this    
  }
}

class Attribute {
  public types: Array<string | Interface>;
  public readonly isOptional: boolean;

  constructor(
    public name: string,
    types: Array<string | Interface>
  ) {
    this.isOptional = types.findIndex((type) => type === "undefined") >= 0;
    this.types = types.filter((type) => type != "undefined");
  }
}

interface AggregatedObject {
  [key: string]: Array<any>;
  [key: number]: Array<any>;
};


export default function generateInterfaceFromArrayOfObjects(inputObjects: Array<Object>, name: string): Interface {
  const aggregatedObject: AggregatedObject = aggregateObject(inputObjects);
  return createInterfaceFromAggregatedObject(aggregatedObject, name);
}

function createInterfaceFromAggregatedObject(aggregatedObject: AggregatedObject, interfaceName: string): any {
  const attributes: Array<Attribute> = Object.entries(aggregatedObject)
    .map(([key, values]) => {
      const types: Array<stringifiedType> = [];
       getAllTypes(values).forEach((type) => {
        if (type == "object") {
          return generateInterfaceFromArrayOfObjects(values, key) // DOKOŃCZ BRANCHA
        }
        return type
      });
      return new Attribute(key, types);
    })
  return new Interface(interfaceName, attributes);
}

function aggregateObject(objects: Array<Object>): AggregatedObject {
  const aggregatedObject: AggregatedObject = {}
  const allAttributes: Set<string> = new Set();
  objects.forEach((object) => {
    Object.keys(object).forEach((attribute) => allAttributes.add(attribute));
    allAttributes.forEach((attribute) => {
      const value = object[attribute];
      Object.keys(aggregatedObject).includes(attribute) ? aggregatedObject[attribute].push(value) : aggregatedObject[attribute] = [];
    })
  })
  return aggregatedObject;
}

function determineType(vals: Array<any>): stringifiedType | string {
  const types = getAllTypes(vals);
}

function getAllTypes(vals: Array<any>): Set<stringifiedType | string> {
  const types: Set<stringifiedType | string> = new Set();
  if (vals.length == 0) {
    types.add("unknown")
  } else {
    const otherTypes = vals
      .map((val) => {
        if (val === null) {
          return "null"
        } else if (Array.isArray(val)) {
          return `Array<${determineType(val)}>`
        }
        return typeof val
      })
    otherTypes.forEach((type) => types.add(type));
  }
  return types
}