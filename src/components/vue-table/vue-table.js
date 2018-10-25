import { getReadableName, removeItemInArray, indexOfItemInArray, getColumns, sort, group, filter, page } from './vue-table-functions'
import { Column, columnFilters } from './vue-table-data';
import vClickOutside from 'v-click-outside'

export default {
	directives: {
        clickOutside: vClickOutside.directive
    },
	name: 'report-table',
	props: {
		items: {
			type: Array,
			required: true
		},
		columns: {
			type: Array,
			required: true
		}, 
		filtrable: {
			type: Boolean,
			default: true,
			required: false
		}, 
		sortable: {
			type: Boolean,
			default: true,
			required: false
		},
		groupable: {
			type: Boolean,
			default: true,
			required: false
		},
		movable: {
			type: Boolean,
			default: true,
			required: false
		},
		resizable: {
			type: Boolean,
			default: true,
			required: false
		},
		pageable: {
			type: Boolean,
			default: true,
			required: false
		},
		hidable: {
			type: Boolean,
			default: true,
			required: false
		},
		pageSizes: {
			type: Array,
			default: function () {
				return [25, 50, 100, 0];
			},
			required: false
		}
	},
	data: function () {
		return {
			state: { 
				columns: [],

				sortable: this.sortable,
				sortingColumns: [], 	/* { column: , direction: } */

				filtrable: this.filtrable,
				filteringColumns: [],	/* { column: , filter: , expected: } */

				groupable: this.groupable,
				groupingColumns: [],

				hidable: this.hidable,
				hidingColumns: [],

				movable: this.movable,
				moving: {
					dragable: null,
					dropable: null
				},

				resizable: this.resizable,
				resizing: {
					column: null,
					mousePosition: {
						x: null,
						y: null
					}
				},

				pageable: this.pageable,
				paging: {
					size: this.pageSizes[0],
					count: this.countPage(this.pageSizes[0]),
					current: 1
				},

				recalculate: 1
			},
			gates: [
				filter,
				sort,
				group,
				page
			],
			filteringModes: columnFilters,
			groupAreaName: '*group-area*',
			minWidthBias: 100,
			hiddenColumnSize: 20,
			maxCountOfPage: 5,
		}
	},
	created () {
		this.state.columns = getColumns(
			this.columns, 
			this.sortable,
			this.filtrable,
			this.groupable,
			this.resizable,
			this.movable,
			this.hidable);
	},
	watch: {
		'state.paging.size': function(size) {
			this.state.paging.count = this.countPage(size);
			if (this.state.paging.current > this.state.paging.count) {
				this.state.paging.current = this.state.paging.count;
			}
		}
	},
	computed: {
		hasGrouped() {
			return this.state.groupingColumns && this.state.groupingColumns.length > 0;
		},
		data() {
			let recalulate = this.state.recalculate;
			let result = {
				items: this.items,
				paging: null
			}
			for (let i = 0; i < this.gates.length; i++) {
				let gate = this.gates[i];
				gate(result, this.state);
			}
			return result;
		}
	},
	methods: {
/* SORTING */
		sortByMany(column) {
			if (this.state.sortable || this.state.groupable) {
				if (!column.sortingDirection) {
					column.sortingDirection = 1;
					this.state.sortingColumns.push(column);
				}
				else {
					column.sortingDirection = column.sortingDirection === -1 ? 1 : -1;
					this.forceUpdate();
				}
			}
		},

		sortByOne(column) {
			if (this.state.sortable || this.state.groupable) {
				if (!column.sortingDirection) {
					this.cleanSorting();
				}
				this.sortByMany(column);
			}
		},

		cleanSorting() {
			for (let i = this.state.sortingColumns.length - 1; i >= 0; i--) {
				let column = this.state.sortingColumns[i];
				let indexOfColumnInGrouping = this.state.groupingColumns.indexOf(column);
				if (indexOfColumnInGrouping < 0) {
					this.removeColumnForSorting(column)
				}
			}
		},

		removeColumnForSorting(column) {
			column.sortingDirection = undefined;
			removeItemInArray(this.state.sortingColumns, column, x => x);
		},

/* GROUPING */
		addColumForGrouping(column) {
			if (this.state.groupable) {
				this.cleanSorting();
				this.sortByMany(column);
				column.grouping = true;
				this.state.groupingColumns.push(column);
			}
		},

		getGroupingItems() {
			let result = [];
			let current = new Array(this.state.groupingColumns.length);
			for (let i = 0; i < this.data.items.length; i++) {
				let item = this.data.items[i];
				let groupingValues = item.$_grouping_values;
				let mismatchOnPrevStep = false; 
				for (let j = 0; j < groupingValues.length; j++) {
					if (current[j] !== groupingValues[j] || mismatchOnPrevStep) {
						mismatchOnPrevStep = true;
						current[j] = groupingValues[j];
						result.push({
							level: j + 1,
							group: groupingValues[j],
							column: this.state.groupingColumns[j]
						});
					}
				}
				result.push({
					level: groupingValues.length,
					item: item
				});
			}
			return result;
		},

		removeColumForGrouping(column) {
			column.grouping = false;
			removeItemInArray(this.state.groupingColumns, column, x => x);
		},

/* FILTERING */
		addColumForFiltering(column) {
			if (column.filtering && !column.filtering.enabled) {
				column.filtering.enabled = true;
				this.state.filteringColumns.push(column);
			}
			this.forceUpdate();
		},

		removeColumForFiltering(column) {
			if (column.filtering) {
				column.filtering.enabled = false;
				removeItemInArray(this.state.filteringColumns, column, x => x);
				this.forceUpdate();
			}
		},

		selectFilter(column, mode) {
			column.filtering.filter = this.filteringModes[mode];
			if (column.filtering.filter.single || column.filtering.expected) {
				this.addColumForFiltering(column);
			}
		},

		selectValueForFilter(column, value) {
			if (column.filtering) {
				column.filtering.expected = value;
				if (value) {
					this.addColumForFiltering(column);
				}
				else {
					this.removeColumForFiltering(column);
				}
			}
		},

		showFilterForm(column) {
			if (!column.filtering) {
				column.filtering = {
					filter: this.filteringModes.eq,
					expected: '',
					enabled: false
				};
			}
			column.showFilterForm = true;
			this.forceUpdate();
		},

		hideFilterForm(column) {
			column.showFilterForm = false;
			this.forceUpdate();
		},

/* PAGING */
		goToPage(i) {
			if (i > 0 && i <= this.state.paging.count) {
				this.state.paging.current = i;
			}
		},

		canShowPageNumber(i) {
			let num = Math.floor((this.state.paging.current - 1) / this.maxCountOfPage) * this.maxCountOfPage;
			return i >= num && i < num + this.maxCountOfPage;
		},

		countPage(size) {
			return size == 0 ? 1 : Math.ceil(this.items.length / size)
		},

/* RESIZING */
		beginResizeColumn(column, event) {
			let columnElement = event.target.parentNode.parentNode.parentNode;
			this.state.resizing.column = column;
			if (!this.state.resizing.column.width) {
				this.state.resizing.column.width = this.getMinWidth(column) + this.minWidthBias;
			}
			this.state.resizing.mousePosition.x = event.clientX;
		},

		resizeColumn(event) {
			if (this.state.resizing.column) {
				let currentPosMouseX = event.clientX;
				let currentWidth = this.state.resizing.column.width;
				let deff = currentPosMouseX - this.state.resizing.mousePosition.x;
				let minWidth = this.getMinWidth(this.state.resizing.column) + this.minWidthBias;
				if (deff > 0 || currentWidth + deff > minWidth) {
					this.state.resizing.column.width += currentPosMouseX - this.state.resizing.mousePosition.x;
					this.state.resizing.mousePosition.x = currentPosMouseX;
				}
			}
		},

		stopResizeColumn() {
			this.state.resizing.column = null;
			this.state.resizing.mousePosition.x = null;
		},

/* MOVING */
		moveColumn(from, to) {
			let indexOfDragable = this.state.columns.indexOf(from);
			let indexOfDropable = this.state.columns.indexOf(to);
			if (indexOfDropable > -1) {
				this.state.columns.splice(indexOfDragable, 1);
				this.state.columns.splice(indexOfDropable, 0, from);
			}
		},

/* HIDDING */
		hideColumn(column, event) {
			column.hidden = true;
			this.forceUpdate();
		},

		showColumn(column, event) {
			column.hidden = false;
			this.forceUpdate();
		},

/* SIZES */
		getTableWidth() {
			let self = this;
			let result = this.state.columns.reduce((a, b) => 
				a + (
					!b.hidden 
						? b.width || b.name.length * 18 + 50
						: self.hiddenColumnSize), 
				0);
			return result;
		},

		getMinWidth(column) {
			return column.name.length * 6 + 10;
		},

/* DRAG AND DROP */
		columnDragStart(column, event) {
			if (!this.state.resizing.column) {
				this.state.moving.dragable = column;
			}
			else {
				event.preventDefault();
			}
		},

		columnDragEnter(column, event) {
			if (!this.state.resizing.column) {
				this.state.moving.dropable = column;
			}
			else {
				event.preventDefault();
			}
		},

		columnDragEnd(event) {
			if (!this.state.resizing.column) {
				let dragableColumn = this.state.moving.dragable;
				let dropableColumn = this.state.moving.dropable;
				if (!dragableColumn || !dropableColumn) {
					return;
				}
				if (dragableColumn != dropableColumn) {
					if (dropableColumn == this.groupAreaName) {
						this.addColumForGrouping(dragableColumn);
					}
					else {
						this.moveColumn(dragableColumn, dropableColumn);
					}
				}
				this.state.moving.dragable = null;
				this.state.moving.dropable = null;
				this.forceUpdate();
			}
			else {
				event.preventDefault();
			}
		},

/* OTHER */
		getCells(items, key) {
			let result = [];
			for (let i in items) {
				let item = items[i];
				result.push(item[key]);
			}
			return result;
		},

		forceUpdate() {
			this.state.recalculate = -this.state.recalculate;
			this.$forceUpdate();
		}
	}
}