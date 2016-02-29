var Scheduler = require('../index.js').scheduler;

var scheduler = new Scheduler();

// Subscribe interval
//scheduler.subscribe({
//    method: 'interval',
//    interval: '1000'
//}, function(){
//    console.log('interval of 1s');
//});

//var date = new Date();
//date.setSeconds(date.getSeconds() + 5);
//var schedule = scheduler.subscribe({
//    method: 'moment',
//    when: date
//}, function(){
//    console.log('coucou');
//});
//schedule.cancel();

// Every day at 01:00
//var schedule = scheduler.subscribe({
//    method: 'moment',
//    when: ['01', "HH"]
//}, function(){
//    console.log('Every day at 01:00');
//});

// Every monday and thursday at 01:00
var schedule = scheduler.subscribe({
    method: 'moment',
    when: ['01', "HH:mm"],
    days: [1,3]
}, function(){
    console.log('Every monday and tuesday at 01:00');
});
