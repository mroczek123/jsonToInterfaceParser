import { input } from "./example-input";
import generateInterfaceFromArrayOfObjects from "./generator";

const output = generateInterfaceFromArrayOfObjects(input.postings, "NoFluffJobs");
debugger;
console.log(output)