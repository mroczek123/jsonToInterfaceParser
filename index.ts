import { Interface, AggregatedObject, Attribute, Type, MapObject, TypeChoices, Settings, TypeConverterFunctionInterface, Enum, QuoteChoices } from "./src/models";
import { StringifierFunction } from "./src/stringifiers";
import stringifyToTypeScript from "./src/stringifiers/typescript";
import { considerArrayType, considerObjectType, considerOtherTypes, considerStringType } from "./src/type-checkers/type-checkers";

type Languages = "typescript";
export class Converter {
  private declarationsRegistry: { [name: string]: Interface | Enum } = {};

  readonly settings: Settings = {
    typeCheckers: [
      considerStringType,
      considerArrayType,
      considerObjectType,
      considerOtherTypes
    ],
    stringifyingSettings: {
      stringQuotes: QuoteChoices.SINGLE,
      indentSpacesAmount: 2
    }
  };

  constructor(settings?: Settings) {
    if (settings) {
      Object.assign(this.settings.typeCheckers, settings.typeCheckers);
    }
  }

  convertToCode(objectsArray: Array<Object>, interfaceName: string, language: Languages): string {
    const stringifierFunction = this.getStringifier(language);
    this.convertToInterface(objectsArray, interfaceName);
    const output = Object.values(this.declarationsRegistry).reduce((acc, interfaceObject) => acc + stringifierFunction(interfaceObject, this.settings), "")
    this.cleanUp();
    return output
  }

  convertToInterface(objectsArray: Array<Object>, interfaceName: string) {
    const aggregatedObject = this.aggregateObject(objectsArray);
    const attributes: MapObject<Attribute> = Object.entries(aggregatedObject).reduce((acc, [key, values]) => {
      return Object.assign(acc, { [key]: new Attribute(this.determineTypes(values, key)) });
    }, {});
    return this.getOrCreateInterface(interfaceName, attributes);
  }

  private aggregateObject(objectsArray: Array<Object>) {
    const aggregatedObject: AggregatedObject<unknown> = {};
    const allAttributes: Set<string> = new Set();
    objectsArray.forEach((object) => {
      Object.keys(object).forEach((attribute) => allAttributes.add(attribute));
      allAttributes.forEach((attribute) => {
        const value = object[attribute];
        Array.isArray(aggregatedObject[attribute]) ? aggregatedObject[attribute].push(value) : aggregatedObject[attribute] = [value];
      });
    });
    return aggregatedObject;
  }

  determineTypes(vals: Array<unknown>, attributeName: string): Array<Type> {
    return this.settings.typeCheckers.reduce((acc, typeConverterFunction) => {
      return acc.concat(typeConverterFunction(vals, attributeName, this)) 
    }, []);
  }

  getOrCreateInterface(interfaceName: string, attributes: MapObject<Attribute>) {
    // TODO: if all attributes match some existing interface, then dont create new one only return existing
    const calculatedName = this.calculateName(interfaceName);
    const createdInterface = new Interface(calculatedName, attributes);
    this.declarationsRegistry[calculatedName] = createdInterface;
    return createdInterface;
  }

  getOrCreateEnum(enumName: string, attributeValueMap: MapObject<unknown>) {
    // TODO: if all attributeValueMap match some existing enum, then dont create new one only return existing
    const calculatedName = this.calculateName(enumName);
    const newEnum = new Enum(enumName, attributeValueMap);
    this.declarationsRegistry[calculatedName] = newEnum;
    return newEnum;
  }

  private calculateName(name: string): string {
    let nameIter = 0;
    let canidateName = name;
    while (Object.keys(this.declarationsRegistry).findIndex((nameIter) => nameIter == canidateName) > -1) {
      nameIter++;
      canidateName = `${name}${nameIter}`;
    }
    return canidateName;
  }

  private cleanUp() {
    this.declarationsRegistry = {};
  }

  private getStringifier(language: Languages): StringifierFunction {
    switch (language) {
      case "typescript": return stringifyToTypeScript;
    }
  }
}
