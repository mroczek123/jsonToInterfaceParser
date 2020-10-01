import { Interface, AggregatedObject, Attribute, Type, MapObject, TypeChoices, Settings, TypeConverterFunctionInterface } from "./src/models";
import { considerArrayType, considerObjectType, considerOtherTypes, considerStringType } from "./src/type-checkers/type-checkers";

export class Converter {
  interfacesRegistry: { [name: string]: Interface } = {};

  settings: Settings = {
    typeCheckers: {
      [TypeChoices.string]: considerStringType,
      [TypeChoices.Array]: considerArrayType,
      [TypeChoices.object]: considerObjectType,
    },
  };

  get typeConverters(): Array<TypeConverterFunctionInterface> {
    return Object.values(this.settings.typeCheckers).concat([considerOtherTypes]);
  }

  constructor(settings?: Settings) {
    if (settings) {
      Object.assign(this.settings.typeCheckers, settings.typeCheckers);
    }
  }

  convertToInterface(objectsArray: Array<Object>, interfaceName: string) {
    const aggregatedObject = this.aggregateObject(objectsArray);
    const attributes: MapObject<Attribute> = Object.entries(aggregatedObject).reduce((acc, [key, values]) => {
      return Object.assign(acc, { [key]: new Attribute(this.determineTypes(values, key)) });
    }, {});
    return this.createInterfaceAndRegister(interfaceName, attributes);
  }

  aggregateObject(objectsArray: Array<Object>) {
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

  createInterfaceAndRegister(interfaceName: string, attributes: MapObject<Attribute>) {
    const calculatedName = this.calculateInterfaceName(interfaceName);
    const createdInterface = new Interface(calculatedName, attributes);
    this.interfacesRegistry[calculatedName] = createdInterface;
    return createdInterface;
  }

  calculateInterfaceName(name: string): string {
    let nameIter = 0;
    let canidateName = name;
    while (Object.keys(this.interfacesRegistry).findIndex((nameIter) => nameIter == canidateName) > -1) {
      nameIter++;
      canidateName = `${name}${nameIter}`;
    }
    return canidateName;
  }

  getValueType(val: any): Type {
    const type = typeof val;
    if (val === null) {
      return new Type(TypeChoices.null);
    } else if (Array.isArray(val)) {
      return new Type(TypeChoices.Array);
    } else {
      return new Type(type as TypeChoices);
    }
  }
}
