<template>
	<div class='vue-table col-lg-12'
		@mousemove="resizeColumn($event)"
		@mouseup="stopResizeColumn()"
		v-scroll="scroll">
		<div class="false-header" :class="state.fixedHeader && false ? 'fixed-header' : ''">
			<div class='group-area'
					@dragenter="state.enabledGroupingArea ? columnDragEnter(groupAreaName, $event) : 0"
					@dragend="state.enabledGroupingArea ? columnDragEnd($event) : 0">
				<div 	class="group-item"
						v-for="groupingColumn in state.groupingColumns"
						:key="groupingColumn.key"
						@click="sortByMany(groupingColumn)"
						draggable="true"
						@dragstart="columnDragStart(groupingColumn, $event, enabledGroupingArea = false)"
						@dragenter="columnDragEnter(groupingColumn, $event)"
						@dragend="columnDragEnd($event, 'type: groupMove')">
					<div class="sort-icon">
						<span v-show="groupingColumn.sortingDirection">
							<transition name="sort-ascending" mode="out-in">
								<i 	v-show="groupingColumn.sortingDirection == 1" 
									class="fa fa-arrow-up arrow" 
									aria-hidden="true"></i>
							</transition>
							<transition name="sort-descending" mode="out-in">
								<i	v-show="groupingColumn.sortingDirection == -1" 
									class="fa fa-arrow-down arrow" 
									aria-hidden="true"></i>
							</transition>
						</span>
					</div>
					{{groupingColumn.name}}
					<div @click="removeColumForGrouping(groupingColumn)" class="ungroup">
						<i class="fa fa-times" aria-hidden="true"></i>
					</div>
				</div>
				<template v-if="!hasGrouped">
					Drag a column header and drop it here to group by that column
				</template>
			</div>

			<div class="table-container" :style="{ width: getTableWidth() }">
				<div class="table">
					<div class="header" v-if="state.fixedHeader && false">
						<div class="column" 
							:key="j"
							v-for="(trash, j) in state.groupingColumns" 
							:style="{ width: 24 }"></div>
						<div  v-for="column in state.columns"
							:key="column.id"
							class="column"
							:style="{ 
								width: column.hidden 
									? hiddenColumnSize
									: column.width || getMinWidth(column) + minWidthBias
							}">
							<div class="container">

									<template v-if="state.hidable">
										<div class="rol-up" @click="column.hidden ? showColumn(column, $event) : hideColumn(column, $event)">
											<transition name="sort-ascending" mode="out-in">
												<i  class="fa fa-caret-left" 
													role="button"
													aria-hidden="true"
													:title="'Hide column \'' + column.name + '\''"
													v-show="!column.hidden"></i>
											</transition>
											<transition name="sort-descending" mode="out-in">
												<i  class="fa fa-caret-right" 
													role="button"
													aria-hidden="true"
													:title="'Show column \'' + column.name + '\''"
													v-show="column.hidden"></i>
											</transition>
										</div>
									</template>

									<div 	class="name hint hint--bottom hint--info"
											:data-hint="column.name"
											:style="{ width: getMinWidth(column) }"
											@click.exact="state.sortable ? sortByOne(column) : 0"
											@click.ctrl="state.sortable ? sortByMany(column) : 0"
											draggable="true"
											@dragstart="state.groupable ? columnDragStart(column, $event) : 0"
											@dragenter="state.groupable ? columnDragEnter(column, $event) : 0"
											@dragend="state.groupable ? columnDragEnd($event) : 0"
											v-if="!column.hidden">
										<slot :name="column.id + '-header'"
												:cells="getCells(items, column.id)">
											{{column.name}}
										</slot>
										<template v-if="state.sortable">
											<span v-show="column.sortingDirection">
												<transition name="sort-ascending" mode="out-in">
													<i v-show="column.sortingDirection == 1" 
														class="fa fa-arrow-up arrow" 
														aria-hidden="true"></i>
												</transition>
												<transition name="sort-descending" mode="out-in">
													<i v-show="column.sortingDirection == -1"
														class="fa fa-arrow-down arrow" 
														aria-hidden="true"></i>
												</transition>
											</span>
										</template>
									</div>

									<template v-if="state.groupable">
										<div class="group"
											@click="column.grouping ? removeColumForGrouping(column) : addColumForGrouping(column)"
											v-if="!column.hidden">
											<i 	v-show="!column.grouping" 
												class="fa fa-object-group" 
												aria-hidden="true"
												:title="'Group column \'' + column.name + '\''"></i>
											<i 	v-show="column.grouping" 
												class="fa fa-object-ungroup" 
												aria-hidden="true"
												:title="'Ungroup column \'' + column.name + '\''"></i>
										</div>
									</template>

									<template v-if="state.filtrable">
										<div class="filter"
											v-if="!column.hidden"
											@click="showFilterForm(column)"
											:class="column.filtering && column.filtering.enabled ? 'filter-enabled' : ''"
											:title="'Filter \'' + column.name + '\''">
											<i class="fa fa-filter" aria-hidden="true"></i>
										</div>

										<div class="filter-container" 
											v-if="column.showFilterForm"
											v-click-outside="function (a, b) { hideFilterForm(column) }">
											<div class="filter-window">
												Show items with value that:
												<select @input="selectFilter(column, $event.target.value)"
														v-model="column.filtering.filterMode"
														class="filter-mods">
													<option v-for="(filteringMode, filteringModeName) in filteringModes" 
															v-if="filteringMode.type == 'all' || filteringMode.type == column.type"
															:value="filteringModeName">
														{{filteringMode.title}}
													</option>
												</select>
												<input 
													class="expected-value-input"
													@input="selectValueForFilter(column, $event.target.value)"
													v-model="column.filtering.expected"></input>
												<button class="clear-button" @click="removeColumForFiltering(column)">Clear</button>
											</div>
										</div>
									</template>

									<template v-if="state.resizable">
										<div class="mover-container"
											v-if="!column.hidden">
											<div class="mover"
												@mousedown="beginResizeColumn(column, $event)"></div>
										</div>
									</template>

								</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="table-container table-responsive">
			<table class="table" :style="{ width: getTableWidth() }">

				<tfoot class="footer">
					<tr>
						<th v-for="(trash, j) in state.groupingColumns" :key="j"></th>
						<th v-for="column in state.columns">
							<slot :name="column.id + '-footer'"
								v-if="!column.hidden"
								:cells="getCells(items, column.id)">
							</slot>
						</th>
					</tr>
				</tfoot>

				<thead class="header">
					<tr>
						<th class="column" 
							:key="j"
							v-for="(trash, j) in state.groupingColumns" 
							:style="{ width: 24 }"></th>

						<th  v-for="column in state.columns"
							:key="column.id"
							class="column"
							:style="{ 
								'min-width': getMinWidth(column) + minWidthBias, 
								width: column.hidden 
									? hiddenColumnSize
									: column.width || getMinWidth(column) + minWidthBias
							}">

							<div class="container">

								<template v-if="state.hidable">
									<div class="rol-up" @click="column.hidden ? showColumn(column, $event) : hideColumn(column, $event)">
										<transition name="sort-ascending" mode="out-in">
											<i  class="fa fa-caret-left" 
												role="button"
												aria-hidden="true"
												:title="'Hide column \'' + column.name + '\''"
												v-show="!column.hidden"></i>
										</transition>
										<transition name="sort-descending" mode="out-in">
											<i  class="fa fa-caret-right" 
												role="button"
												aria-hidden="true"
												:title="'Show column \'' + column.name + '\''"
												v-show="column.hidden"></i>
										</transition>
									</div>
								</template>

								<div 	class="name hint hint--bottom hint--info"
										:data-hint="column.name"
										:style="{ width: getMinWidth(column) }"
										@click.exact="state.sortable ? sortByOne(column) : 0"
										@click.ctrl="state.sortable ? sortByMany(column) : 0"
										draggable="true"
										@dragstart="state.groupable ? columnDragStart(column, $event) : 0"
										@dragenter="state.groupable ? columnDragEnter(column, $event) : 0"
										@dragend="state.groupable ? columnDragEnd($event) : 0"
										v-if="!column.hidden">
									<slot :name="column.id + '-header'"
										  :cells="getCells(items, column.id)">
										{{column.name}}
									</slot>
									<template v-if="state.sortable">
										<span v-show="column.sortingDirection">
											<transition name="sort-ascending" mode="out-in">
												<i v-show="column.sortingDirection == 1" 
													class="fa fa-arrow-up arrow" 
													aria-hidden="true"></i>
											</transition>
											<transition name="sort-descending" mode="out-in">
												<i v-show="column.sortingDirection == -1"
													class="fa fa-arrow-down arrow" 
													aria-hidden="true"></i>
											</transition>
										</span>
									</template>
								</div>

								<template v-if="state.groupable">
									<div class="group"
										@click="column.grouping ? removeColumForGrouping(column) : addColumForGrouping(column)"
										v-if="!column.hidden">
										<i 	v-show="!column.grouping" 
											class="fa fa-object-group" 
											aria-hidden="true"
											:title="'Group column \'' + column.name + '\''"></i>
										<i 	v-show="column.grouping" 
											class="fa fa-object-ungroup" 
											aria-hidden="true"
											:title="'Ungroup column \'' + column.name + '\''"></i>
									</div>
								</template>

								<template v-if="state.filtrable">
									<div class="filter"
										v-if="!column.hidden"
										@click="showFilterForm(column)"
										:class="column.filtering && column.filtering.enabled ? 'filter-enabled' : ''"
										:title="'Filter \'' + column.name + '\''">
										<i class="fa fa-filter" aria-hidden="true"></i>
									</div>

									<div class="filter-container" 
										v-if="column.showFilterForm"
										v-click-outside="function (a, b) { hideFilterForm(column) }">
										<div class="filter-window">
											Show items with value that:
											<select @input="selectFilter(column, $event.target.value)"
													v-model="column.filtering.filterMode"
													class="filter-mods">
												<option v-for="(filteringMode, filteringModeName) in filteringModes" 
														v-if="filteringMode.type == 'all' || filteringMode.type == column.type"
														:value="filteringModeName">
													{{filteringMode.title}}
												</option>
											</select>
											<input 
												class="expected-value-input"
												@input="selectValueForFilter(column, $event.target.value)"
												v-model="column.filtering.expected"></input>
											<button class="clear-button" @click="removeColumForFiltering(column)">Clear</button>
										</div>
									</div>
								</template>

								<template v-if="state.resizable">
									<div class="mover-container"
										v-if="!column.hidden">
										<div class="mover"
											@mousedown="beginResizeColumn(column, $event)"></div>
									</div>
								</template>

							</div>

						</th>
					</tr>
				</thead>

				<tbody class="body">

					<template v-if="!hasGrouped">
						<tr v-for="(item, i) in data.items"
							:key="i"
							class="lighting-row">
							<td v-for="column in state.columns"
								v-if="!column.hidden || i == 0"
								:key="i + column.id"
								:rowspan="column.hidden ? state.paging.size : 1"
								:class="column.hidden ? 'hidden-column' : ''">
								<slot :name="column.id + '-column'" 
									:value="item[column.id]"
									v-if="!column.hidden">
									{{item[column.id]}}
								</slot>
								<div v-if="column.hidden" class="vertical">{{column.name}}</div>
							</td>
						</tr>
					</template>

					<template v-if="hasGrouped" >
						<template v-for="(groupingItem, i) in getGroupingItems()">
							<tr v-if="groupingItem.group && !groupingItem.hidden" :key="i">
								<th v-for="(trash, j) in new Array(groupingItem.level)" 
									:key="j" 
									class="th-left">
									<div class="rol-up" 
										v-if="j == groupingItem.level - 1"
										@click="
											groupingItem.hiding 
												? showGroup(groupingItem.joinGroupedValues) 
												: hideGroup(groupingItem.joinGroupedValues)">
											<transition name="sort-ascending" mode="out-in">
												<i  class="fa fa-caret-left hide-group" 
													role="button"
													aria-hidden="true"
													title="Hide group"
													v-show="!groupingItem.hiding"></i>
											</transition>
											<transition name="sort-descending" mode="out-in">
												<i  class="fa fa-caret-right hide-group" 
													role="button"
													aria-hidden="true"
													title="Show group"
													v-show="groupingItem.hiding"></i>
											</transition>
									</div>
								</th>

								<th :colspan="state.groupingColumns.length + state.columns.length - groupingItem.level"
									class="th-header"
									@click="
											groupingItem.hiding 
												? showGroup(groupingItem.joinGroupedValues) 
												: hideGroup(groupingItem.joinGroupedValues)">
									<slot :name="groupingItem.column.id + '-group'" 
										:cells="getCells(items, groupingItem.column.id)"
										:value="groupingItem.group">
										{{groupingItem.column.name}}: {{groupingItem.group}}
									</slot>
								</th>
							</tr>
							<template v-if="!groupingItem.group && !groupingItem.hidden">
								<tr :key="i" class="lighting-row">
									<th v-for="(trash, j) in new Array(groupingItem.level)" 
										:key="j" 
										class="th-left"></th>
									<td v-for="column in state.columns"
										:key="i + column.id"
										:class="column.hidden ? 'hidden-column' : ''">
										<slot :name="column.id + '-column'" 
											:value="groupingItem.item[column.id]"
											v-if="!column.hidden">
											{{groupingItem.item[column.id]}}
										</slot>
									</td>
								</tr>
							</template>
						</template>
					</template>
					
				</tbody>
			</table>
		</div>
		<div class="paging">
			<div class="arrows">
				<button class="paging-button"
						@click="goToPage(1)" 
						:disabled="data.paging.current === 1">
					<i class="fa fa-step-backward" aria-hidden="true"></i>
				</button>
				<button class="paging-button" 
						@click="goToPage(data.paging.current - 1)"  
						:disabled="data.paging.current === 1">
					<i class="fa fa-caret-left" aria-hidden="true"></i>
				</button>
				<div class="paging-row">
					<button class="paging-button" 
							v-if="data.paging.current > maxCountOfPage"
							@click="goToPage(Math.floor((data.paging.current - 1) / maxCountOfPage) * maxCountOfPage)">
						<i class="fa fa-ellipsis-h" aria-hidden="true"></i>
					</button>
					<template v-for="(item, i) in new Array(data.paging.count)">
						<template v-if="canShowPageNumber(i)">
							<button class="paging-button" 
									:class="i + 1 == data.paging.current ? 'selected' : ''"
									@click="goToPage(i + 1)">
								{{i + 1}}
							</button>
						</template>
					</template>
					<button class="paging-button" 
							v-if="data.paging.count != maxCountOfPage 
								&& data.paging.current <= Math.floor(data.paging.count / maxCountOfPage) * maxCountOfPage"
							@click="goToPage(Math.floor((data.paging.current - 1) / maxCountOfPage) * maxCountOfPage + maxCountOfPage + 1)">
						<i class="fa fa-ellipsis-h" aria-hidden="true"></i>
					</button>
				</div>
				<button class="paging-button" 
						@click="goToPage(data.paging.current + 1)"
						:disabled="data.paging.current === data.paging.count">
					<i class="fa fa-caret-right" aria-hidden="true"></i>
				</button>
				<button class="paging-button"
						@click="goToPage(data.paging.count)"
						:disabled="data.paging.current === data.paging.count">
					<i class="fa fa-step-forward" aria-hidden="true"></i>
				</button>
			</div>
			<div class="hints">
				<select v-model="data.paging.size"
						class="paging-select">
					<option v-for="size in pageSizes" 
							:value="size">
						{{size == 0 ? 'All' : size}}
					</option>
				</select>
				<div class="paging-select-hint">
					items per page
				</div>
				<div class="paging-info">
					{{(data.paging.current - 1) * data.paging.size + 1}} - 
					{{ data.paging.size == 0 || data.paging.current * data.paging.size > items.length 
						? items.length
						: data.paging.current * data.paging.size }} 
					of 
					{{items.length}} 
					items
				</div>
			</div>
		</div>
	</div>
</template>
<script src="./vue-table.js"></script>
<style src="./vue-table.scss" lang="scss"></style>