import customTable from './components/vue-tabel.vue'

(function () {
    Vue.component('vue-table', customTable); 
})();

var app = new Vue({
    el: '#app',
    data: {
        data: [
            {
                mid: 20001,
                date: '12-04-2018',
                purchaseId: 1000017923,
                transactionId: 1234435467,
                status: 'auth',
                currency: 'USD',
                amount: 22.56,
                url: 'my-little-pony.com'
            },
            {
                mid: 2002,
                date: '08-01-2018',
                purchaseId: 23534345,
                transactionId: 436534532,
                status: 'not auth',
                currency: 'EUR',
                amount: -7.45,
                url: 'dot.com'
            },
            {
                mid: 12234,
                date: '06-11-2018',
                purchaseId: 3453,
                transactionId: 436455,
                status: 'auth',
                currency: 'EUR',
                amount: 7.56,
                url: 'test.com'
            },
        ]
    },
    created: function() {
        this.addRandomData(15000); // cols.reduce((a, b) => a + b, 0)
    },
    methods: {
        addRandomData: function (count) {
            for (let i = 0; i < count; i++) {
                this.data.push({
                    mid: i * i,
                    date: '0' + (i + 1) + '-11-2018',
                    purchaseId: Math.sin(i),
                    transactionId: Math.cos(i),
                    status: 'dgfdhdfhfdhfdhgf',
                    currency: 'EUR',
                    amount: i / (Math.sin(i) + 1),
                    url: 'test.com'
                });
            }
        }
    }
})