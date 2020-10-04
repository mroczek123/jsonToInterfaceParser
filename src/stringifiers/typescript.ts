import { StringifierFunction } from ".";
import { Attribute, Enum, Interface, MapObject, Settings, Type, TypeChoices } from "../models";

const stringifyToTypeScript: StringifierFunction = function (input: Interface | Enum, settings: Settings): string {
  if (input instanceof Interface) {
    return interfaceToTypeScript(input)
  } else if (input instanceof Enum) {
    return enumToTypeScript(input)
  }

  function interfaceToTypeScript(interfaceObject: Interface) {
    let outputString = `interface ${interfaceObject.name} {\n`;
    outputString += convertAttributesToTypeScript(interfaceObject.attributes);
    outputString += "}\n";
    return outputString;

    function convertAttributesToTypeScript(attributes: MapObject<Attribute>): string {
      const indent = " ".repeat(settings.stringifyingSettings.indentSpacesAmount);
      return Object.entries(attributes).reduce((acc, [attributeName, attribute]) => {
        return acc + `${indent}${attributeName}${attribute.isOptional ? "?:" : ":"}${stringifyTypesToTypeScript(attribute.types)};\n`;
      }, "");
    }
  }

  function enumToTypeScript(input: Enum): string {
    const indent = " ".repeat(settings.stringifyingSettings.indentSpacesAmount);
    let outputString = `enum ${input.name} {\n`
    outputString += Object.entries(input.attributeValueMap).reduce((acc, [attributeName, value]) => acc + `${indent}${stringifyEnumAttribute(attributeName, value)}\n`, "")
    outputString += "}\n"
    return outputString

    function stringifyEnumAttribute(attributeName: string, attributeValue: any): string {
      return `${attributeName} = ${stringifyValueToTypeScript(attributeValue, settings.stringifyingSettings.stringQuotes)}`
    }
  }
}

function stringifyTypesToTypeScript(types: Array<Type>): string {
  return types.map((type) => stringifyTypeToTypeScript(type)).join(" | ");
}

function stringifyTypeToTypeScript(type: Type): string {
  let typeString = "";
  if (type.type instanceof Interface || type.type instanceof Enum) {
    typeString = type.type.name;
  } else if (typeof type.type in TypeChoices) {
    typeString = type.type;
  }

  if (type.generic.length > 0) {
    typeString += `<${stringifyTypesToTypeScript(type.generic)}>`;
  }
  return typeString
}


function stringifyValueToTypeScript(value: any, stringWrapper: "'" | '"' | "`") {
  const type = typeof value;
  if (type == "string") {
    const areSingleQuotes = value.indexOf("'") > -1;
    const areDoubleQuotes = value.indexOf('"') > -1;
    let delimiter = stringWrapper;
    if (areSingleQuotes && !areDoubleQuotes) {
      delimiter = `"`;
    } else if (!areSingleQuotes && areDoubleQuotes) {
      delimiter = `'`;
    } else if (areSingleQuotes && areDoubleQuotes) {
      delimiter = "`";
    }
    return `${delimiter}${value}${delimiter}`;
  }
  return value;
}

export default stringifyToTypeScript;