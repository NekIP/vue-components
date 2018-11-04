function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateId(length = 8) {
	let id = "";
	for (let i = 0; i < length; i++) {
	   let index = getRandomInt(0, 9);
	   id += index;
	}
	return id;
}