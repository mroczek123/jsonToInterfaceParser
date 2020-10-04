import { StringifierFunction } from ".";
import { Attribute, Enum, Interface, MapObject, QuoteChoices, Settings, Type, TypeChoices } from "../models";



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
        return acc + `${indent}${attributeName}${attribute.isOptional ? "?:" : ":"} ${stringifyTypesToTypeScript(attribute.types.filter(type => type.type !== TypeChoices.undefined))};\n`;
      }, "");
    }
  }

  function enumToTypeScript(input: Enum): string {
    const indent = " ".repeat(settings.stringifyingSettings.indentSpacesAmount);
    let outputString = `enum ${input.name} {\n`
    outputString += Object.entries(input.attributeValueMap).reduce((acc, [attributeName, value]) => acc + `${indent} ${stringifyAttributeName(attributeName)} = ${stringifyEnumAttributeValue(value)},\n`, "")
    outputString += "}\n"
    return outputString

    function stringifyAttributeName(name: string) {
      let output = name.split(" ").join("_");
      return output;
    }
    function stringifyEnumAttributeValue(attributeValue: any): string {
      return `${stringifyValueToTypeScript(attributeValue, settings.stringifyingSettings.stringQuotes)}`
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


function stringifyValueToTypeScript(value: any, defaultQuote: QuoteChoices) {
  const type = typeof value;
  if (type == "string") {
    const delimiter = chooseQuote(value, defaultQuote);
    return `${delimiter}${value}${delimiter}`;
  }
  return value;
}

function chooseQuote(value: string, preferred: QuoteChoices) {
  let output = preferred;
  const areSingleQuotes = value.includes("'");
  const areDoubleQuotes = value.includes('"');
  if (areSingleQuotes && !areDoubleQuotes) {
    output = QuoteChoices.DOUBLE;
  } else if (!areSingleQuotes && areDoubleQuotes) {
    output = QuoteChoices.SINGLE;
  } else if (areSingleQuotes && areDoubleQuotes) {
    output = QuoteChoices.CURVA;
  }
  return output;
}

export default stringifyToTypeScript;