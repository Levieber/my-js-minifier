export default class AstHelper {
	#variableDeclarationHook = () => {};
	#functionDeclarationHook = () => {};
	#identifierHook = () => {};

	setVariableDeclarationHook(fn) {
		this.#variableDeclarationHook = fn;
		return this;
	}

	setFunctionDeclarationHook(fn) {
		this.#functionDeclarationHook = fn;
		return this;
	}

	setIdentifierHook(fn) {
		this.#identifierHook = fn;
		return this;
	}

	traverse(node) {
		const handlers = {
			VariableDeclaration: this.#variableDeclarationHook,
			FunctionDeclaration: this.#functionDeclarationHook,
			Identifier: this.#identifierHook,
		};

		handlers[node?.type]?.(node);

		for (const key in node) {
			if (typeof node[key] !== "object") continue;

			this.traverse(node[key]);
		}
	}
}
