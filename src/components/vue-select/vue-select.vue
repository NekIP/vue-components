<template>
	<div class="vueselect">
		<div class="selectBox" v-on:click="isExpanded = !isExpanded">
			<select class="form-control">
				<option><slot name="header" :selectedIds="selectedIds">{{title}}</slot></option>
			</select>
			<div class="overSelect"></div>
		</div>
		<div 
			id="checkboxes" 
			v-show="isExpanded">
			<div class="row">
				<div class="col col-md-8">
					<input 
						v-model="searchString" 
						@input="searchTermChanged" 
						type="text" 
						placeholder="Search">
				</div>
				<div class="col col-md-4">	
					<button  class="btn btn-primary btn-sm" @click="selectAllOrUnselectAll">
						{{isAllOptionsSelected ? 'Unselect all' : 'Select all'}}
					</button>
				</div>
			</div>
		
			<div v-for="optGroup in optionGroups">
				<p>{{optGroup.groupHeader}}</p>
				<template v-for="opt in optGroup.groupItems">
					<template v-if="!searchString || (opt.isSelected) || matchedItems.includes(opt.value)">
						<label v-bind:class="{ selected: opt.isSelected }">
						<input 
							type="checkbox" 
							:value="opt.value" 
							:checked="opt.isSelected" 
							@click="changeOptionState(opt)" />
							{{opt.text}}
						</label>
					</template>
				
				</template>
			</div>
		</div>
	</div>
</template>

<script>
	import Fuse from 'fuse.js'

	export default {
		model: {	
		},
		props: {
			allOptionGroups: {
				type: Array,
				required: true
			},
			defaultTitle: {
				type: String,
				required: true
			},
			multipleSelectedTitleChunk: {
				type: String,
				required: true
			},
			allowMultiple: {
				type: Boolean,
				default: true
			}
		},
		data () {
			return {
				selectedIds: [],
				optionGroups: this.allOptionGroups,
				title: this.defaultTitle,
				isExpanded: false,
				isAllOptionsSelected: false,
				totalOptionsCount: 0,
				searchString: "",
				matchedItems: []
			}
		},
		created: function () {
			var allOptions = [];
			this.allOptionGroups.forEach(optionGroup => {
				optionGroup.groupItems.forEach(option => {
					allOptions.push(option);
				});
			});
			this.totalOptionsCount = (allOptions) ? allOptions.length : 0;
		},
		watch: {
			optionGroups: {
				handler: function (val) {
					let self = this;
					this.selectedIds.length = 0;
					this.optionGroups.forEach(optionGroup => {
						optionGroup.groupItems.forEach(option => {
							if (option.isSelected) {
								self.selectedIds.push(option.value);
							}
						});
					});
					this.isAllOptionsSelected = (!this.selectedIds)
						? false
						: this.selectedIds.length == this.totalOptionsCount;

					this.onChange();
				},
				deep: true
			},
		},
		methods: {
			searchTermChanged() {
				let self = this;

				this.matchedItems.length = 0;

				var options = {
					keys: ['text'],
					includeScore: true,
				};

				this.allOptionGroups.forEach(function(optionGroup) {
					var fuse = new Fuse(optionGroup.groupItems, options);

					var test = fuse.search(self.searchString);

					test.forEach(function(match) {

						self.matchedItems.push(match.item.value);
					});
				});
			},
			changeOptionState(option) {
				let initialState = option.isSelected;

				if (!this.allowMultiple) {
					this.optionGroups.forEach(optionGroup => {
						optionGroup.groupItems.forEach(option => {
							option.isSelected = false;
						});
					});
				} 
				console.log("I am here");
				option.isSelected = !initialState;
			},
			onChange() {
				this.updateTitle();
				this.$emit('selection-changed', this.selectedIds);
			},
			selectAllOrUnselectAll() {
				this.isAllOptionsSelected = (!this.selectedIds)
					? false
					: this.selectedIds.length == this.totalOptionsCount;
				
				let newState = !this.isAllOptionsSelected;

				this.optionGroups.forEach(optionGroup => {
					optionGroup.groupItems.forEach(option => {
						option.isSelected = newState;
					});
				});
			},
			updateTitle() {
				if (this.selectedIds.length == 0 || !this.selectedIds) {
					this.title = this.defaultTitle;
				}
				if (this.selectedIds.length == 1) {
					this.title = `${this.selectedIds[0]}`;
				} 
				else {
					this.title = `${this.selectedIds.length} ${this.multipleSelectedTitleChunk}`;
				}
			},
		}
	}
</script>

<style lang="scss">
	.vueselect {
		width: 100%;
		max-width: 450px;
		padding: 1em;
	}

	.selectBox {
		position: relative;
	}

	.selectBox select {
		width: 100%;
		font-weight: bold;
	}

	.overSelect {
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
	}

	#checkboxes {
		border: 1px #dadada solid;
		padding-left: 0.5em;
		padding-top: 0.5em;
		max-height: 200px; 
		overflow-y: scroll;
	}

	#checkboxes label {
		display: block;
		margin: 0;
	}

	#checkboxes label input{
		margin: 0;
		padding: 0.5em;
	}

	#checkboxes label:hover {
		background-color: #ebebeb;
	}

	label.selected {
		background-color: #44688d;
		color: #ffffff;
	}

	#checkboxes label.selected:hover {
		background-color: #44688d;
		color: #ffffff;
	}
	
</style>