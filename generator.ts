import { Interface, AggregatedObject, Attribute, Type } from "./models";



export default function generateInterfaceFromArrayOfObjects(inputObjects: Array<Object>, name: string): Interface {
  const aggregatedObject: AggregatedObject = aggregateObject(inputObjects);
  return createInterfaceFromAggregatedObject(aggregatedObject, name);
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

function createInterfaceFromAggregatedObject(aggregatedObject: AggregatedObject, interfaceName: string): Interface {
  const attributes: Array<Attribute> = Object.entries(aggregatedObject)
    .map(([key, values]) => {
      return new Attribute(determineTypes(values, key));
    })
  return new Interface(interfaceName, attributes);
}



function determineTypes(vals: Array<any>, attributeName: string): Set<Type> {
  let valsWithTypes = vals.map((val) => {
    const valType: Type = getAllPrimitiveTypes([val], attributeName).values().next().value;
    return {
      type: valType,
      value: val
    }
  });
  valsWithTypes = considerStringTypes(valsWithTypes);
  valsWithTypes = considerInterface(valsWithTypes, attributeName);
  const types: Set<Type> = new Set();
  valsWithTypes.forEach((valWithType) => types.add(valWithType.type));
  return types

  function considerStringTypes(input: Array<{ type: Type; value: any; }>): Array<{ type: Type; value: any; }> {
    const allStringsInVals: Array<string> = input.filter(val => val.type.type == Type.string).map(val => val.value);
    const setOfStrings = new Set(allStringsInVals);
    if (setOfStrings.size == allStringsInVals.length) {
      return input;
    }
    let output = input.filter((valWithType) => valWithType.type.type != Type.string);
    const stringTypes = Array.from(setOfStrings).map(val => {
      return {
        type: new Type(val),
        value: val
      }
    });
    return output.concat(stringTypes);
  }
  
  function considerInterface(input: Array<{ type: Type; value: any; }>, attributeName: string): Array<{ type: Type; value: any; }> {
    const filtered = input.filter(valWithType => valWithType.type.type == Type.object)
    const objectVals = filtered.map(valWithType => valWithType.value);
    const objectInterface = generateInterfaceFromArrayOfObjects(objectVals, attributeName);
    const interfaceType = new Type(objectInterface.name);
    return input.map((valWithType) => {
      valWithType.type = interfaceType;
      return valWithType;
    })
  }
}

function getAllPrimitiveTypes(vals: Array<any>, attributeName: string): Set<Type> {
  const types: Set<Type> = new Set();
  vals.forEach((val) => {
    const type = typeof val;
    if (val === null) {
      types.add(new Type(Type.null));
    } else if (Array.isArray(val)) {
      types.add(new Type(Type.Array, determineTypes(val, attributeName)))
    } else {
      types.add(new Type(type))
    }
  })
  return types
}