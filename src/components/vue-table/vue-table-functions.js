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
				let readableName = getReadableName(x);
				let [columnSortable, columnFiltrable, columnGroupable, columnHidable] = 
					[sortable || false, filtrable || false, groupable || false, hidable || false];
				return {
					id: x,
					name: readableName,
					type: defaultType,
					sortable: columnSortable,
					filtrable: columnFiltrable,
					groupable: columnGroupable,
					hidable: columnHidable,
					resizable: resizable || false,
					movable: movable || false,
					width: calculateWidth(readableName, columnHidable, columnFiltrable, columnGroupable, columnSortable)
				}
			case 'object':
				if (Array.isArray(x)){
					let readableName = x[1] || getReadableName(x[0]);
					let [columnSortable, columnFiltrable, columnGroupable, columnHidable] = 
						[sortable || false, filtrable || false, groupable || false, hidable || false];
					return {
						id: x[0],
						name: readableName,
						type: x[2] || defaultType,
						sortable: columnSortable,
						filtrable: columnFiltrable,
						groupable: columnGroupable,
						hidable: columnHidable,
						resizable: resizable || false,
						movable: movable || false,
						width: calculateWidth(readableName, columnHidable, columnFiltrable, columnGroupable, columnSortable)
					}
				}
				else {
					let readableName = x.name || getReadableName(x.id);
					let [columnSortable, columnFiltrable, columnGroupable, columnHidable] = 
						[
							x.sortable ||  sortable || false, 
							x.filtrable ||  filtrable || false, 
							x.groupable || groupable || false, 
							x.hidable || hidable || false
						];
					return {
						id: x.id,
						name: readableName,
						type: x.type || defaultType,
						sortable: columnSortable,
						filtrable: columnFiltrable,
						groupable: columnGroupable,
						hidable: columnHidable,
						resizable: x.resizable || resizable || false,
						movable: x.movable || movable || false,
						width: x.width || calculateWidth(readableName, columnHidable, columnFiltrable, columnGroupable, columnSortable)
					}
				}
		}
	})
}

export function getMinWidth(columnName) {
	if (screen.width < 1025) {
		if (screen.width < 500) {
			return columnName.length * 25 + 10; // 8
		}
		else {
			return columnName.length * 8 + 10; // 8
		}
	}
	else {
		return columnName.length * 8 + 10; // 8
	}
}

export function calculateWidth(columnName, hidable, filtrable, groupable, sortable) {
	if (screen.width < 1025) {
		let size = 17.5;
		return getMinWidth(columnName) + 
			(hidable ? 3 * size : 0) + 
			(filtrable ? 2 * size : 0) + 
			(groupable ? 3 * size : 0) + 
			(sortable ? 3 * size : 0);
	}
	else {
		return getMinWidth(columnName) + 
			(hidable ? 20 : 0) + 
			(filtrable ? 20 : 0) + 
			(groupable ? 30 : 0) + 
			(sortable ? 30 : 0);
	}
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

	if (state.sortingColumns && state.sortingColumns.length > 0) {
		data.items.sort((item1, item2) => sortComparer(item1, item2, state.sortingColumns));
	}
}

export function filter(data, state) {
	if (state.filteringColumns && state.filteringColumns.length > 0) {
		data.items = data.items.filter(value => {
			let result = true;
			for (let i = 0; i < state.filteringColumns.length; i++) {
				let filteringColumn = state.filteringColumns[i];
				result = result && 
					filteringColumn
						.filtering
						.filter
						.predicate(
							getTypedValue(value[filteringColumn.id], filteringColumn.type), 
							getTypedValue(filteringColumn.filtering.expected, filteringColumn.type));
			}
			return result;
		})
	}
}

export function group(data, state) {
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

export function page(data, state) {
	if (state.paging) {
		state.paging.count = state.paging.size == 0 ? 1 : Math.ceil(data.items.length / state.paging.size) || 1;
		if (state.paging.current > state.paging.count) {
			state.paging.current = state.paging.count;
		}
		if (state.paging.size !== 0) {
			let from = state.paging.size * (state.paging.current - 1);
			let to = state.paging.size * state.paging.current;
			data.items = data.items.slice(from, to);
		}
		data.paging = state.paging;
	}
}

