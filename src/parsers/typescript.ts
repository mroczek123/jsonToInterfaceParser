import { Attribute, Interface, MapObject, Type } from "../models";

export default function parse(interfaceObject: Interface): string {
  let outputString = `interface ${interfaceObject.name} {\n`;
  outputString += convertAttributesToTypeScript(interfaceObject.attributes);
  outputString += "}\n";
  return outputString;

  function convertAttributesToTypeScript(attributes: MapObject<Attribute>): string {
    return Object.entries(attributes).reduce((acc, [attributeName, attribute]) => {
      return acc + `  ${attributeName}${attribute.isOptional ? "?:" : ":"}${getTypesString(attribute.types)};\n`;
    }, "");

    function getTypesString(types: Array<Type>) {
      const stringifiedTypes = types.map((type) => {
        let genericString = "";
        if (type.generic.length > 0) {
          genericString += `<${getTypesString(type.generic)}>`;
        }
        if (type.interfaceClass) {
          return type.interfaceClass.name + genericString;
        } else if (type.acceptedValues.size > 0) {
          const vals = Array.from(type.acceptedValues).map((val) => getParsedValue(val));
          return vals.join(" | ") + genericString;
        } else {
          return type.type + genericString;
        }
      });
      return stringifiedTypes.join(" | ");
    }
  }
}

function getParsedValue(value: any) {
  const type = typeof value;
  if (type == "string") {
    const areSingleQuotes = value.indexOf("'") > -1;
    const areDoubleQuotes = value.indexOf('"') > -1;
    let delimiter = "'";
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
