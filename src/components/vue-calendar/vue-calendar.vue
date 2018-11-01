<template>
    <div class="two-months-calendar">
        <div class="row">
            <div class="col col-md-6">
                <div class="input-with-icon-wrapper">
                    <i class="fa fa-calendar" aria-hidden="true"></i>
                    <input 
                        type="date"
                        class="form-control"
                        :value="selectedStartDate && selectedStartDate.toISOString().split('T')[0]"
                        @input="tryToSetStartDateViaTextbox($event.target.valueAsDate)"
                        ref="startDatePreliminary"/>
                </div>
                
                <div class="month"> 
                    <ul>
                        <li class="prev" @click="prevMonth"><i class="fa fa-chevron-left" aria-hidden="true"></i></li>
                        <li>{{prevMonthCalendarSheet.nameOfMonth}} {{prevMonthCalendarSheet.year}}</li>
                    </ul>
                </div>

                <ul class="weekdays">
                    <li>Su</li>
                    <li>Mo</li>
                    <li>Tu</li>
                    <li>We</li>
                    <li>Th</li>
                    <li>Fr</li>
                    <li>Sa</li>
                </ul>

                <ul class="days">
                    <template v-for="item in prevMonthCalendarSheet.items">           
                        <li 
                            v-bind:class="{ 'another-month': !item.isInCurrentMonth, 'active': item.isInCurrentMonth && isActive(item.date), 'in-range': item.isInCurrentMonth && isInRange(item.date) }"
                            @click="setSelectedDate(item.date)"
                            @mouseover="setPreliminarySelectedDate(item.date)">
                            <div class="day-container"><span>{{item.date.getDate()}}</span></div>
                        </li>
                    </template>
                </ul>
            </div>
             <div class="col col-md-6">
                <div class="input-with-icon-wrapper">
                    <i class="fa fa-calendar" aria-hidden="true"></i>
                        <input 
                            type="date"
                            class="form-control"
                            :value="selectedEndDate && selectedEndDate.toISOString().split('T')[0]"
                            @input="tryToSetStartDateViaTextbox($event.target.valueAsDate)"
                            ref="endDatePreliminary"/>
                </div>
                 <div class="month"> 
                    <ul>
                        <li @click="nextMonth" class="next"><i class="fa fa-chevron-right" aria-hidden="true"></i></li>
                        <li>{{currMonthCalendarSheet.nameOfMonth}} {{currMonthCalendarSheet.year}}</li>
                    </ul>
                </div>

                <ul class="weekdays">
                    <li>Su</li>
                    <li>Mo</li>
                    <li>Tu</li>
                    <li>We</li>
                    <li>Th</li>
                    <li>Fr</li>
                    <li>Sa</li>
                </ul>

                <ul class="days"> 
                    <template v-for="item in currMonthCalendarSheet.items">           
                        <li 
                            v-bind:class="{ 'another-month': !item.isInCurrentMonth, 'active': item.isInCurrentMonth && isActive(item.date), 'in-range': item.isInCurrentMonth && isInRange(item.date) }"
                            @click="setSelectedDate(item.date)"
                            @mouseover="setPreliminarySelectedDate(item.date)"><div class="day-container"><span>{{item.date.getDate()}}</span></div></li>
                    </template>
                </ul>
            </div>
        </div>
        
    </div>

</template>

<script>

import moment from 'moment'

export default {
    model: {},
    props: ['value'],
    data() {
        return {
            currMonthCalendarSheet: this.value 
                ? new CalendarSheet(this.value.endDate.getFullYear(), this.value.endDate.getMonth())
                : new CalendarSheet(2018, 11),
            prevMonthCalendarSheet: this.value
                ? new CalendarSheet(this.value.endDate.getFullYear(), 
                    this.value.endDate.getMonth() == 0 ? 11 : this.value.endDate.getMonth() - 1)
                : new CalendarSheet(2018, 12),
            selectedStartDate: this.value ? new Date(this.value.startDate) : new Date(2018, 11, 1),
            selectedEndDate: this.value ? new Date(this.value.endDate) : new Date(2018, 11, 29),
            preliminarySelectedStartDate: this.value ? new Date(this.value.startDate) : new Date(2018, 11, 1),
            preliminarySelectedEndDate: this.value ? new Date(this.value.endDate) : new Date(2018, 11, 29),
            isBusy: false,
        }
    },
    created: function () {
        this.currMonthCalendarSheet.initialize();
        this.prevMonthCalendarSheet.initialize();
    },
    watch: {
        selectedStartDate: function(newValue) {
            this.$emit('start-date-changed', this.selectedStartDate);
        },
        selectedEndDate: function(newValue) {
            this.$emit('end-date-changed', this.selectedEndDate);
        },
        value: {
            handler: function(newValue, oldValue) {
               
               if (newValue === oldValue) {
                   return;
               }

                if (!newValue || !newValue.startDate || !newValue.endDate) {
                    return;
                }

                this.selectedStartDate = new Date(this.value.startDate);
                this.selectedEndDate = new Date(this.value.endDate);
                this.preliminarySelectedStartDate = new Date(this.value.startDate);
                this.preliminarySelectedEndDate =  new Date(this.value.endDate);
                this.isBusy = false;

                this.currMonthCalendarSheet.setDateAndInitialize(this.value.endDate);
                this.prevMonthCalendarSheet.setDateAndInitialize(new moment(this.value.endDate).add(-1, 'months').toDate());
            },
            deep: true
        } 
    },
    methods: {
        nextMonth() {
            this.currMonthCalendarSheet.nextMonth();
            this.prevMonthCalendarSheet.nextMonth();
        },
        prevMonth() {
            this.currMonthCalendarSheet.prevMonth();
            this.prevMonthCalendarSheet.prevMonth();
        },
        tryToSetStartDateViaTextbox(newStartDate) {
            if (newStartDate <= this.selectedEndDate) {
                this.selectedStartDate = newStartDate;
            }
        },
        tryToSetEndDateViaTextbox(newEndDate) {
            if (newEndDate >= this.selectedStartDate) {
                this.selectedEndDate = newEndDate;
            }
        },
        setPreliminarySelectedDate(date) {
            if (this.selectedStartDate != null) {       
                if (this.selectedEndDate != null) {
                    this.$refs.startDatePreliminary.focus();
                } else {
                    this.$refs.endDatePreliminary.focus();
                }
                this.preliminarySelectedEndDate = this.selectedEndDate != null
                    ? this.selectedEndDate 
                    : date;
            }
            else 
            {
                this.$refs.startDatePreliminary.focus()
                this.preliminarySelectedEndDate = null;
            }
        },
        setSelectedDate(date) {   
            if (this.selectedStartDate != null && this.selectedEndDate != null) {
                this.selectedStartDate = date;
                this.selectedEndDate = null;
            } else if (this.selectedStartDate != null && this.selectedEndDate == null) {
                if (date >= this.selectedStartDate) {
                    this.selectedEndDate = date;
                } else {
                    this.selectedStartDate = date;
                }
            } else {
                this.selectedStartDate = date;
            } 

            if (this.isBusy) {
                return;
            }
        },
        isInRange(date) {    
            if (!this.selectedStartDate || !this.preliminarySelectedEndDate) {
                return false;
            }

            return date > this.selectedStartDate && 
                   date < this.preliminarySelectedEndDate;
        },
        isActive(date) {
            if (new moment(date).isSame(this.selectedStartDate, 'day') || 
                new moment(date).isSame(this.selectedEndDate, 'day')) {
                return true;
            }

            return false;
        },
    }
}


class CalendarSheet
{
    constructor(year, month) {
        this.items = [];
        this.year = year;
        this.month = month;
        this.nameOfMonth = new moment([year, month, 1]).format("MMM");
    }

    nextMonth() {
        var nextMonth = new moment([this.year, this.month, 1]).add(1, 'months');
        this.year = nextMonth.year();
        this.month = nextMonth.month();
        this.nameOfMonth = new moment.utc([this.year, this.month, 1]).format("MMM");
        this.initialize();
    }

    prevMonth() {
        var nextMonth = new moment.utc([this.year, this.month, 1]).add(-1, 'months');
        this.year = nextMonth.year();
        this.month = nextMonth.month();
        this.nameOfMonth = new moment.utc([this.year, this.month, 1]).format("MMM");
        this.initialize();
    }

    setDateAndInitialize(date) {
        this.year = date.getFullYear();
        this.month = date.getMonth();

        this.initialize();
    }

    initialize() {
        this.isBusy = true;
        this.items = [];
        var calendarSheetFirstDate = new moment.utc([this.year, this.month, 1]).day("Sunday");
        var calendarSheetLastDate = new moment.utc([this.year, this.month, 1]).endOf('month').day("Saturday");

        var date = new moment.utc(calendarSheetFirstDate);

        while (date < calendarSheetLastDate) {  
            var item = new CalendarSheetItem(date.toDate(), date.month() == this.month);
            this.items.push(item);
            date = date.add(1, 'days');
        }
        
        this.isBusy = false;
    }
}

class CalendarSheetItem
{
    constructor(date, isInCurrentMonth = true)
    {
        this.date = date;
        this.isInCurrentMonth = isInCurrentMonth;
        this.isActive = false;
    }
}
</script>


<style lang="scss" scoped>

.input-with-icon-wrapper {
    position: relative;

    i.fa-calendar {
        position: absolute; 
        top: 8px; 
        left: 10px; 
        
        z-index: 2000;
    }

    input {
        position: relative;
        z-index: 1000;
        padding: 6px 12px 6px 30px;
    }

    input::-webkit-calendar-picker-indicator{
        display: none;
    }

    input[type="date"]::-webkit-input-placeholder{ 
        visibility: hidden !important;
    }
}

.two-months-calendar {    
    z-index: 4;
    padding: 1em;
    min-width: 600px;

    .prev, .next {
        cursor: pointer;
    }

    ul {
        list-style-type: none;
        padding: 0;
    }

    .month {
        padding: 25px 15px;
        width: 100%;
        text-align: center;

        .month .prev {
            float: left;
        }

        .month .next {
            float: right;
        }

        ul {
            margin: 0;
            padding: 0;

            li {
                color: black;
                font-size: 14px;
                font-weight: bold;
            }
        }
    }

    .weekdays {
        display: flex;

        li {
            flex: 1 1 100%;
            color: black;
            text-align: center;
            padding: 0px;
        }
    }

    .days {
        padding: 0 0;
        margin: 0;

        li {
            list-style-type: none;
            display: inline-block;
            width: 14.27%;
            text-align: center;
            color: black;
            position: relative;
            transition-property: background-color;
            transition-duration: 0.2s;

             &:hover {
                background-color: #eee;
                cursor: pointer;
                border-radius: 4px;
            }
            &.active {
                background: #357ebd;
                color: white !important;
                border-radius: 4px;
            }

            &.in-range {
                background-color: #ebf4f8;
            }

            &.another-month {
                color: #999;
            }

            .day-container {
                width: 100%;
                padding-top: 100%;
                position: relative;
                text-align: center;

                span {
                    position: absolute;
                    top: 25%;
                    left: 0;
                    bottom: 0;
                    right: 0;
                }
            }
        }
    }
}

</style>