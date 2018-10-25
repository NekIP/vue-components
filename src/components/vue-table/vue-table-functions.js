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

export function indexOfItemInArray(array, item, selector) {
	let result = -1;
	for (let i = 0; i < array.length; i++) {
		if (selector(array[i]) === item) {
			result = i;
			break;
		}
	}
	return result;
}

export function removeItemInArray(array, item, selector) {
	let indexOfItem = indexOfItemInArray(array, item, selector);
	if (indexOfItem !== -1) {
		array.splice(indexOfItem, 1);
	}
}

export function itemExistInArray(array, item, selector) {
	let indexOfItem = indexOfItemInArray(array, item, selector);
	if (indexOfItem !== -1) {
		return false;
	}
	return true;
}

export function getColumns( columns, 
							sortable, 
							filtrable, 
							groupable, 
							resizable, 
							movable,
							hidable) {
	const defaultType = 'string';
	return columns.map(x => {
		switch (typeof(x)) {
			case 'string':
				return {
					id: x,
					name: getReadableName(x),
					type: defaultType,
					sortable: sortable || false,
					filtrable: filtrable || false,
					groupable: groupable || false,
					resizable: resizable || false,
					movable: movable || false,
					hidable: hidable || false,
					width: undefined
				}
			case 'object':
				if (Array.isArray(x)){
					return {
						id: x[0],
						name: x[1] || getReadableName(x[0]),
						type: x[2] || defaultType,
						sortable: sortable || false,
						filtrable: filtrable || false,
						groupable: groupable || false,
						resizable: resizable || false,
						movable: movable || false,
						hidable: hidable || false,
						width: undefined
					}
				}
				else {
					return {
						id: x.id,
						name: x.name || getReadableName(x.id),
						type: x.type || defaultType,
						sortable: x.sortable ||  sortable || false,
						filtrable: x.filtrable ||  filtrable || false,
						groupable: x.groupable || groupable || false,
						resizable: x.resizable || resizable || false,
						movable: x.movable || movable || false,
						hidable: x.hidable || hidable || false,
						width: x.width
					}
				}
		}
	})
}

export function getTypedValue(value, type) {
	switch (type) {
		case 'date':
			/* TODO: use moment.js */
			return Date.parse(value);
		case 'string':
			return value;
		case 'number':
			return +value;
		case 'boolean':
			return !!value;
	}
}

export function sort(data, state) {
	function sortComparer(item1, item2, sortingColumns) {
		let result = 0;
		for (let i = 0; i < sortingColumns.length; i++) {
			let sortingColumn = sortingColumns[i];
			let [a, b] = [item1[sortingColumn.id], item2[sortingColumn.id]];
			result = result || compare(
				getTypedValue(a, sortingColumn.type), 
				getTypedValue(b, sortingColumn.type), 
				sortingColumn.sortingDirection);
		}
		return result;
	}

	function compare(a, b, direction) {
		return a > b
			? direction 
			: a < b
				? -direction 
				: 0;
	}

	if (state.sortable) {
		if (state.sortingColumns && state.sortingColumns.length > 0) {
			data.items.sort((item1, item2) => sortComparer(item1, item2, state.sortingColumns));
		}
	}
}

export function filter(data, state) {
	if (state.filtrable) {
		if (state.filteringColumns && state.filteringColumns.length > 0) {
			data.items = data.items.filter(value => {
				let result = true;
				for (let i = 0; i < state.filteringColumns.length; i++) {
					let filteringItem = state.filteringColumns[i];
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
		if (state.groupingColumns && state.groupingColumns.length > 0) {
			for (let i = 0; i < data.items.length; i++) {
				let item = data.items[i];
				let valueOfGroupingFields = [];
				for (let j = 0; j < state.groupingColumns.length; j++) {
					let groupingColumn = state.groupingColumns[j];
					let value = item[groupingColumn.id];
					valueOfGroupingFields.push(value);
				}
				item.$_grouping_values = valueOfGroupingFields;
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

