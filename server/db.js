var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

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
                var cursor = collection.find(
                        {namespace: namespace, culled: false},
                        {_id: 1, x1: 1, y1: 1, x2: 1, y2: 1, color: 1, width: 1}
                    ).sort({_id: -1})
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
            },
            cull: function(idObject) {
                collection.update({_id: idObject}, {$set: {culled: true}}, function() {});
            },
            getNamespaces: function(callback) {
                collection.aggregate({$group: {
                    _id:"$namespace",
                    x1: {$max : "$x1"},
                    x2: {$max : "$x2"},
                    y1: {$max : "$y1"},
                    y2: {$max : "$y2"}
                }}, function(err, results) {
                    results.forEach(function(namespace) {
                        var width = Math.max(namespace.x1, namespace.x2);
                        var height = Math.max(namespace.y1, namespace.y2);
                        callback(namespace._id, width, height);
                    });
                });
            },
            getPoints: function(namespace, callback) {
                var cursor = collection.find(
                    {namespace: namespace, culled: false},
                    {_id: 1, x1: 1, y1: 1, x2: 1, y2: 1, width: 1}
                ).sort({_id: -1});
                cursor.count(function(err, total) {
                    cursor.each(function(err, row) {
                        if (row === null) return;
                        callback(row, total);
                    });
                });
            }
        });
    });
};