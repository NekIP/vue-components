export default class VueTableData {
	constructor(
		public items: any[],
		public paging?: VueTablePaging
	) { }
}

export class VueTablePaging {
	constructor(
		public size: number,
		public current: number,
		public count: number
	) { }
}
