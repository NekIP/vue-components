<template>
	<div class="vuedatepicker" v-click-outside="hide">
        <div class="dropdown-trigger-container" @click="isExpanded = !isExpanded">
            <slot name="triggerContainer" :selectedRange="selectedDateRange">
                {{triggerBtnText}}
            </slot>
        </div>
    	<div class="datepicker-dropdown-menu arrow-box" v-show="isExpanded">
        	<div class="avaliable-ranges">
                <ul>
                    <li 
                        v-for="key in avaliableDateRangeKeys" 
                        @click="handleClickOnKey(key)"
                        v-bind:class="{ 'active': key == selectedKey }">
                        {{ keyToDateRangeViewModelMap[key].labelText }}
                    </li>
                </ul>
                <!--
                <div class="range-inputs">
                    <button class="applyBtn btn btn-sm btn-success" type="button">Apply</button>
                    <button class="cancelBtn btn btn-sm btn-default" type="button">Cancel</button>
                </div>
                -->
        	</div>
            <div v-show="showCustomDateRangeDatePickers === true" class="custom-daterange-container">
                <div class="row">
                	<div class="col col-md-12">
                        <vue-calendar 
                            v-model="selectedDateRange" 
                            @start-date-changed="handleCalendarStartDateChange($event)" 
                            @end-date-changed="handleCalendarEndDateChange($event)"></vue-calendar>
					</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Fuse from 'fuse.js';
import vClickOutside from 'v-click-outside'
import moment from 'moment'

export default {
    directives: {
        clickOutside: vClickOutside.directive
    },
    model: {},
    props: {
        rangeKeys: [],
        customDateRangeLabelText: "Custom date range"
    },
    data() {
        return {
            testData: 0,
            isExpanded: false,
            keyToDateRangeViewModelMap: {},
            avaliableDateRangeKeys: [],
            selectedKey: null,
            selectedDateRange: new DateRange(
                moment().day(1).toDate(), 
                moment().day(moment().daysInMonth()).toDate()),
            showCustomDateRangeDatePickers: false,
        }
    },
    created: function () {
        let self = this;

        var keyToDateRangeFullMap = {
            "TODAY": new DateRangeViewModel(
                new DateRange(
                    new Date(), 
                    new Date()), 
                "Today"),
            "YESTERDAY": new DateRangeViewModel(
                new DateRange(
                    moment().subtract(1, 'days').toDate(), 
                    moment().subtract(30, 'days').toDate()), 
                "Yesterday"),       
            "LAST_WEEK": new DateRangeViewModel(
                new DateRange(
                    moment().subtract(1, 'weeks').weekday(0).toDate(), 
                    moment().subtract(1, 'weeks').weekday(6).toDate()), 
                "Last week"),   
            "LAST_MONTH": new DateRangeViewModel(
                new DateRange(
                    moment().subtract(1, 'months').day(1).toDate(), 
                    moment().subtract(1, 'month').endOf('month').toDate()), 
                "Last month"),
            "LAST_7_DAYS": new DateRangeViewModel(
                new DateRange(
                    moment().subtract(7, 'days').toDate(), 
                    new Date()), 
                "Last 7 days"),
            "LAST_30_DAYS": new DateRangeViewModel(
                new DateRange(
                    moment().subtract(30, 'days').toDate(), 
                    new Date()), 
                "Last 30 days"),
            "CUSTOM_DATE_RANGE": new DateRangeViewModel(
                new DateRange(
                    new Date(), 
                    new Date()), 
                "Custom date range"),
        };

        this.rangeKeys.forEach(function (key) {
            if (key in keyToDateRangeFullMap) {
                self.avaliableDateRangeKeys.push(key);
                self.keyToDateRangeViewModelMap[key] = keyToDateRangeFullMap[key];
            }
        });
    },
    methods: {
        handleCalendarStartDateChange(date) {
            this.selectedDateRange.startDate = date;
        },
        handleCalendarEndDateChange(date) {
            this.selectedDateRange.endDate = date;
        },
        changeIsExpandedState() {
            this.isExpanded = !this.isExpanded;
        },
        onChange() {
            this.$emit('selection-changed', this.selectedDateRange);
        },
        handleClickOnKey(key) {
            this.selectedKey = key;
            this.showCustomDateRangeDatePickers = (key === "CUSTOM_DATE_RANGE");
            
            if (key == 'CUSTOM_DATE_RANGE') {
                return;
            }

            if (this.selectedDateRange != this.keyToDateRangeViewModelMap[key].dateRange) {
                this.selectedDateRange = this.keyToDateRangeViewModelMap[key].dateRange;
                this.onChange();
            }
        },
        hide() {
            this.isExpanded = false;
        }
    }
}

class DateRangeViewModel
{
    constructor(dateRange, labelText) {
        this.dateRange = dateRange;
        this.labelText = labelText;
    }
}

class DateRange 
{
    constructor(start, end) {
        this.startDate = start;
        this.endDate = end;
    }

    set(start, end) {
        this.startDate = start;
        this.endDate = end;
    }

    toString() {
        return (this.startDate && this.endDate) 
            ? `${this.startDate.toISOString()} - ${this.endDate.toISOString()}`
            : 'Please select a range';
    }
}
</script>

<style lang="scss" scoped>

.segpay-btn {
    display: inline-block;
    padding: 6px 12px;
    margin-bottom: 0;
    font-size: 14px;
    font-weight: normal;
    line-height: 1.42857143;
    text-align: center;
    white-space: nowrap;
    vertical-align: middle;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
    cursor: pointer;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    background-image: none;
    border: 1px solid transparent;
    border-radius: 4px;

    &-sm {
        padding: 5px 10px;
        font-size: 12px;
        line-height: 1.5;
        border-radius: 3px;
    }
    &-success {
        color: #fff;
        background-color: #5cb85c;
        border-color: #4cae4c;
    }

    &-link {
        padding: 0;

        &:hover {
            text-decoration: underline;
            color: orange;
        }
    }

    .btn-default {
        color: #333;
        background-color: #fff;
        border-color: #ccc;
    }
}

%arrow-box-before-after-shared {
    bottom: 100%;
    border: solid transparent;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
}

.arrow-box {
    &:before {
        @extend %arrow-box-before-after-shared;
        border-color: rgba(113, 158, 206, 0);
        border-bottom-color: #ccc;
        border-width: 9px;
        left: 19px;
        margin-left: -9px;
    }

    &:after {
        @extend %arrow-box-before-after-shared;
        border-color: rgba(255, 255, 255, 0);
        border-bottom-color: #ffffff;
        border-width: 8px;
        left: 19px;
        margin-left: -8px;
    }
}

.vuedatepicker {
    width: 100%;
    position: relative;
    display: inline-block;

    .dropdown-trigger-container {
        cursor: pointer;
        width: auto;
        display: inline-block;
    }

    .datepicker-dropdown-menu {
        border: 1px solid #ccc;
        border-radius: 0.5em;
        z-index: 1;
        background-color: #fff;
        margin: auto;
        position: absolute;
        font-size: 0;
        display: table;

        .avaliable-ranges {
            height: 100%;
            display: table-cell;
            font-size: 14px;
            padding: 3px 12px;

            ul {
                margin: 0;
                padding: 0;
                
                li {
                    list-style-type: none;
                    background-color: #f5f5f5;
                    border: 1px solid #f5f5f5;
                    border-radius: 4px;
                    color: #08c;
                    margin-top: 4px;
                    margin-bottom: 4px;
                    cursor: pointer;
                    padding: 6px;

                    &.active {
                        background-color: #08c;
                        border: 1px solid #08c;
                        color: #fff;
                    }
                }
            }
        }

        .custom-daterange-container {
            display: table-cell;     
            font-size: 16px;
        }
    }
}

</style>
