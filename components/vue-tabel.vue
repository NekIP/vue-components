<template>
	<div class='report-table'>
		<div class='col-sm-12 group-area'
			 @dragenter="columnDragEnter(groupAreaName)"
			 @dragend="columnDragEnd()">
			 <div v-for="groupingColumn in groupingColumns">
				{{groupingColumn.name}}
				<button @click="ungroup(groupingColumn)">X</button>
				<button @click="sort(groupingColumn)">sort</button>
			 </div>
		</div>
		<table class="table">
			<tfoot>
				<tr>
					<th v-for="i in groupingColumns"></th>
					<th v-for="column in columnsInfo">
						<slot :name="column.id + '-footer'"
							  :cells="getCells(data, column.id)">
						</slot>
					</th>
				</tr>
			</tfoot>
			<thead>
				<tr>
					<th v-for="i in groupingColumns"></th>
					<th  v-for="column in columnsInfo" 
						 draggable="true"
						 @dragstart="columnDragStart(column)"
						 @dragenter="columnDragEnter(column)"
						 @dragend="columnDragEnd()"
						 @click="sort(column, hasGrouped)">
						<slot :name="column.id + '-header'"
							  :cells="getCells(data, column.id)">
							{{column.name}}
						</slot>
						<span v-show="sorting.column === column">
							{{sorting.ascending ? 'asc' : 'desc'}}
						</span>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-if="!hasGrouped" 
					v-for="item in getItemsOnCurrentPage()">
					<td v-for="column in columnsInfo">
						<slot :name="column.id + '-column'" 
							  :value="item[column.id]">
							{{item[column.id]}}
						</slot>
					</td>
				</tr>
				<template v-if="hasGrouped" 
						  v-for="(items, key) in getGroupedItemsOnCurrentPage()">
					<tr v-for="(groupValue, i) in key.split(groupDelimeterChar)">
						<th v-for="trash in new Array(i + 1)"></th>
						<th :colspan="groupingColumns.length + columnsInfo.length - i - 1">
							<slot :name="groupingColumns[i].id + '-group'" 
								:cells="getCells(items, groupingColumns[i].id)"
								:value="groupValue">
								{{groupingColumns[i].name}}: {{groupValue}}
							</slot>
						</th>
					</tr>
					<tr v-for="item in items">
						<th v-for="i in groupingColumns"></th>
						<td v-for="column in columnsInfo">
							<slot :name="column.id + '-column'" 
								:value="item[column.id]">
								{{item[column.id]}}
							</slot>
						</td>
					</tr>
				</template>
			</tbody>
		</table>
		<div class=col-sm-12>
			<button @click="firstPage()">--</button>
			<button @click="prevPage()">-</button>
			<template v-for="(item, i) in new Array(pageCount)">
				{{i + 1 == page.number ? ('>' + (i + 1) + '<') : (i + 1)}}
			</template>
			<button @click="nextPage()">></button>
			<button @click="lastPage()">>></button>
			<select v-model="page.size">
				<option v-for="size in pageSizes" :value="size">{{size == 0 ? 'all' : size}}</option>
			</select>
		</div>
	</div>
</template>
<script>
	export default {
		name: 'report-table',
		props: {
			data: {},
			columns: {}, 
			filtrable: {}, 
			sortable: {},
			groupable: {},
			pageSizes: {
				default: [25, 50, 100, 0]
			}
		},
		data() {
			return {
				sorting: {
					column: null,
					ascending: false
				},
				filteringColumn: {
					id: '',
					mode: 'eq'
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
				columnsInfo: this.getColumnsInfo(),
				groupAreaName: '*group-area*',
				groupDelimeterChar: ';' /* &#8006; */
				/*columnsCash: null*/
			}
		},
		computed: {
			pageCount() {
				if (this.page.size == 0) {
					return 1;
				}
				return Math.ceil(this.data.length / this.page.size);
			},
			groupedData() {
				let data = this.data;
				let columns = this.groupingColumns;
				let result = {};
				for (let i = 0; i < data.length; i++) {
					let item = data[i];
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
						result[key] = []
					}
					result[key].push(item);
				}
				return result;
			},
			hasGrouped() {
				return this.groupingColumns && this.groupingColumns.length > 0;
			}
		},
		methods: {
			getColumnsInfo() {
				const defaultType = 'string';
				return this.columns.map(x => {
					switch (typeof(x)) {
						case 'string':
							return {
								id: x,
								name: this.getReadableName(x),
								type: defaultType,
								sortable: this.sortable || false,
								filtrable: this.filtrable || false,
								groupable: this.groupable || false
							}
						case 'object':
							if (Array.isArray(x)){
								return {
									id: x[0],
									name: x[1] || this.getReadableName(x[0]),
									type: x[2] || defaultType,
									sortable: this.sortable || false,
									filtrable: this.filtrable || false,
									groupable: this.groupable || false
								}
							}
							else {
								return {
									id: x.id,
									name: x.name || this.getReadableName(x.id),
									type: x.type || defaultType,
									sortable: x.sortable ||  this.sortable || false,
									filtrable: x.filtrable ||  this.filtrable || false,
									groupable: x.groupable || this.groupable || false
								}
							}
					}
				})
			},

			getReadableName(name) {
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
			},

			getItemsOnCurrentPage() {
				if (this.page.number > this.pageCount) {
					this.page.number = 1;
				}
				if (+this.page.size == 0) {
					return this.data;
				}
				let from = this.page.size * (this.page.number - 1);
				let to = this.page.size * this.page.number;
				return this.data.slice(from, to);
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

			columnDragStart(column) {
				this.movableColumn.dragable = column;
			},

			columnDragEnter(column) {
				this.movableColumn.dropable = column;
			},

			columnDragEnd() {
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
					this.data.sort(sortFunction);
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
				this.groupingColumns.push(column);
				this.sorting.column = null;
				this.sorting.ascending = false;
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

			getCells(data, key) {
				let result = [];
				for (let i in data) {
					let item = data[i];
					result.push(item[key]);
				}
				return result;
			}
		}
	}
</script>
<style>
	.group-area {
		height: 100px;
		background: blue;
	}
</style>

