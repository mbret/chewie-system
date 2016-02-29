var Scheduler = require('../index.js').scheduler;

var scheduler = new Scheduler();

var schedules = {

    // now
    now: {
        method: 'now'
    },

    // every seconds
    everySeconds: {
        method: 'interval',
        interval: 1000
    },

    // moment now with js date
    momentNowWithDate: {
        method: 'moment',
        when: new Date()
    },

    // every day at 01:00
    everyDayAtOne: {
        method: 'moment',
        when: ['01', 'HH']
    },

    // every 2nd day of months at 00:00
    everyMonths: {
        method: 'moment',
        when: ['29 00', 'DD HH'],
    },

    // from 12:00 to 13:00
    from12to13: {
        method: 'range',
        range: {
            from: '12',
            to: '15',
            format: 'HH'
        }
    }
};

scheduler.subscribe(schedules.from12to13, function(event){
    console.log('zbla', event);
});

// Every monday and thursday at 01:00
//var schedule = scheduler.subscribe({
//    method: 'moment',
//    when: ['11:32', "HH:mm"],
//    days: [1,3]
//}, function(){
//    console.log('Every monday and thursday at 01:00');
//});
//
//schedule.cancel();

//setTimeout(function(){
//    "use strict";
//    schedule.cancel();
//}, 1000);

//setTimeout(function(){
//    "use strict";
//    schedule.restart();
//    schedule.cancel();
//}, 2000);