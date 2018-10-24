export function getReadableName(name) {
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

export function getTypedValue(value, type) {
	switch (type) {
		case VueTableColumnType.date:
			/* TODO: use moment.js */
			return Date.parse(value);
		case VueTableColumnType.string:
			return value;
		case VueTableColumnType.number:
			return +value;
		case VueTableColumnType.boolean:
			return !!value;
	}
}

export function sort(data, state) {
	function sortComparer(item1, item2, sorting) {
		let result = 0;
		for (let i = 0; i < sorting.length; i++) {
			let sortingItem = sorting[i];
			let [a, b] = [item1[sortingItem.column.id], item2[sortingItem.column.id]];
			result = result || this.compare(
				getTypedValue(a, sortingItem.column.type), 
				getTypedValue(b, sortingItem.column.type), 
				sortingItem.direction ? 1 : -1);
		}
		return 0;
	}

	function compare(a, b, direction) {
		return a > b
			? direction 
			: a < b
				? -direction 
				: 0;
	}

	if (state.sortable) {
		if (state.sorting && state.sorting.length > 0) {
			let sortComparer = this.sortComparer;
			data.items.sort((item1, item2) => sortComparer(item1, item2, state.sorting));
		}
	}
}

export function filter(data, state) {
	if (state.filtrable) {
		if (state.filtering && state.filtering.length > 0) {
			data.items = data.items.filter(value => {
				let result = true;
				for (let i = 0; i < state.filtering.length; i++) {
					let filteringItem = state.filtering[i];
					result = result && 
						filteringItem
							.filter
							.predicate(value, filteringItem.expected);
				}
				return result;
			})
		}
	}
}

export function group(data, state) {
	if (state.groupable) {
		if (state.grouping && state.grouping.length > 0) {
			for (let i = 0; i < data.items.length; i++) {
				let item = data.items[i];
				let valueOfGroupingFields = [];
				for (let j = 0; j < state.grouping.length; j++) {
					let groupingColumn = state.grouping[j];
					let value = item[groupingColumn.id];
					valueOfGroupingFields.push(value);
				}
				item["$_grouping_values"] = valueOfGroupingFields;
			}
		}
	}
}

export function page(data, state) {
	if (state.pageable) {
		if (state.paging) {
			if (state.paging.size == 0) {
				return;
			}
			let from = state.paging.size * (state.paging.current - 1);
			let to = state.paging.size * state.paging.current;
			data.items = data.items.slice(from, to);
			data.paging = state.paging;
		}
	}
}

