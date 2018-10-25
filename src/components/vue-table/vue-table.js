import { getReadableName, removeItemInArray, indexOfItemInArray, getColumns, sort, group, filter, page } from './vue-table-functions'
import { Column, columnFilters } from './vue-table-data';

export default {
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
			default: [25, 50, 100, 0],
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
			sorting: {
				column: null,
				ascending: false
			},
			filteringColumn: {
				id: '',
				mode: 'eq'
			},
			filteringModes: {
				'Is equal to': {
					type: 'all', 
					handler: (curr, exp) => curr === exp 
				},
				"Is not equal to": { 
					type: 'all', 
					handler: (curr, exp) => curr === exp 
				},
				'Is null': { 
					type: 'all', 
					handler: (curr, exp) => curr === null, 
					single: true 
				},
				'Is not null': { 
					type: 'all', 
					handler: (curr, exp) => curr !== null, 
					single: true 
				},
				'Is greater than or equal to': { 
					type: 'number', 
					handler: (curr, exp) => +curr >= +exp 
				},
				'Is greater than': { 
					type: 'number', 
					handler: (curr, exp) => +curr > +exp 
				},
				'Is less than or equal to': { 
					type: 'number',
					handler: (curr, exp) => +curr <= +exp 
				},
				'Is less than': { 
					type: 'number', 
					handler: (curr, exp) => +curr < +exp 
				},
				'Starts with': { 
					type: 'string', 
					handler: (curr, exp) => curr.startsWith(exp) 
				},
				'Ends with': { 
					type: 'string', 
					handler: (curr, exp) => curr.endsWith(exp) 
				},
				'Contains': { 
					type: 'string', 
					handler: (curr, exp) => curr.includes(exp) 
				},
				'Does not contain': { 
					type: 'string', 
					handler: (curr, exp) => !curr.includes(exp) 
				},
				'Is empty': { 
					type: 'string', 
					handler: (curr, exp) => curr === "", 
					single: true 
				},
				'Is not empty': {
					type: 'string', 
					handler: (curr, exp) => curr !== "", 
					single: true 
				},
			},
			groupingColumns: [],
			page: {
				size: this.pageSizes[0],
				number: 1
			},
			movableColumn: {
				dragable: null,
				dropable: null
			},
			columnsInfo: null,
			groupAreaName: '*group-area*',
			groupDelimeterChar: ';',
			resizable: {
				column: null,
				mousePositionX: null
			},
			minWidthBias: 100,
			hiddenColumnSize: 20,
			maxCountOfPage: 5,
			hints: {}	// show hint
			/*columnsCash: null*/
		}
	},
	created () {
		this.columnsInfo = this.getColumnsInfo();
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
		pageCount() {
			if (this.page.size == 0) {
				return 1;
			}
			return Math.ceil(this.items.length / this.page.size);
		},
		groupedData() {
			let items = this.items;
			let columns = this.groupingColumns;
			let result = {};
			for (let i = 0; i < items.length; i++) {
				let item = items[i];
				let key = "";
				for (let j = 0; j < columns.length; j++) {
					let column = columns[j];
					let field = item[column.id];
					if (j != columns.length - 1) {
						key += '' + field + this.groupDelimeterChar;
					}
					else {
						key += '' + field;
					}
				}
				if (!result[key]) {
					result[key] = [];
				}
				result[key].push(item);
			}
			return result;
		},
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
		sortByMany(column) {
			if (!column.sortingDirection) {
				column.sortingDirection = 1;
				this.state.sortingColumns.push(column);
			}
			else {
				column.sortingDirection = column.sortingDirection === -1 ? 1 : -1;
				this.forceUpdate();
			}
		},

		sortByOne(column) {
			if (!column.sortingDirection) {
				this.cleanSorting();
			}
			this.sortByMany(column);
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

		addColumForGrouping(column) {
			this.cleanSorting();
			this.sortByMany(column);
			column.grouping = true;
			this.state.groupingColumns.push(column);
		},

		removeColumForGrouping(column) {
			column.grouping = false;
			removeItemInArray(this.state.groupingColumns, column, x => x);
		},

		addColumForFiltering(column, filter) {
			column.filtering = filter;
			this.state.filtering.push(column);
		},

		removeColumForFiltering(column) {
			column.filtering = undefined;
			removeItemInArray(this.state.filtering, column);
		},

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
			console.log(result);
			return result;
		},



		getColumnsInfo() {
			const defaultType = 'string';
			let self = this;
			return this.columns.map(x => {
				switch (typeof(x)) {
					case 'string':
						return {
							id: x,
							name: getReadableName(x),
							type: defaultType,
							sortable: self.sortable || false,
							filtrable: self.filtrable || false,
							groupable: self.groupable || false,
							width: undefined
						}
					case 'object':
						if (Array.isArray(x)){
							return {
								id: x[0],
								name: x[1] || getReadableName(x[0]),
								type: x[2] || defaultType,
								sortable: self.sortable || false,
								filtrable: self.filtrable || false,
								groupable: self.groupable || false,
								width: undefined
							}
						}
						else {
							return {
								id: x.id,
								name: x.name || getReadableName(x.id),
								type: x.type || defaultType,
								sortable: x.sortable ||  self.sortable || false,
								filtrable: x.filtrable ||  self.filtrable || false,
								groupable: x.groupable || self.groupable || false,
								width: x.width
							}
						}
				}
			})
		},

		getItemsOnCurrentPage() {
			if (this.page.number > this.pageCount) {
				this.page.number = 1;
			}
			if (+this.page.size == 0) {
				return this.items;
			}
			let from = this.page.size * (this.page.number - 1);
			let to = this.page.size * this.page.number;
			return this.items.slice(from, to);
		},

		getGroupedItemsOnCurrentPage() {
			if (this.page.number > this.pageCount) {
				this.page.number = 1;
			}
			if (+this.page.size == 0) {
				return this.groupedData;
			}
			let result = {};
			let num = 0;
			let from = this.page.size * (this.page.number - 1);
			let to = this.page.size * this.page.number;
			for (let key in this.groupedData) {
				for (let i in this.groupedData[key]) {
					if (from <= num && num < to) {
						if (!result[key]) {
							result[key] = []
						}
						result[key].push(this.groupedData[key][i]);
					}
					num++;
				}
			}
			return result;
		},

		nextPage() {
			if (this.page.number < this.pageCount) {
				this.page.number++;
			}
		},

		prevPage() {
			if (this.page.number > 1) {
				this.page.number--;
			}
		},

		lastPage() {
			this.page.number = this.pageCount;
		},

		firstPage() {
			this.page.number = 1;
		},



		columnDragStart(column, event) {
			if (!this.resizable.column) {
				this.movableColumn.dragable = column;
			}
			else {
				event.preventDefault();
			}
		},

		columnDragEnter(column, event) {
			if (!this.resizable.column) {
				this.movableColumn.dropable = column;
			}
			else {
				event.preventDefault();
			}
		},

		columnDragEnd(event) {
			if (!this.resizable.column) {
				let dragableColumn = this.movableColumn.dragable;
				let dropableColumn = this.movableColumn.dropable;
				if (!dragableColumn || !dropableColumn) {
					return;
				}
				if (dragableColumn != dropableColumn) {
					if (dropableColumn == this.groupAreaName) {
						this.group(dragableColumn);
					}
					else {
						this.moveColumn(dragableColumn, dropableColumn);
					}
				}
				this.movableColumn.dragable = null;
				this.movableColumn.dropable = null;
				this.$forceUpdate();
			}
			else {
				event.preventDefault();
			}
		},

		group(column) {
			if (this.groupingColumns.indexOf(column) == -1) {
				this.groupingColumns.push(column);
				this.sorting.column = null;
				this.sorting.ascending = false;
			}
		},

		ungroup(column) {
			let i = this.groupingColumns.indexOf(column);
			this.groupingColumns.splice(i, 1);
			this.sorting.column = null;
			this.sorting.ascending = false;
		},

		moveColumn(from, to) {
			let indexOfDragable = this.columnsInfo.indexOf(from);
			let indexOfDropable = this.columnsInfo.indexOf(to);
			if (indexOfDropable > -1) {
				this.columnsInfo.splice(indexOfDragable, 1);
				this.columnsInfo.splice(indexOfDropable, 0, from);
			}
		},

		getTypedValue(value, type) {
			switch (type) {
				case 'date':
					/* TODO: use moment.js */
					return Date.parse(value);
				case 'string':
					return value;
				case 'number':
					return +value;
			}
		},

		getCells(items, key) {
			let result = [];
			for (let i in items) {
				let item = items[i];
				result.push(item[key]);
			}
			return result;
		},

		getMinWidth(column) {
			return column.name.length * 6 + 10;
		},

		showHint(column) {
			this.hints[column.id] = true;
			this.$forceUpdate();
		},

		hideHint(column) {
			this.hints[column.id] = false;
			this.$forceUpdate();
		},

		beginResizeColumn(column, event) {
			let columnElement = event.target.parentNode.parentNode.parentNode;
			this.resizable.column = column;
			this.resizable.column.width = columnElement.offsetWidth;
			this.resizable.mousePositionX = event.clientX;
		},

		resizeColumn(event) {
			if (this.resizable.column) {
				let currentPosMouseX = event.clientX;
				let currentWidth = this.resizable.column.width;
				let deff = currentPosMouseX - this.resizable.mousePositionX;
				let minWidth = this.getMinWidth(this.resizable.column) + this.minWidthBias;
				if (deff > 0 || currentWidth + deff > minWidth) {
					this.resizable.column.width += currentPosMouseX - this.resizable.mousePositionX;
					this.resizable.mousePositionX = currentPosMouseX;
				}
			}
		},

		stopResizeColumn() {
			this.resizable.column = null;
			this.resizable.mousePositionX = null;
		},

		getTableWidth() {
			let self = this;
			let result = this.columnsInfo.reduce((a, b) => 
				a + (
					!b.hidden 
						? b.width || b.name.length * 18 + 50
						: self.hiddenColumnSize), 
				0);
			return result;
		},

		hideColumn(column, event) {
			column.hidden = true;
			this.$forceUpdate();
		},

		showColumn(column, event) {
			column.hidden = false;
			this.$forceUpdate();
		},

		selectFilter(column, mode) {
			column.filter = this.filteringModes[mode];
			if (column.filter.single || column.filtrableValue) {
				this.$forceUpdate();
			}
		},

		selectValueForFilter(column, filtrableValue) {
			if (column.filter) {
				column.filtrableValue = filtrableValue;
				this.forceUpdate();
			}
		},

		forceUpdate() {
			this.state.recalculate = -this.state.recalculate;
			this.$forceUpdate();
		},

		filter(item) {
			for (let i = 0; i < this.columnsInfo.length; i++) {
				let column = this.columnsInfo[i];
				if (column.filter) {
					if (column.filter.handler) {
						return column.filter.handler(
							this.getTypedValue(item[column.id], column.type), 
							this.getTypedValue(column.filtrableValue, column.type));	
					}
				}
			}
			return true;
		},

		clearFilter(column) {
			column.filter = null;
			column.filtrableValue = null;
			this.forceUpdate();
		}
	}
}