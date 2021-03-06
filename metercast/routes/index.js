var express = require('express');
var router = express.Router();
var moment = require('moment');
var sprintf = require("sprintf-js").sprintf;

var nedb = require('nedb');
var data = new nedb({ filename: 'metercast.db', autoload: true });



router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/', function(req, res, next) {
    var props = ['gas', 'water','electricity'];
    var date = req.body['date'];

    for (i in props) {
        var name = props[i];
        data.insert({ 'date': date, 'type': name, 'value': req.body[name] }, function (err) {
            if (err) {
                next(err);
            }
        });
    }

    res.render('index', {
        message: 'Your numbers are in safe place now!'
    });
});


function get_all(limit, callback) {
    var queries = 3;
    var all_docs = new Object;

    // async database query below
    var findMe = function(type) {
        data.find({'type':type}).sort({'date':-1}).limit(limit).exec(function (err, docs) {
            if (err) { next(err); }
            all_docs[type] = docs;

            // calculate deltas between current and previous data points
            for (var i = 0; i < all_docs[type].length; i++) {
                if (i < all_docs[type].length - 1) {
                    // old value is i+1, since we sort desc
                    var j = i + 1;
                    var newVal = all_docs[type][i]['value'];
                    var oldVal = all_docs[type][j]['value'];
                    all_docs[type][i]['diff'] = sprintf("%03d", (newVal - oldVal));

                    var now    = moment(all_docs[type][i]['date']);
                    var before = moment(all_docs[type][j]['date']);
                    var days_between = now.diff(before, 'days');

                    all_docs[type][i]['days_between']
                        = sprintf("%02d", days_between);
                    all_docs[type][i]['avg']
                        = sprintf("%.2f", (newVal - oldVal) / days_between);
                }
                else {
                    all_docs[type][i]['diff'] = false;
                    all_docs[type][i]['avg'] = false;
                }

                var dayMoment = moment(all_docs[type][i]['date']);
                all_docs[type][i]['dayOfWeek'] = dayMoment.format("ddd");
            }

            queries--;
            finish();
        });
    };

    var finish = function() {
        if (queries == 0) {
            callback(all_docs);
        }
    };

    var props = ['electricity', 'gas', 'water'];
    for (i in props) {
        findMe(props[i]);
    }
}

router.get('/list', function(req, res, next) {
    var limit = req.query.limit || 5;
    if (req.query.all) { limit = 0; }

    var all_docs = get_all(limit, function(all_docs) {
        res.render(
            'list',
            {'all_documents':all_docs, 'limit':limit}
        );
    });
});


router.get('/graphs', function(req, res, next) {
    var all_docs = get_all(0, function(all_docs) {
        res.render(
            'graphs',
            {'all_documents':all_docs}
        );
    });
});

module.exports = router;
