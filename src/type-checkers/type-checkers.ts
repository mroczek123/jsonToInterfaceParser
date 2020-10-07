import { Converter } from "../..";
import { Enum, Type, TypeChoices, TypeConverterFunctionInterface } from "../models";
import * as readLineSync from "readline-sync";


export const considerStringType: TypeConverterFunctionInterface = function (values: Array<unknown>, attributeName: string, converter: Converter): Array<Type> {
  /**
   * Returns [Type<string>] if user not allowed enum or [Type<Enum>] if enum is allowed
   */
  let output = [];
  const allStringsInVals: Array<string> = values.filter((val) => getValueType(val) == TypeChoices.string) as Array<string>; // TODO: remove AS
  if (allStringsInVals.length == 0) {
    return output;
  }
  const setOfStrings = new Set(allStringsInVals);
  if (!createEnum(setOfStrings)) {
    output.push(new Type(TypeChoices.string));
    return output;
  }

  const newEnum = createEnumFromEnconteredValues(setOfStrings, attributeName);
  const newType = new Type(newEnum);
  output.push(newType);
  return output;

  function createEnum(setOfStrings: Set<string>): boolean {
    const cuttedVals = Array.from(setOfStrings).slice(0, 6).map((val) => val.slice(0, 20)).join(" | ")
    let output = "";
    while (!['Y', "N"].includes(output)) {
      output = readLineSync.question(`\nattributeName:\n${attributeName}\nValuesAmount:${setOfStrings.size}\nExampleVals:\n${cuttedVals}\nCreate enum ?(Y/N): `).toUpperCase()
    }
    return output.toUpperCase() === "Y";
  }

  function createEnumFromEnconteredValues(setOfValues: Set<string>, attributeName: string): Enum {
    const enumName = attributeName.charAt(0).toUpperCase() + attributeName.slice(1) + "Choices";
    const attributeNameValueMap = Array.from(setOfValues).reduce((acc, next) => Object.assign(acc, { [(next.length > 0 ? next.toUpperCase(): "EMPTY")]: next }), {})
    return converter.getOrCreateEnum(enumName, attributeNameValueMap);
  }
};

export const considerObjectType: TypeConverterFunctionInterface = function (values: Array<unknown>, attributeName: string, converter: Converter): Array<Type> {
  /**
   * If finds object then returns [Type<Interface>]
   */
  let output = [];

  const filtered = values.filter((valWithType) => getValueType(valWithType) == TypeChoices.object);
  if (filtered.length == 0) {
    return output;
  }
  const capitalizedAttributeName = attributeName.charAt(0).toUpperCase() + attributeName.slice(1);
  const objectInterface = converter.convertToInterface(
    filtered,
    capitalizedAttributeName,
  );
  const newType = new Type(objectInterface);
  output.push(newType);
  return output;
};

export const considerArrayType: TypeConverterFunctionInterface = function (values: Array<unknown>, attributeName: string, converter: Converter): Array<Type> {
  /**
   * If finds array then returns [Type<Array<sometypes>>]
   */
  let output = [];
  const filtered = values.filter((val) => getValueType(val) == TypeChoices.Array);
  if (filtered.length == 0) {
    return output;
  }

  const arrayValues = filtered.flat(1);
  const types = converter.determineTypes(arrayValues, attributeName);
  const newType = new Type(TypeChoices.Array, types);
  output.push(newType);
  return output;
};

export const considerOtherTypes = function (values: Array<unknown>, attributeName: string, converter: Converter): Array<Type> {
  // considers rest of types not determined by upper type checkers
  return values.reduce((acc: Array<Type>, val) => {
    const type = getValueType(val);
    if ([TypeChoices.Array, TypeChoices.string, TypeChoices.object].includes(type)) {
      return acc
    }
    if (!acc.find(typeIter => typeIter.type == type)) {
      acc.push(new Type(type))
    }
    return acc
  }, []) as Array<Type>;
};

function getValueType(val: unknown): TypeChoices {
  const type = typeof val;
  if (val === null) {
    return TypeChoices.null;
  } else if (Array.isArray(val)) {
    return TypeChoices.Array;
  } else {
    return type as TypeChoices; // TODO: remove AS
  }
}


