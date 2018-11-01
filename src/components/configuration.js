import vueTable from './vue-table/vue-table.vue';
import vueSelect from './vue-select/vue-select.vue';
import vueDatepicker from './vue-datepicker/vue-datepicker.vue';
import vueCalendar from './vue-calendar/vue-calendar.vue';

(function () {
	Vue.component('vue-table', vueTable); 
	Vue.component('vue-select', vueSelect); 
	Vue.component('vue-datepicker', vueDatepicker); 
	Vue.component('vue-calendar', vueCalendar); 
})();