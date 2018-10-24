import VueTableFilter from './vue-table-filter';
import { VueTableState } from './vue-table-state';
import VueTableData from './vue-table-data';

export class VueTableFilterPaging extends VueTableFilter {
	public filter(data: VueTableData, state: VueTableState): void {
		if (state.options.pageable) {
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
}