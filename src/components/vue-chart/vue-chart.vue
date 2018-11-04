<template>
	<div>
		<button @click="create"></button>
		<canvas :id="canvasId" width="400" height="400"></canvas>
	</div>
</template>
<script>
	import Chart from 'chart.js';
	import { generateId } from '../../scripts/common/id-generator.js';
	
	export default {
		name: 'vue-chart',
		props: {
			data: {
				type: Array,
				required: true
			},
			typeXAxis: {
				type: String,
				required: true
			}
		},
		data: function() {
			return {
				canvasId: generateId(),
			}
		},
		methods: { 
			create() {
				console.log(this.data);
				let myChart = new Chart(this.canvasId, {
					type: 'bar',
					data: {
						datasets: [
							{
								data:this.data,
								type: 'line'
							}
						],
					},
					options: {
						scales: {
							xAxes: [{
								type: 'time',
								distribution: 'series',
								time: {
									displayFormats: {
										quarter: 'MMM YYYY'
									}
								}
							}]
						}
					}
				});
			}
		}
	}
</script>
</<style lang="scss">

</style>

