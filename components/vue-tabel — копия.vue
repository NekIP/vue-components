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
				<template v-show="current.grouping.length"
					v-for="(group, name) in getGroupedPage()">
					<tr :colspan="currentColumns.length">
						{{name}}
					</tr>
					<tr v-for="item in group">	
						<td v-for="column in currentColumns">
							<slot :name="column + '-column'" 
								:value="item[column]">
								{{item[column]}}
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
				{{i + 1 == current.page.number ? ('>' + (i + 1) + '<') : (i + 1)}}
			</template>
			<button @click="nextPage()">></button>
			<button @click="lastPage()">>></button>
			<select v-model="current.page.size">
				<option v-for="size in pageSizes" :value="size">{{size}}</option>
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
				default: [2, 50, 100, 'all']
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
				if ((this.current.page.size + "").toLowerCase() === 'all') {
					return 1;
				}
				return Math.ceil(this.data.length / this.current.page.size);
			},
			group: function () {
				let grouping = this.current.grouping;
				if (grouping && grouping.length) {
					let result = this.data;
					for (let i = 0; i < grouping.length; i++) {
						let groupColumn = grouping[i];
						result = this.groupBy(result, groupColumn);
					}
					return result;
				}
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
				if ((this.current.page.size + "").toLowerCase() === 'all') {
					return this.data;
				}
				if (+this.current.page.size === 0) {
					return [];
				}
				return this.data.filter((item, i) => 
					i >= this.current.page.size * (this.current.page.number - 1)
					&& i < this.current.page.size * this.current.page.number);
			},
			getGroupedPage: function () {
				if (this.current.page.number > this.pageCount) {
					this.current.page.number = 1;
				}
				if ((this.current.page.size + "").toLowerCase() === 'all') {
					return this.group;
				}
				if (+this.current.page.size === 0) {
					return [];
				}
				return this.group;
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
			columnDragEnd: function (event) {
				let dragable = this.current.movableColumn.dragable;
				let dropable = this.current.movableColumn.dropable;
				if (!dragable || !dropable) {
					return;
				}
				if (dragable != dropable) {
					if (dropable == this.groupAreaName) {
						console.log(this.groupBy(this.data, dragable));
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
			},
			groupBy: function(data, column) {
				let result = data.reduce(function (prev, item) { 
					let val = item[column];
					if (val in prev) {
						prev[val].push(item);
					}
					else {
						prev[val] = [item];
					}
					return prev; 
				}, {});
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

