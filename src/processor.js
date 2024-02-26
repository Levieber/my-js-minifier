import fs from "node:fs/promises";

export default class Processor {
	#minifier;
	#sourceMapper;

	constructor(minifier, sourceMapper) {
		this.#minifier = minifier;
		this.#sourceMapper = sourceMapper;
	}

	async run({ filePath, minifiedFilePath, minifiedFileBasename }) {
		const sourceMapUrl = `//# sourceMappingURL=${minifiedFileBasename}.map`;
		const originalCode = await fs.readFile(filePath, "utf-8");

		const { minifiedCode, nameMap } =
			this.#minifier.minifyCodeAndReturnMapNames(originalCode);

		const sourceMap = this.#sourceMapper.generateSourceMap({
			minifiedFilePath,
			originalCode,
			minifiedCode,
			nameMap,
		});

		await fs.writeFile(minifiedFilePath, `${minifiedCode}\n${sourceMapUrl}`);
		await fs.writeFile(`${minifiedFilePath}.map`, sourceMap);
	}
}
