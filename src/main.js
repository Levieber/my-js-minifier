import path from "node:path";
import { SourceMapGenerator } from "source-map";
import AstHelper from "./ast-helper.js";
import Minifier from "./minifier.js";
import SourceMapper from "./source-mapper.js";
import Processor from "./processor.js";

const start = performance.now();

const filePath = path.resolve(process.argv[2]);
const minifiedFilePath = filePath.replace(".js", ".min.js");
const minifiedFileBasename = path.basename(minifiedFilePath);

console.log(`Generating source map and minifying code for ${filePath}...`);

const sourceMapGenerator = new SourceMapGenerator({
	file: minifiedFileBasename,
});
const minifier = new Minifier(new AstHelper());
const sourceMapper = new SourceMapper(
	sourceMapGenerator,
	new AstHelper(),
);
const processor = new Processor(minifier, sourceMapper);

await processor.run({ minifiedFilePath, minifiedFileBasename, filePath });

console.log("Code minified and source map generated successfully! 🎉");
console.log(`Took ${(performance.now() - start).toFixed(2)} ms to complete.`);
