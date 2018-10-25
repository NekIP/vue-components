<template>
	<div class="vueselect" v-click-outside="hide">
		<div class="select-box" v-on:click="changeIsExpandedState">
			<select class="form-control">
				<option>
					<slot name="header" :selectedIds="selectedIds">
						{{title}}
					</slot>
				</option>
			</select>
			<div class="over-select"></div>
		</div>
    	<div class="checkboxes-container">
        	<div class="checkboxes" v-show="isExpanded">
            	<div class="row">
                	<div class="col col-md-12">
                    	<input v-model="searchString" 
							   @input="searchTermChanged"
							   class="search-text-box" 
							   type="text" 
							   placeholder="Search">
					</div>
					<div class="col col-md-12">
						<button type="button" 
								class="btn btn-link segpay-btn-link" 
								@click="selectAllOrUnselectAll">
							{{isAllOptionsSelected ? 'Unselect all' : 'Select all'}}
						</button>
					</div>
                </div>
                <div class="options-group" v-for="optGroup in optionGroups">
                    <p class="group-header">{{optGroup.groupHeader}}</p>
					<button type="button" 
								class="btn btn-link segpay-btn-link" 
								@click="selectOrUnselectAllItemsInGroup(optGroup.key)">
						{{groupToIsAllOptionsSelectedMap[optGroup.key] ? 'Unselect all' : 'Select all'}}
					</button>
                    <template v-for="opt in optGroup.groupItems">
                        <template v-if="!searchString || (opt.isSelected) || matchedItems.includes(opt.value)">
                            <label v-bind:class="{ selected: opt.isSelected }">
								<input type="checkbox" 
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
    </div>
</template>

<script>
import Fuse from 'fuse.js';
import vClickOutside from 'v-click-outside'

export default {
    directives: {
        clickOutside: vClickOutside.directive
    },
    model: {},
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
    data() {
        return {
            selectedIds: [],
            optionGroups: this.allOptionGroups,
            title: this.defaultTitle,
            isExpanded: false,
			isAllOptionsSelected: false,
			groupToIsAllOptionsSelectedMap: {},
            totalOptionsCount: 0,
            searchString: "",
            matchedItems: []
        }
    },
    created: function () {
        var allOptions = [];
        this.allOptionGroups.forEach(optionGroup => {
			this.groupToIsAllOptionsSelectedMap[optionGroup.key] = false;
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
                this.isAllOptionsSelected = (!this.selectedIds) ?
                    false :
                    this.selectedIds.length == this.totalOptionsCount;

                this.onChange();
            },
            deep: true
        },
    },
    methods: {
        hide(e, el) {

            if (e.target.className == "overSelect") {
                return;
            }

            if (this.isExpanded) {
                this.isExpanded = false;
            }
        },
        changeIsExpandedState() {
            this.isExpanded = !this.isExpanded;
        },
        searchTermChanged() {
            let self = this;

            this.matchedItems.length = 0;

            var options = {
                keys: ['text'],
                includeScore: true,
            };

            this.allOptionGroups.forEach(function (optionGroup) {
                var fuse = new Fuse(optionGroup.groupItems, options);

                var test = fuse.search(self.searchString);

                test.forEach(function (match) {
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
            option.isSelected = !initialState;
        },
        onChange() {
            this.updateTitle();
            this.$emit('selection-changed', this.selectedIds);
        },
        selectAllOrUnselectAll() {
            this.isAllOptionsSelected = (!this.selectedIds) ?
                false :
                this.selectedIds.length == this.totalOptionsCount;

            let newState = !this.isAllOptionsSelected;

            this.optionGroups.forEach(optionGroup => {
                optionGroup.groupItems.forEach(option => {
                    option.isSelected = newState;
                });
            });
		},
		selectOrUnselectAllItemsInGroup(groupKey) {
		
			
			this.optionGroups.forEach(optionGroup => {
				if (optionGroup.key == groupKey) {
					var isAllOptionsSelected = this.groupToIsAllOptionsSelectedMap[groupKey] 
						? this.groupToIsAllOptionsSelectedMap[groupKey] 
						: false;
						
					var allOptionsCount = optionGroup.groupItems.length;
					var selectedOptionsCount = 0;
					optionGroup.groupItems.forEach(option => {
						if (option.isSelected) {
							selectedOptionsCount += 1;
						}
					});
					if (allOptionsCount == selectedOptionsCount) {
						isAllOptionsSelected = true;
					}
					this.groupToIsAllOptionsSelectedMap[groupKey] = !isAllOptionsSelected;
				}
            });

            let newState = !this.isAllOptionsSelected;

            this.optionGroups.forEach(optionGroup => {
				if (optionGroup.key == groupKey) {
					optionGroup.groupItems.forEach(option => {
						option.isSelected = newState;
					});
				}
            });
		},
        updateTitle() {
            if (this.selectedIds.length == 0 || !this.selectedIds) {
                this.title = this.defaultTitle;
            }
            if (this.selectedIds.length == 1) {
                this.title = `${this.selectedIds[0]}`;
            } else {
                this.title = `${this.selectedIds.length} ${this.multipleSelectedTitleChunk}`;
            }
        },
    }
}
</script>

<style lang="scss" scoped>

.segpay-btn-link {
    padding: 0;

    &:hover {
        text-decoration: underline;
        color: orange;
    }
}

.vueselect {
    width: 100%;
    max-width: 450px;
    padding: 1em;
}

.over-select {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}

.select-box {
    position: relative;

	&:hover {
		select {
			cursor: pointer;
			background: linear-gradient(to top, #bebfc0 0%, #a2a3a5 100%);
		}
	}

    select {
        width: 100%;
        color: white;
        background: linear-gradient(to bottom, #bebfc0 0%, #a2a3a5 100%);
    }
}

.checkboxes-container {
    position: relative;
    width: 100%;
    z-index: 100;

    .checkboxes {
        background-color: #ffffff;
        border: 1px #dadada solid;
        padding-left: 0.5em;
        padding-top: 0.5em;
        max-height: 200px;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        overflow-y: scroll;

		.options-group {
			padding-top: 1em;
			padding-bottom: 1em;	
		}

        .search-text-box {
            width: 100%;
        }

		.group-header {
			margin: 0;
			font-weight: bold;
		}

        label {
            display: block;
            margin-top: 1px;
            margin-bottom: 1px;
            border: 1px dotted transparent;
			font-weight: 500;

            input {
                margin: 0;
                padding: 0.5em;
            }

            &:hover {
                background-color: #ebebeb;
                border-color: blue;
            }

            &.selected {
                background-color: #415090;
                color: #ffffff;
                border: 1px solid orange;

                &:hover {
                    background-color: #415090;
                }
            }
        }
    }
}
</style>
