import * as acorn from "acorn";
import escodegen from "escodegen";
import updateMap from "./mapper-helper.js";

export default class SourceMapper {
	#sourceMap;
	#astHelper;
	#minifiedItems = new Map();

	constructor(sourceMap, astHelper) {
		this.#sourceMap = sourceMap;
		this.#astHelper = astHelper;
	}

	generateSourceMap({ minifiedFilePath, originalCode, minifiedCode, nameMap }) {
		const minifiedAst = acorn.parse(minifiedCode, {
			ecmaVersion: 2022,
			locations: true,
		});
		this.#traverse(minifiedAst);
		this.#generateSourceMapData({ minifiedFilePath, nameMap, originalCode });
		return this.#sourceMap.toString();
	}

	#generateSourceMapData({ minifiedFilePath, nameMap, originalCode }) {
		const originalItems = [...nameMap.values()];
		this.#sourceMap.setSourceContent(minifiedFilePath, originalCode);
		for (const { name, positions } of originalItems) {
			const minifiedPositions = this.#minifiedItems.get(name).positions;
			for (const [index, minifiedPosition] of minifiedPositions.entries()) {
				const originalPosition = positions[index];
				const mapping = {
					source: minifiedFilePath,
					original: originalPosition,
					generated: minifiedPosition,
					name,
				};
				this.#sourceMap.addMapping(mapping);
			}
		}
	}

	#traverse(node) {
		this.#astHelper
			.setVariableDeclarationHook((node) => {
				for (const declaration of node.declarations) {
					this.#handleDeclaration(declaration.id);
				}
			})
			.setFunctionDeclarationHook((node) => {
				this.#handleDeclaration(node.id);
				for (const param of node.params) {
					this.#handleDeclaration(param);
				}
			})
			.setIdentifierHook((node) => {
				const oldName = node.name;
				const name = this.#minifiedItems.get(oldName);
				if (!name) return;

				this.#handleDeclaration(node);
				node.name = name;
			})
			.traverse(node);
	}

	#handleDeclaration({ name, loc: { start } }) {
		updateMap(this.#minifiedItems, name, start);
	}
}
