$(document).on('pageinit',  function() {      
console.log("page init");
});

$(document).on('pageinit', '#main', function() {      
    Tertius.setup();
});
