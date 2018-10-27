import vueTable from './vue-table/vue-table.vue';
import vueSelect from './vue-select/vue-select.vue';
import vueChart from './vue-chart/vue-chart.vue';

(function () {
	Vue.component('vue-table', vueTable); 
	Vue.component('vue-select', vueSelect); 
	Vue.component('vue-chart', vueChart); 
})();