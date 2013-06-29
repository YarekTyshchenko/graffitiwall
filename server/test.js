var MongoClient = require('mongodb').MongoClient;
MongoClient.connect('mongodb://127.0.0.1:27017/graffitiwall', {db: {native_parser: true}}, function(err, db) {
    if(err) throw err;

    var collection = db.collection('points');
    var cursor = collection.find({culled: false}).batchSize(10000);
    cursor.count(function(err, total) {
        var i = 0;
        cursor.each(function(err, item) {
            i++;
            if (i%10000===0) {
                console.log([i++,'/',total].join(' '));
            }
        });
    });
});