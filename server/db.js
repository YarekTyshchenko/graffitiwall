var MongoClient = require('mongodb').MongoClient;

exports.connect = function(onConnect) {
    MongoClient.connect('mongodb://127.0.0.1:27017/graffitiwall', {db: {native_parser: true}}, function(err, db) {
        if(err) throw err;
        var collection = db.collection('points');
        onConnect({
            insert: function(data) {
                collection.insert(data, function(){});
            },
            replay: function(namespace, onData) {
                var list = [];
                var index = 0;
                var cursor = collection
                    .find({namespace: namespace, culled: false})
                    .sort({_id: 1})
                    .batchSize(1000);
                cursor.count(function(err, total) {
                    cursor.each(function(err, row) {
                        if (row) {
                            list.push(row);
                            if (list.length >= 1000) {
                                index += list.length;
                                onData(list, index, total, false);
                                list = [];
                            }
                        } else {
                            onData(list, index += list.length, total, true);
                        }
                    });
                });
            }
        });
    });
};