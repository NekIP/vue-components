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
                date: '2018-01-23',
                purchaseId: 1000017923,
                transactionId: 1234435467,
                status: 'auth',
                currency: 'USD',
                amount: 22.56,
                url: 'my-little-pony.com'
            },
            {
                mid: 2002,
                date: '2018-01-23',
                purchaseId: 23534345,
                transactionId: 436534532,
                status: 'not auth',
                currency: 'EUR',
                amount: -7.45,
                url: 'dot.com'
            },
            {
                mid: 12234,
                date: '2018-01-23',
                purchaseId: 3453,
                transactionId: 436455,
                status: 'auth',
                currency: 'EUR',
                amount: 7.56,
                url: 'test.com'
            },
        ],
        columns: [
            { id: 'mid', name: 'Merchant Id' },
            { id: 'date', type: 'date' },
            { id: 'purchaseId', type: 'number' },
            { id: 'transactionId', type: 'number' },
            'status',
            'currency',
            ['amount', 'Value', 'number'],
            'url'
        ]
    },
    created: function() {
        this.addRandomData(100); // cols.reduce((a, b) => a + b, 0)
    },
    methods: {
        addRandomData: function (count) {
            for (let i = 0; i < count; i++) {
                this.data.push({
                    mid: this.getRandomInt(20000, 25000),
                    date: this.randomDate(new Date(2000, 1, 1, 1, 1, 1), new Date(2018, 1, 1, 1, 1, 1)),
                    purchaseId: this.getRandomInt(23452, 342355),
                    transactionId: this.getRandomInt(23452, 3243242343),
                    status: this.randomSecuence(),
                    currency: this.randomCurrency(),
                    amount: this.getRandomArbitrary(-50, 50),
                    url: this.randomUrl()
                });
            }
        },
        randomDate(start, end) {
            var d = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            return [year, month, day].join('-');
        },

        getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        },

        getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        randomSecuence() {
            var things = ['rock', 'paper', 'scissor', 'test', 'what', 'best', 'wrost', 'things'];
            var t = this.getRandomInt(3, things.length);
            let result = "";
            for (let i = 0; i < t; i++) {
                result += things[Math.floor(Math.random() * things.length)] + " ";
            }
            return result;
        },

        randomCurrency() {
            var things = ['USD', 'EUR', 'BTC', 'COIN', 'DOGE', 'ETH'];
            return things[Math.floor(Math.random() * things.length)];
        },

        randomUrl() {
            var things = ['my-little-pony', 'dot', 'test', 'best-way', 'PAY'];
            return things[Math.floor(Math.random() * things.length)] + '.com';
        },
    }
})