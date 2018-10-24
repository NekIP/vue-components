<template>
	<div class="vue-table">
		<div class="vue-table-container">
			<table class="vue-table-table">
				<thead>
					<tr>
						<th class="column" v-for="i in groupingColumns" :style="{ width: 30 }"></th>

						<th  v-for="column in columnsInfo"
							class="column"
							draggable="true"
							@dragstart="columnDragStart(column, $event)"
							@dragenter="columnDragEnter(column, $event)"
							@dragend="columnDragEnd($event)"
							:style="{ 
								'min-width': getMinWidth(column) + minWidthBias, 
								width: column.hidden 
									? hiddenColumnSize
									: column.width || getMinWidth(column) + minWidthBias
							}">
							<div class="container">

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

								<div class="name hint hint--bottom hint--info"
									:data-hint="column.name"
									:style="{ 'width': getMinWidth(column) }"
									@click="sort(column, hasGrouped)"
									v-if="!column.hidden">
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
									@click="groupingColumns.indexOf(column) > -1 ? ungroup(column) : group(column)"
									v-if="!column.hidden">
									<i 	v-show="groupingColumns.indexOf(column) === -1" 
										class="fa fa-object-group" 
										aria-hidden="true"
										:title="'Group column \'' + column.name + '\''"></i>
									<i 	v-show="groupingColumns.indexOf(column) !== -1" 
										class="fa fa-object-ungroup" 
										aria-hidden="true"
										:title="'Ungroup column \'' + column.name + '\''"></i>
								</div>

								<div 	class="filter"
										v-if="!column.hidden">
									<i 	class="fa fa-filter" 
										aria-hidden="true"
										:title="'Filter \'' + column.name + '\''"></i>
								</div>

								<div class="filter-container">
									<div class="filter-window">
										<select @input="selectFilter(column, $event.target.value)">
											<option v-for="(filteringMode, filteringModeName) in filteringModes" 
													v-if="filteringMode.type == 'all' || filteringMode.type == column.type"
													:value="filteringModeName">
												{{filteringModeName}}
											</option>
										</select>
										<input @input="selectValueForFilter(column, $event.target.value)"></input>
										<button @click="clearFilter(column)">Clear</button>
									</div>
								</div>

								<div 	class="mover-container"
										v-if="!column.hidden">
									<div class="mover"
										@mousedown="beginResizeColumn(column, $event)"></div>
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
			</table>
		</div>
	</div>
</template>
<script src="./scripts/vue-table.ts" lang="ts"></script>
<style src="./styles/vue-table.scss" lang="scss"></style>