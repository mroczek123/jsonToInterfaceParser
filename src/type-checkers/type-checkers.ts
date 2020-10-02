import { Converter } from "../..";
import { Type, TypeChoices, TypeConverterFunctionInterface } from "../models";
import * as readLineSync from "readline-sync";


export const considerStringType: TypeConverterFunctionInterface = function (
  input: Array<{ type: Type; value: any }>,
  attributeName: string,
  converter: Converter,
): { valsWithTypesArray: Array<{ type: Type; value: any }>; discoveredTypes: Array<Type> } {
  const output = {
    valsWithTypesArray: input,
    discoveredTypes: [],
  };
  const allStringsInVals: Array<string> = input.filter((val) => val.type.type == TypeChoices.string).map((val) => val.value);
  if (allStringsInVals.length == 0) {
    return output;
  }
  const setOfStrings = new Set(allStringsInVals);
  if (areStringsRandom(setOfStrings)) {
    output.discoveredTypes.push(new Type(TypeChoices.string));
    return output;
  }

  
  const newType = new Type(TypeChoices.string, undefined, undefined, setOfStrings);

  output.discoveredTypes.push(newType);
  output.valsWithTypesArray = input.map((valWithType) => {
    if (valWithType.type.type != TypeChoices.string) {
      return valWithType;
    }
    return {
      type: newType,
      value: valWithType.value,
    };
  });
  return output;

  function areStringsRandom(setOfStrings: Set<string>): boolean {
    const cuttedVals = Array.from(setOfStrings).slice(0, 4).map((val) => val.slice(0, 20)).join(" | ")
    let output = "";
    while (!['Y', "N"].includes(output)) {
      output = readLineSync.question(`\nattributeName:\n${attributeName}\nExampleVals:\n${cuttedVals}\nDoes it look to you like random?(Y/N): `).toUpperCase()
    }
    return output.toUpperCase() === "Y";
  }
};

export const considerObjectType: TypeConverterFunctionInterface = function (
  input: Array<{ type: Type; value: any }>,
  attributeName: string,
  converter: Converter,
): { valsWithTypesArray: Array<{ type: Type; value: any }>; discoveredTypes: Array<Type> } {
  const output = {
    valsWithTypesArray: input,
    discoveredTypes: [],
  };
  const filtered = input.filter((valWithType) => valWithType.type.type == TypeChoices.object);
  if (filtered.length == 0) {
    return output;
  }
  const capitalizedAttributeName = attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
  const objectInterface = converter.convertToInterface(
    filtered.map((valWithType) => valWithType.value),
    capitalizedAttributeName,
  );
  const newType = new Type(TypeChoices.object, objectInterface);
  output.discoveredTypes.push(newType);
  output.valsWithTypesArray = input.map((valWithType) => {
    if (valWithType.type.type == TypeChoices.object) {
      valWithType.type = newType;
    }
    return valWithType;
  });

  return output;
};

export const considerArrayType: TypeConverterFunctionInterface = function (
  input: Array<{ type: Type; value: any }>,
  attributeName: string,
  converter: Converter,
): { valsWithTypesArray: Array<{ type: Type; value: any }>; discoveredTypes: Array<Type> } {
  const output = {
    valsWithTypesArray: input,
    discoveredTypes: [],
  };
  const filtered = input.filter((valWithType) => valWithType.type.type == TypeChoices.Array);
  if (filtered.length == 0) {
    return output;
  }
  const arrayValues = filtered.reduce((acc, array) => acc.concat(array.value), []);
  const types = converter.determineTypes(arrayValues, attributeName);
  const newType = new Type(TypeChoices.Array, undefined, types);
  output.discoveredTypes.push(newType);
  output.valsWithTypesArray = input.map((typeWithVal) => {
    if (typeWithVal.type.type == TypeChoices.Array) {
      typeWithVal.type = newType;
    }
    return typeWithVal;
  });
  return output;
};

export const considerOtherTypes = function (
  input: Array<{ type: Type; value: any }>,
  attributeName: string,
  converter: Converter,
): { valsWithTypesArray: Array<{ type: Type; value: any }>; discoveredTypes: Array<Type> } {
  // returns types which ARE NOT [Interface, String, Array]
  const output: {
    discoveredTypes: Array<Type>;
    valsWithTypesArray: Array<{ type: Type; value: any }>;
  } = {
    valsWithTypesArray: input,
    discoveredTypes: [],
  };

  input.forEach((typeWithVal) => {
    const typeCandidate = typeWithVal.type;
    const typeInDiscoveredTypes = Boolean(output.discoveredTypes.find((discoveredType) => discoveredType.type === typeCandidate.type));
    if (!typeInDiscoveredTypes && !Object.keys(converter.settings.typeCheckers).includes(typeCandidate.type)) {
      output.discoveredTypes.push(typeWithVal.type);
    }
  });
  return output;
};
