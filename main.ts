import { input } from "./example-inputs/example-input";
import {Converter} from "./generator";
import TypeScriptParser from "./parsers/typescript";

const converter = new Converter();
const output = converter.convertToInterface(input.postings, "NoFluffJobs")
Object.values(converter.interfacesRegistry).forEach((interfaceObject) => console.log(TypeScriptParser(interfaceObject)));
debugger;