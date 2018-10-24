import Vue from "vue";
import { VueTableState } from './vue-table-state';
import VueTableFilter from "./vue-table-filter";
import { VueTableFilterSorting } from "./vue-table-filter-sorting";
import { VueTableFilterGrouping } from "./vue-table-filter-grouping";
import { VueTableFilterSearching } from "./vue-table-filter-searching";
import { VueTableFilterPaging } from "./vue-table-filter-paging";
import VueTableData, { VueTablePaging } from "./vue-table-data";
import VueTableColumn from "./vue-table-column";
import VueTableOptions from "./vue-table-options";

export default Vue.extend({
	props: {
		items: {
			required: true,
			type: Array as () => any[]
		},
		columns: {
			required: true,
			type: Array as () => any[]
		},
		sortable: {
			required: false,
			type: Boolean,
			default: true
		},
		groupable: {
			required: false,
			type: Boolean,
			default: false
		},
		filtrable: {
			required: false,
			type: Boolean,
			default: true
		},
		resizable: {
			required: false,
			type: Boolean,
			default: false
		},
		pageable: {
			required: false,
			type: Boolean,
			default: true
		},
		pageSizes: {
			required: false,
			default: [25, 50, 100, 0]
		}
	},
	data() {
		class Data {constructor(
			public tableState?: VueTableState,
			public filters: VueTableFilter[] = [
				new VueTableFilterSearching(),
				new VueTableFilterSorting(),
				new VueTableFilterGrouping(),
				new VueTableFilterPaging()
			]
		) { }};
		return new Data();
	},
	created() {
		this.tableState = this.getTableState();
	},
	computed: {
		rows() {
			let result = new VueTableData(this.items.map(x => x));
			for (let key in this.filters) {
				let filter = this.filters[key];
				if (!this.tableState) {
					this.tableState = this.getTableState();
				}
				filter.filter(result, this.tableState);
			}
		}
	},
	methods: {
		getTableState(): VueTableState {
			let options = new VueTableOptions(
				this.sortable, 
				this.filtrable, 
				this.groupable, 
				this.resizable, 
				this.pageable
			);
			return new VueTableState(
				this.columns.map(x => VueTableColumn.map(x, options)),
				options, [], [], [],
				new VueTablePaging(this.pageSizes[0], 1, 
					this.pageSizes[0] == 0 
						? 1 
						: Math.ceil(this.items.length / this.pageSizes[0]))
			);
		}
	}
})