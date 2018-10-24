export class Column {
	constructor() {
		this.id;
		this.name;
		this.type;
		this.sortable;
		this.filtrable;
		this.groupable;
		this.resizable;
		this.width;
		this.grouping;
		this.resizing;
		this.sorting;
		this.filtering;
	}
}

export const columnFilters = { 
	'eq': { 
		predicate: (curr, exp) => curr === exp,
		title: 'Is equal to',
		type: 'all'
	},
	"neq": {
		predicate: (curr, exp) => curr !== exp,
		title: 'Is not equal to',
		type: 'all'
	}, 
	'null': {
		predicate: (curr) => curr === null,
		title: 'Is null',
		type: 'all',
		single: true
	}, 
	'nnull': {
		predicate: (curr) => curr !== null,
		title: 'Is not null',
		type: 'all',
		single: true
	}, 
	'greq': {
		predicate: (curr, exp) => +curr >= +exp,
		title: 'Is greater than or equal to',
		type: 'number'
	},
	'gr': {
		predicate: (curr, exp) => +curr > +exp,
		title: 'Is greater than',
		type: 'number'
	}, 
	'lseq': {
		predicate: (curr, exp) => +curr <= +exp,
		title: 'Is less than or equal to',
		type: 'number'
	}, 
	'ls': { 
		predicate: (curr, exp) => +curr < +exp,
		title: 'Is less than',
		type: 'number'
	}, 
	'strtwth': {
		predicate: (curr, exp) => curr.startsWith(exp),
		title: 'Starts with',
		type: 'string'
	}, 
	'endwth': {
		predicate: (curr, exp) => curr.endsWith(exp),
		title: 'Ends with',
		type: 'string'
	}, 
	'in': {
		predicate: (curr, exp) => curr.includes(exp),
		title: 'Contains',
		type: 'string'
	}, 
	'nin': {
		predicate: (curr, exp) => !curr.includes(exp),
		title: 'Does not contain',
		type: 'string'
	}, 
	'empt': {
		predicate: (curr, exp) => curr === "",
		type: 'Is empty',
		type: 'string'
	},
	'nempt': {
		predicate: (curr, exp) => curr !== "",
		type: 'Is not empty',
		type: 'string'
	}
};