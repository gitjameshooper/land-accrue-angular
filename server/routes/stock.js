const express = require('express'),
    router = express.Router();

// GET Stock Data from Multiple stocks

// GET Stock Data from 1 symbol  http://localhost:3000/stock/ACU
router.get('/:symbol', function(req, res) {

    let startTimestamp = req.query && req.query.startDate ? new Date(req.query.startDate).getTime() : undefined,
        endTimestamp = req.query && req.query.endDate ? new Date(req.query.endDate).getTime() : undefined,
        date = req.query && req.query.date ? req.query.date : undefined;

    if (date) {
        stockModel.findOne({ symbol: req.params.symbol }, { candleSticks: { $elemMatch: { date: date } } }, (err, docs) => {
            if (err) {
                console.log(err);
                res.send(err);
            }
            res.send(docs);
        });
    } else if (startTimestamp) {
        stockModel.findOne({
                symbol: req.params.symbol
            }).map((symbol) => {
                let arr = [];
                symbol['candleSticks'].forEach((v) => {
                    if (v.timestamp >= startTimestamp) {
                        arr.push(v);
                    }
                });
                return arr;
            })
            .exec((err, docs) => {
                if (err) {
                    console.log(err);
                    res.send(err);
                }
                res.send(docs);
            });

    } else {
        stockModel.findOne({ symbol: req.params.symbol }, (err, docs) => {
            if (err) {
                console.log(err);
                res.send(err);
            }
            res.send(docs);
        });
    }
});


module.exports = router;