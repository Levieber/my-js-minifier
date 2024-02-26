function sum(var1, var2) {
	return var1 + var2;
}

function showInfo(name) {
	const age = sum(10, 7);
	const profession = "Software Developer";
	const message = `Hello, ${name}! You are ${age} years old and you are a ${profession}.`;
	console.log(message);
}

showInfo("Levi Eber");
