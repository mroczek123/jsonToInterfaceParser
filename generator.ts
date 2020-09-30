import { Interface, AggregatedObject, Attribute, Type, MapObject, TypeChoices } from "./models";
import { considerStringTypes, considerInterface, TypeConverterFunctionInterface } from "./type-converters";

export const interfacesRegistry: { [name: string]: Interface } = {};

export default function generateInterfaceFromArrayOfObjects(inputObjects: Array<Object>, name: string): Interface {
  const aggregatedObject: AggregatedObject<any> = aggregateObject(inputObjects);
  return createInterfaceFromAggregatedObject(aggregatedObject, name);
}

function aggregateObject(objects: Array<Object>): AggregatedObject<any> {
  const aggregatedObject: AggregatedObject<any> = {}
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

function createInterfaceFromAggregatedObject(aggregatedObject: AggregatedObject<any>, interfaceName: string): Interface {
  const attributes: MapObject<Attribute> = Object.entries(aggregatedObject)
    .reduce((acc, [key, values]) => {
      return Object.assign(acc, { [key]: new Attribute(determineTypes(values, key)) })
    }, {})
  return createInterfaceAndRegister(interfaceName, attributes);
}

function determineTypes(vals: Array<any>, attributeName: string): Set<Type> {
  const types: Set<Type> = new Set();
  let valsWithTypes = vals.map((val) => {
    const valType: Type = getAllPrimitiveTypes([val], attributeName).values().next().value;
    return {
      type: valType,
      value: val
    }
  });
  debugger;
  getTypeConverters().forEach((typeConverterFunction) => {
    const output = typeConverterFunction(valsWithTypes, attributeName);
    valsWithTypes = output.arrajka;
    output.typesToAdd.forEach((type) => types.add(type));
  })
  return types
}

function getAllPrimitiveTypes(vals: Array<any>, attributeName: string): Set<Type> {
  const types: Set<Type> = new Set();
  vals.forEach((val) => {
    const type = typeof val;
    if (val === null) {
      types.add(new Type(TypeChoices.null));
    } else if (Array.isArray(val)) {
      types.add(new Type(TypeChoices.Array, determineTypes(val, attributeName)))
    } else {
      types.add(new Type(type as TypeChoices))
    }
  })
  return types
}

function getTypeConverters(): Array<TypeConverterFunctionInterface> {
  return [considerStringTypes, considerInterface]
}

const calculateInterfaceName = function (name: string, existingNames: Array<string>): string {
  let nameIter = 0;
  let canidateName = name;
  while (existingNames.findIndex(nameIter => nameIter == canidateName) > -1) {
    nameIter++;
    canidateName = `${name}${nameIter}`
  }
  return canidateName;
}

const createInterfaceAndRegister = function (interfaceName: string, attributes: MapObject<Attribute>) {
  const calculatedName = calculateInterfaceName(interfaceName, Object.keys(interfacesRegistry));
  const createdInterface = new Interface(calculatedName, attributes);
  interfacesRegistry[calculatedName] = createdInterface;
  return createdInterface;
}
