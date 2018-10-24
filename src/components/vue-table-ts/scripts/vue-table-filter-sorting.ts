import VueTableFilter from './vue-table-filter';
import { VueTableState, VueTableSortingColumn } from './vue-table-state';
import VueTableData from './vue-table-data';
import { VueTableColumnType } from './vue-table-column';

export class VueTableFilterSorting extends VueTableFilter {
	public filter(data: VueTableData, state: VueTableState): void {
		if (state.options.sortable) {
			if (state.sortingColumns && state.sortingColumns.length > 0) {
				let sortComparer = this.sortComparer;
				data.items.sort((item1, item2) => sortComparer(item1, item2, state.sortingColumns));
			}
		}
	}

	sortComparer(item1: any, item2: any, 
				 columnsSorting: VueTableSortingColumn[]): number {
		let result = 0;
		for (let i = 0; i < columnsSorting.length; i++) {
			let columnSorting = columnsSorting[i];
			let [a, b] = [item1[columnSorting.target.id], item2[columnSorting.target.id]];
			result = result || this.compare(
				this.getTypedValue(a, columnSorting.target.type), 
				this.getTypedValue(b, columnSorting.target.type), 
				columnSorting.direction);
		}
		return 0;
	}

	compare(a: any, b: any, direction: number) {
		return a > b
			? direction 
			: a < b
				? -direction 
				: 0;
	}

	getTypedValue(value: any, type: VueTableColumnType): any {
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
}