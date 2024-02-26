import * as acorn from "acorn";
import escodegen from "escodegen";
import updateNameMap from "./mapper-helper.js";

export default class Minifier {
	#astHelper;
	#nameMap = new Map();
	#alphabet = Array.from(
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
	);

	constructor(astHelper) {
		this.#astHelper = astHelper;
	}

	minifyCodeAndReturnMapNames(originalCode) {
		const originalAst = acorn.parse(originalCode, {
			ecmaVersion: 2022,
			locations: true,
		});
		this.#traverse(originalAst);
		const minifiedCode = escodegen.generate(originalAst, {
			format: {
				compact: true,
			},
		});
		return { minifiedCode, nameMap: this.#nameMap };
	}

	#generateNameIfNotExists(name) {
		if (this.#nameMap.has(name)) {
			return this.#nameMap.get(name);
		}

		if (!this.#alphabet) {
			throw new Error("Ran out of variable names!");
		}

		return this.#alphabet.shift();
	}

	#handleDeclaration(declaration) {
		const oldName = declaration.name;
		const newName = this.#generateNameIfNotExists(oldName);
		updateNameMap(this.#nameMap, oldName, declaration.loc.start, newName);
		declaration.name = newName;
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
				const name = this.#nameMap.get(oldName)?.name;

				if (!name) return;

				node.name = name;
				updateNameMap(this.#nameMap, oldName, node.loc.start, name);
			})
			.traverse(node);
	}
}
