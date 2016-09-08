var promises = [];

promises.push((new Promise(function(resolve) {
    return resolve();
})).then(function() {
    console.log("a");
    return Promise.resolve();
}));

for(var i = 0; i < 999999999 ; i++) {

}

Promise.all(promises)
    .then(function() {
        console.log("coucou");
    });
console.log("b");