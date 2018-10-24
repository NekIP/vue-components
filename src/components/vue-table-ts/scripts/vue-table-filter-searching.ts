import VueTableFilter from './vue-table-filter';
import { VueTableState } from './vue-table-state';
import VueTableData from './vue-table-data';

export class VueTableFilterSearching extends VueTableFilter {
	public filter(data: VueTableData, state: VueTableState): void {
		if (state.options.filtrable) {
			if (state.searchingColumns && state.searchingColumns.length > 0) {
				data.items = data.items.filter(value => {
					let result = true;
					for (let i = 0; i < state.searchingColumns.length; i++) {
						let searchingColumn = state.searchingColumns[i];
						result = result && searchingColumn.predicate(value);
					}
					return result;
				})
			}
		}
	}
}