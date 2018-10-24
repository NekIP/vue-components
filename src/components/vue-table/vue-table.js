import { getReadableName, sort, group, filter, page } from './vue-table-functions'
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
		pageSizes: {
			type: Array,
			default: [25, 50, 100, 0],
			required: false
		}
	},
	data: function () {
		return {
			state: { 
				sortable: this.sortable,
				sorting: [], 	/* { column: , direction: } */
				filtrable: this.filtrable,
				filtering: [],	/* { column: , filter: , expected: } */
				groupable: this.groupable,
				grouping: [],	/* column */
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
					current: 1
				}
			},
			gates: {
				filter,
				sort,
				group,
				page
			},
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
			return this.groupingColumns && this.groupingColumns.length > 0;
		},
		rows() {
			let result = {
				items: this.items,
				paging: null
			}
			for (let i = 0; i < this.gates; i++) {
				let gate = this.gates[i];
				gate(result, this.state);
			}
			return result;
		}
	},
	methods: {
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

		goToPage(i) {
			if (i > 0 && i <= this.pageCount) {
				this.page.number = i;
			}
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
		
		sort(column, group) {
			let direction = this.sorting.column == column 
				? (this.sorting.ascending ? -1 : 1)
				: 1;
			let getTypedValue = this.getTypedValue;
			let sortFunction = (x, y) => 
				getTypedValue(x[column.id], column.type) > getTypedValue(y[column.id], column.type)
					? direction 
					: getTypedValue(x[column.id], column.type) < getTypedValue(y[column.id], column.type)
						? -direction 
						: 0;
			if (!group) {
				this.items.sort(sortFunction);
			}
			else {
				for (let i in this.groupedData) {
					this.groupedData[i].sort(sortFunction);
				}
			}
			this.sorting.column = column;
			this.sorting.ascending = direction == 1 
				? true 
				: false;
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

		canShowPageNumber(i) {
			let num = Math.floor((this.page.number - 1) / this.maxCountOfPage) * this.maxCountOfPage;
			return i >= num && i < num + this.maxCountOfPage;
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