<template>
	<div class='report-table'>
		<div class='col-sm-12 group-area'
			 @dragenter="columnDragEnter(groupAreaName)"
			 @dragend="columnDragEnd()">
		</div>
		<table class="table">
			<tfoot>
				<tr>
					<th v-for="column in currentColumns">
						<slot :name="column + '-footer'"
							  :cols="cols[column]">
						</slot>
					</th>
				</tr>
			</tfoot>
			<thead>
				<tr>
					<th  v-for="column in currentColumns" 
						 draggable="true"
						 @dragstart="columnDragStart(column)"
						 @dragenter="columnDragEnter(column)"
						 @dragend="columnDragEnd()"
						 @click="sort(column)">
						<slot :name="column + '-header'"
							  :cols="cols[column]">
							{{getReadableName(column)}}
						</slot>
						<span v-show="current.sorting.name === column">
							{{current.sorting.ascending ? 'asc' : 'desc'}}
						</span>
					</th>
				</tr>
			</thead>
			<tbody>
				<tr v-show="!current.grouping.length" 
					v-for="item in getPage()">
					<td v-for="column in currentColumns">
						<slot :name="column + '-column'" 
							  :value="item[column]">
							{{item[column]}}
						</slot>
					</td>
				</tr>

			</tbody>
		</table>
		<div class=col-sm-12>
			<button @click="firstPage()">--</button>
			<button @click="prevPage()">-</button>
			<template v-for="(item, i) in new Array(pageCount)">
				{{i + 1 == current.page.number ? ('>' + (i + 1) + '<') : (i + 1)}}
			</template>
			<button @click="nextPage()">></button>
			<button @click="lastPage()">>></button>
			<select v-model="current.page.size">
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
		data: function () {
			return {
				current: {
					sorting: {
						name: '',
						ascending: false
					},
					filter: {
						name: '',
						mode: 'eq'
					},
					grouping: [],
					page: {
						size: this.pageSizes[0],
						number: 1
					},
					movableColumn: {
						dragable: '',
						dropable: ''
					}
				},
				currentColumns: this.columns.map(x => x),
				groupAreaName: '*group-area*'
				/*columnsCash: null*/
			}
		},
		computed: {
			cols: function () {
				let result = {};
				for (let i in this.currentColumns) {
					let column = this.currentColumns[i];
					result[column] = this.data.map(x => x[column]);
				}
				return result;
			},
			pageCount: function () {
				if (this.current.page.size == 0) {
					return 1;
				}
				return Math.ceil(this.data.length / this.current.page.size);
			},
			group: function () {
				let data = this.data;
				let columns = this.current.grouping;
				let result = [];
				for (let j = 0; j < data.length; j++) {
					for (let k = j; k < data.length; k++) {
						let equal = true;
						let values = [];
						for (let i = 0; i < columns.length; i++) {
							if (data[j][columns[i]] != data[k][columns[i]]) {
								equal = false;
								break;
							}
							values.push(data[k][columns[i]]);
						}
						if (equal) {
							if (!result[values]) {
								result[values] = [];
							}
							if (result[values].indexOf(data[k]) == -1) {
								result[values].push(data[k]);
							}
						}
					}
				}
				return result;
			}
			/*currentColumns: function () {
				let columns = this.columns;
				let columnsCash = this.columnsCash;
				if (this.columnsCash == null
					|| columnsCash.some(x => columns.indexOf(x) < 0) 
					|| columns.some(x => columnsCash.indexOf(x) < 0)) {
					this.columnsCash = columns.map(x => x);
					return this.columnsCash;
				}
				return columnsCash;
			}*/
		},
		methods: {
			getReadableName: function (name) {
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
			getPage: function () {
				if (this.current.page.number > this.pageCount) {
					this.current.page.number = 1;
				}
				if (+this.current.page.size == 0) {
					return this.data;
				}
				let from = this.current.page.size * (this.current.page.number - 1);
				let to = this.current.page.size * this.current.page.number;
				return this.data.slice(from, to);
			},
			getGroupedPage: function () {
				if (this.current.page.number > this.pageCount) {
					this.current.page.number = 1;
				}
				if ((this.current.page.size + "").toLowerCase() === 'all') {
					return this.group;
				}
				if (+this.current.page.size === 0) {
					return {};
				}
				let result = {};
				let num = 0;
				let size = (this.current.page.size + "").toLowerCase() === 'all' ? 1000000 : this.current.page.size;
				let from = size * (this.current.page.number - 1);
				let to = size * this.current.page.number;
				for (let key in this.group) {
					for (let i in this.group[key]) {
						if (from <= num && num < to) {
							if (!result[key]) {
								result[key] = []
							}
							result[key].push(this.group[key][i]);
						}
						num++;
					}
				}
				return result;
			},
			nextPage: function () {
				if (this.current.page.number < this.pageCount) {
					this.current.page.number++;
				}
			},
			prevPage: function () {
				if (this.current.page.number > 1) {
					this.current.page.number--;
				}
			},
			lastPage: function () {
				this.current.page.number = this.pageCount;
			},
			firstPage: function () {
				this.current.page.number = 1;
			},
			columnDragStart: function (column) {
				this.current.movableColumn.dragable = column;
			},
			columnDragEnter: function (column) {
				this.current.movableColumn.dropable = column;
			},
			columnDragEnd: function () {
				let dragable = this.current.movableColumn.dragable;
				let dropable = this.current.movableColumn.dropable;
				if (!dragable || !dropable) {
					return;
				}
				if (dragable != dropable) {
					if (dropable == this.groupAreaName) {
						this.current.grouping.push(dragable);
					}
					else {
						let indexOfDragable = this.currentColumns.indexOf(dragable);
						let indexOfDropable = this.currentColumns.indexOf(dropable);
						if (indexOfDropable > 0) {
							this.currentColumns.splice(indexOfDragable, 1);
							if (indexOfDragable < indexOfDropable) {
								this.currentColumns.splice(indexOfDropable, 0, dragable);
							}
							else {
								this.currentColumns.splice(indexOfDropable, 0, dragable);
							}
						}
					}
				}
				this.current.movableColumn.dragable = '';
				this.current.movableColumn.dropable = '';
				this.$forceUpdate();
			},
			sort: function (column) {
				let direction = this.current.sorting.name == column 
					? (this.current.sorting.ascending ? -1 : 1)
					: 1;
				this.data.sort((x, y) => 
					x[column] > y[column] 
					? direction 
					: x[column] < y[column] 
						? -direction 
						: 0);
				this.current.sorting.name = column;
				this.current.sorting.ascending = direction == 1 
					? true 
					: false;
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

