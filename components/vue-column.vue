<template>
	<div class='report-table'>
		<table>
		</table>
		<template v-for="item in data">
			{{item.mid}}_
			{{item.date}}_
			{{item.purchaseId}}_
			{{item.transactionId}}_
			{{item.status}}_
			{{item.currency}}_
			{{item.amount}}_
			{{item.url}}_
			<br />
		</template>
	</div>
</template>
<script>
	export default {
		name: 'report-table',
		props: ['data'],
		data: function () {
			return {

			}
		}
	}

	class DataTable {
		constructor(data) {
			this.data = data;
		}
	}
</script>
<style>

</style>

