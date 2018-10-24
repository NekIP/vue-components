import VueTableFilter from './vue-table-filter';
import { VueTableState } from './vue-table-state';
import VueTableData from './vue-table-data';

export class VueTableFilterGrouping extends VueTableFilter {
	public filter(data: VueTableData, state: VueTableState): void {
		if (state.options.groupable) {
			if (state.groupingColumns && state.groupingColumns.length > 0) {
				let result: any = {};
				for (let i = 0; i < data.items.length; i++) {
					let item = data.items[i];
					let valueOfGroupingFields: any[] = [];
					for (let j = 0; j < state.groupingColumns.length; j++) {
						let column = state.groupingColumns[j];
						let value = item[column.target.id];
						valueOfGroupingFields.push(value);
					}
					item["$_grouping_values"] = valueOfGroupingFields;
				}
				return result;
			}
		}
	}
}