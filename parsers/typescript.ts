import { Attribute, Interface, MapObject, Type } from "../models";

export default function parse(interfaceObject: Interface): string {
  let outputString = `interface ${interfaceObject.name} {\n`
  outputString += convertAttributesToTypeScript(interfaceObject.attributes);
  outputString += "}"
  return outputString

  function convertAttributesToTypeScript(attributes: MapObject<Attribute>): string {
    return Object.entries(attributes).reduce((acc, [attributeName, attribute]) => {
      return acc + `   ${attributeName}${getTypeAnnotationFromAttribute(attribute)}\n`
    }, "")

    function getTypeAnnotationFromAttribute(attribute: Attribute) {
      const delimiter = attribute.isOptional ? "?:" : ":";
      return `${delimiter} ${getTypesString(attribute.types)}`

      function getTypesString(types: Array<Type>) {
        return types.reduce((acc, type, idx) => {
          let output = "";
          if (type.interfaceClass) {
            output = type.interfaceClass.name;
          } else if (type.acceptedValues.size > 0) {
            const vals = Array.from(type.acceptedValues);
            output = vals.slice(1).reduce((acc, currentVal) => acc + ` | ${typeof currentVal == "string" ? `"${currentVal}"` : currentVal}`, vals[0])
          } else {
            output = type.type;
          }
          const separator = idx > 0 ? " | " : ""
          if (type.generic.length > 0) {
            output += `<${getTypesString(type.generic)}>`
          }
          return acc + `${separator}${output}`
        }, "")
      }
    }
  }
}