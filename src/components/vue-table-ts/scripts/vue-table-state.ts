import VueTableColumn, { VueTableColumnType } from './vue-table-column'
import VueTableOptions from './vue-table-options'
import { VueTablePaging } from './vue-table-data';

export enum VueTableSortingColumnDirection {
	ascending = 1,
	descending = -1
}

export class VueTableSortingColumn {
	constructor(
		public target: VueTableColumn,
		public direction: VueTableSortingColumnDirection
	) { }
}

export class VueTableSearchingColumn {
	private methods: any = { 
		'eq': (curr: any, exp: any): boolean => curr === exp,
		"neq": (curr: any, exp: any): boolean => curr === exp, 
		'null': (curr: any, exp: any): boolean => curr === null, 
		'nnull': (curr: any, exp: any): boolean => curr !== null, 
		'greq': (curr: any, exp: any): boolean => +curr >= +exp, 
		'gr': (curr: any, exp: any): boolean => +curr > +exp, 
		'lseq': (curr: any, exp: any): boolean => +curr <= +exp, 
		'ls': (curr: any, exp: any): boolean => +curr < +exp, 
		'strtwth': (curr: any, exp: any): boolean => curr.startsWith(exp), 
		'endwth': (curr: any, exp: any): boolean => curr.endsWith(exp), 
		'in': (curr: any, exp: any): boolean => curr.includes(exp), 
		'nin': (curr: any, exp: any): boolean => !curr.includes(exp), 
		'empt': (curr: any, exp: any): boolean => curr === "",
		'nempt': (curr: any, exp: any): boolean => curr !== "",
	}

	constructor(
		public target: VueTableColumn,
		public expected: any,
		public methodName: string
	) { }

	public predicate(current: any): boolean {
		return this.methods[this.methodName](current, this.expected);
	}
}

export class VueTableGroupingColumn {
	constructor(
		public target: VueTableColumn
	) { }
}

export class VueTableState {
	constructor(
		public columns: VueTableColumn[],
		public options: VueTableOptions,
		public sortingColumns: VueTableSortingColumn[],
		public searchingColumns: VueTableSearchingColumn[],
		public groupingColumns: VueTableGroupingColumn[],
		public paging: VueTablePaging
	) { }
}