import { input } from "./example-input";
import generateInterfaceFromArrayOfObjects from "./generator";

const output = generateInterfaceFromArrayOfObjects(input.postings, "NoFluffJobs");
console.log(output)