<template>
	<div class='vue-table'>

		<div class='group-area'
			 @dragenter="columnDragEnter(groupAreaName)"
			 @dragend="columnDragEnd()">
			<div v-for="groupingColumn in groupingColumns">
				{{groupingColumn.name}}
				<button @click="ungroup(groupingColumn)">X</button>
				<button @click="sort(groupingColumn)">sort</button>
			</div>
			<template v-if="!hasGrouped">
				Drag a column header and drop it here to group by that column
			</template>
		</div>

		<table class="table">

			<tfoot class="footer">
				<tr>
					<th v-for="i in groupingColumns"></th>
					<th v-for="column in columnsInfo">
						<slot :name="column.id + '-footer'"
							  :cells="getCells(data, column.id)">
						</slot>
					</th>
				</tr>
			</tfoot>

			<thead class="header">
				<tr>
					<th class="column" v-for="i in groupingColumns"></th>

					<th  v-for="column in columnsInfo"
						 class="column"
						 draggable="true"
						 @dragstart="columnDragStart(column)"
						 @dragenter="columnDragEnter(column)"
						 @dragend="columnDragEnd()"
						 @click="sort(column, hasGrouped)"
						 :style="{ 'min-width': getMinWidth(column) + 81 }">

						<div class="container"
							 @mousemove="showHint(column)"
						 	 @mouseout="hideHint(column)">
							<div class="name hint hint--bottom hint--info"
								 :data-hint="column.name"
								 :style="{ 'width': getMinWidth(column) }">
								<slot :name="column.id + '-header'"
									:cells="getCells(data, column.id)">
									{{column.name}}
								</slot>
								<span v-show="sorting.column === column">
									<transition name="sort-ascending" mode="out-in">
										<i v-show="sorting.ascending" 
											class="fa fa-arrow-up arrow" 
											aria-hidden="true"></i>
									</transition>
									<transition name="sort-descending" mode="out-in">
										<i v-show="!sorting.ascending" 
											class="fa fa-arrow-down arrow" 
											aria-hidden="true"></i>
									</transition>
								</span>
							</div>

							<div class="group"
								 @click="groupingColumns.indexOf(column) > -1 ? ungroup(column) : group(column)">
								<i v-show="groupingColumns.indexOf(column) === -1" 
								   class="fa fa-object-group" 
								   aria-hidden="true"></i>
								<i v-show="groupingColumns.indexOf(column) !== -1" 
								   class="fa fa-object-ungroup" 
								   aria-hidden="true"></i>
							</div>

							<div class="filter">
								<i class="fa fa-filter" aria-hidden="true"></i>
							</div>

						</div>
						<!--
							<div class="hint-container">
								<div class="hint">
									{{column.name}}
								</div>
							</div>
						-->
					</th>
				</tr>
			</thead>

			<tbody class="body">

				<tr v-if="!hasGrouped" 
					v-for="item in getItemsOnCurrentPage()"
					:key="item"
					class="lighting-row">
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
					<tr v-for="(item, i) in items"
						class="lighting-row">
						<template v-if="i === 0">
							<th :rowspan="items.length" v-for="i in groupingColumns"></th>
						</template>
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

		<div class="col-sm-12">
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
				groupDelimeterChar: ';',
				hints: {}	// show hint
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

			getCells(data, key) {
				let result = [];
				for (let i in data) {
					let item = data[i];
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
			}
		}
	}
</script>
<style lang="scss">
	$rotate-speed: 0.15s;
	$rotate-angle: 180deg;

	.vue-table {
		font-family: 'Open Sans', sans-serif;
		font-size: 12px;

		.group-area {
			background-color: #415090;
			border-radius: 3px 3px 0 0;
			border-color: #e6e6e6;
			border-bottom-style: solid;
    		border-bottom-width: 1px;
			color: rgba(255,255,255,.5);
			line-height: 2;
			margin: 0;
    		padding: .75em .2em .8333em 1em;
   			cursor: default;
		}

		.table {
			font-family: 'Open Sans', sans-serif;
			font-size: 12px;

			.header { 
				.column {
					color: #fff;
					background: #adaeb0;
					font-weight: 700;
					text-transform: uppercase;
					overflow: visible;
					text-overflow: ellipsis;
					border-style: solid;
					border-width: 0 0 1px 1px;
					padding: .5em .6em .4em .6em;
					cursor: pointer;

					.container {
						display: flex;
						flex-direction: row;
						width: auto;
						padding: 0px;

						.name {
							flex-basis: 100%;

							.arrow {
								color: #415090;
								text-transform: lowercase;
								margin: 0 0 0 3px;
							}
						}

						.filter {
							font-size: 16px;
						}

						.group {
							font-size: 16px;
							margin: 0 5px 0 0;
						}
					}

					.hint-container {
						position: relative;
						display: none/*flex*/;
						justify-content: center;
						width: 100%;

						.hint {
							display: inline-block;
							position: absolute;
							top: 2px;
							margin: 0 auto;
							padding: 6px 5px 6px 5px;
							width: auto;
							background: #3349a7;
							border-radius: 3px;
							box-shadow: 0px 2px 1px rgba(0, 0, 0, 0.25);
							text-transform: none;
							font-weight: 400;
						}
					}
				}

				.hint:before {
					border-bottom-color: #adaeb0;
				}

				.hint:after {
					text-transform: none;
					background-color: #3349a7;
				}

				@mixin animation($cog, $speed) {
    				-webkit-animation-name: $cog;
					-webkit-animation-duration: $speed;
					-webkit-animation-iteration-count: infinite;
					-webkit-animation-timing-function: linear;
					-moz-animation-name: $cog;
					-moz-animation-duration: $speed;
					-moz-animation-iteration-count: infinite;
					-moz-animation-timing-function: linear;
					-ms-animation-name: $cog;
					-ms-animation-duration: $speed;
					-ms-animation-iteration-count: infinite;
					-ms-animation-timing-function: linear;
					
					animation-name: $cog;
					animation-duration: $speed;
					animation-iteration-count: infinite;
					animation-timing-function: linear;
				}

				.sort-descending-enter-active {
					border: 2px solid #77777750;
					border-radius: 30px;
					@include animation(cog, $rotate-speed);
				}
				.sort-descending-leave-active {
					display: none;
				}
				.sort-ascending-enter-active {
					border: 2px solid #77777750;
					border-radius: 30px;
					@include animation(cog, $rotate-speed);
				}
				.sort-ascending-leave-active {
					display: none;
				}

				@-ms-keyframes cog {
					from { -ms-transform: rotate($rotate-angle); }
					to { -ms-transform: rotate(0deg); }
				}
				@-moz-keyframes cog {
					from { -moz-transform: rotate($rotate-angle); }
					to { -moz-transform: rotate(0deg); }
				}
				@-webkit-keyframes cog {
					from { -webkit-transform: rotate($rotate-angle); }
					to { -webkit-transform: rotate(0deg); }
				}
				@keyframes cog {
					from {
						transform:rotate($rotate-angle);
					}
					to {
						transform:rotate(0deg);
					}
				}

				.flip-list-move {
					transition: transform 5s;
				}
			}

			.body {
				td {
					line-height: 1em;
    				font-size: 11px;
					padding: .4em .6em;
					overflow: hidden;
					vertical-align: middle;
					text-overflow: ellipsis;
					border-style: solid;
    				border-color: #ccc;
					border-width: 0 0 1px 1px;
					background-color: #ffffff;
				}

				th {
					background-color: #f2f2f2;
					border-style: solid;
    				border-color: #ccc;
					border-width: 1px 0 1px 1px;
				}

				.lighting-row:hover {
					td {
						background-color: #ececec;
					}
				}
			}

			.footer {
				th {
					line-height: 1em;
    				font-size: 12px;
					padding: .4em .6em;
					overflow: hidden;
					vertical-align: middle;
					text-overflow: ellipsis;
					border-style: solid;
    				border-color: #ccc;
					border-width: 0 0 1px 1px;
					background: #3349a7;
					background-color: #f2f2f2;
					font-weight: 700;
				}
			}
		}
	}
</style>

