import { input } from "./example-inputs/example-input";
import { Converter } from "./generator";
import TypeScriptParser from "./parsers/typescript";
import * as fs from "fs";

const converter = new Converter();
converter.convertToInterface(input.postings, "NoFluffJobs")
const tsString = Object.values(converter.interfacesRegistry).reduce((acc, interfaceObject) => acc+TypeScriptParser(interfaceObject), "");
fs.writeFile("interfejsy.ts", tsString, () => {})
