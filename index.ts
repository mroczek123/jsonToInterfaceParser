import { Interface, AggregatedObject, Attribute, Type, MapObject, TypeChoices, Settings, TypeConverterFunctionInterface, Enum } from "./src/models";
import { StringifierFunction } from "./src/stringifiers";
import stringifyToTypeScript from "./src/stringifiers/typescript";
import { considerArrayType, considerObjectType, considerOtherTypes, considerStringType } from "./src/type-converters/type-converters";

type Languages = "typescript";
export class Converter {
  private declarationsRegistry: { [name: string]: Interface | Enum } = {};

  private settings: Settings = {
    typeCheckers: {
      [TypeChoices.string]: considerStringType,
      [TypeChoices.Array]: considerArrayType,
      [TypeChoices.object]: considerObjectType,
    },
    stringifyingSettings: {
      stringQuotes: "'",
      indentSpacesAmount: 2
    }
  };

  private get typeConverters(): Array<TypeConverterFunctionInterface> {
    return Object.values(this.settings.typeCheckers).concat([considerOtherTypes]);
  }

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
    const aggregatedObject: AggregatedObject<any> = {};
    const allAttributes: Set<string> = new Set();
    objectsArray.forEach((object) => {
      Object.keys(object).forEach((attribute) => allAttributes.add(attribute));
      allAttributes.forEach((attribute) => {
        const value = object[attribute];
        Object.keys(aggregatedObject).includes(attribute) ? aggregatedObject[attribute].push(value) : (aggregatedObject[attribute] = []);
      });
    });
    return aggregatedObject;
  }

  determineTypes(vals: Array<any>, attributeName: string): Array<Type> {
    let types = [];
    let valsWithTypes = vals.map((val) => {
      const valType: Type = this.getValueType(val);
      return {
        type: valType,
        value: val,
      };
    });
    this.typeConverters.forEach((typeConverterFunction) => {
      const output = typeConverterFunction(valsWithTypes, attributeName, this);
      valsWithTypes = output.valsWithTypesArray;
      types = types.concat(output.discoveredTypes);
    });
    return types;
  }

  getOrCreateInterface(interfaceName: string, attributes: MapObject<Attribute>) {
    // TODO: if all attributes match some existing interface, then dont create new one only return existing
    const calculatedName = this.calculateName(interfaceName);
    const createdInterface = new Interface(calculatedName, attributes);
    this.declarationsRegistry[calculatedName] = createdInterface;
    return createdInterface;
  }

  getOrCreateEnum(enumName: string, attributeValueMap: MapObject<any>) {
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

  private getValueType(val: any): Type {
    const type = typeof val;
    if (val === null) {
      return new Type(TypeChoices.null);
    } else if (Array.isArray(val)) {
      return new Type(TypeChoices.Array);
    } else {
      return new Type(type as TypeChoices); // TODO: remove AS
    }
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
