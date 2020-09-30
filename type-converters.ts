import generateInterfaceFromArrayOfObjects from "./generator";
import { Type, TypeChoices } from "./models";

export interface TypeConverterFunctionInterface {
  (input: Array<{ type: Type; value: any; }>, attributeName: string): { typesToAdd: Array<Type>, arrajka: Array<{ type: Type; value: any; }> }
}

export const considerStringTypes: TypeConverterFunctionInterface = function (input: Array<{ type: Type; value: any; }>, attributeName: string): { typesToAdd: Array<Type>, arrajka: Array<{ type: Type; value: any; }> } {
  const output = {
    typesToAdd: [],
    arrajka: input
  }
  const allStringsInVals: Array<string> = input.filter(val => val.type.type == TypeChoices.string).map(val => val.value);
  const setOfStrings = new Set(allStringsInVals);
  if (setOfStrings.size == allStringsInVals.length) {
    return output;
  }
  const newType = new Type(TypeChoices.string, undefined, setOfStrings);
  output.typesToAdd.push(newType)
  const mappedToNewType = input.map((valWithType) => {
    if (valWithType.type.type != TypeChoices.string) {
      return valWithType
    }
    return {
      type: newType,
      value: valWithType.value
    }
  })
  output.arrajka = mappedToNewType;
  return output;
}

export const considerInterface: TypeConverterFunctionInterface = function (input: Array<{ type: Type; value: any; }>, attributeName: string): { typesToAdd: Array<Type>, arrajka: Array<{ type: Type; value: any; }> } {
  const output = {
    typesToAdd: [],
    arrajka: input
  }
  const filtered = input.filter(valWithType => valWithType.type.type == TypeChoices.object);
  if (filtered.length == 0) {
    return output;
  }
  const objectVals = filtered.map(valWithType => valWithType.value);
  const objectInterface = generateInterfaceFromArrayOfObjects(objectVals, attributeName);
  const interfaceType = new Type(objectInterface);
  output.typesToAdd.push(interfaceType);
  output.arrajka = input.map((valWithType) => {
    if (valWithType.type.type == TypeChoices.object) {
      valWithType.type = interfaceType;
    }
    return valWithType;
  });
  return output;
}
