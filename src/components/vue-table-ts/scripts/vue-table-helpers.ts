export default class VueTableHelpers {
	static getReadableName(name: string): string {
		let result = name[0].toUpperCase();
		for (let i = 1; i < name.length; i++) {
			let c = name[i];
			let cUpper = c.toUpperCase();
			if ('0123456789'.indexOf(c) === -1 && cUpper === c) {
				result += ' ' + cUpper;
			}
			else {
				result += c;
			}
		}
		return result;
	}
}