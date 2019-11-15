const d3 = require('d3')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')


function createJSONFile(propertyData, name) {
    fs.writeFileSync('./src/assets/json/' + name + '.json', JSON.stringify(propertyData));
    console.log('\x1b[36m%s\x1b[0m', 'Task: Format ' + name.toUpperCase() + ' Property Data Complete');
}

function formatSoldData(csv) {
    let orderArr = [];

    csv.forEach(o => {
        let acreSquareFeet = 43560;
        orderArr.push({
            'ADDRESS': o['ADDRESS'],
            'CITY': o['CITY'],
            'STATE': o['STATE OR PROVINCE'],
            'ZIP': o['ZIP OR POSTAL CODE'],
            'SOLD PRICE': o['PRICE'],
            'LOT AREA': Number(o['LOT SIZE']),
            'LOT ACREAGE': Number(parseFloat(o['LOT SIZE'] / acreSquareFeet).toFixed(2)),
            'PRICE PER ACRE': Math.round(o['PRICE'] / (o['LOT SIZE'] / acreSquareFeet)),
            'LATITUDE': o['LATITUDE'],
            'LONGITUDE': o['LONGITUDE'],
            'URL': o['URL (SEE http://www.redfin.com/buy-a-home/comparative-market-analysis FOR INFO ON PRICING)'],
        })


    })

    return orderArr
}

function formatBuyData(csv) {
    let orderArr = [];

    csv.forEach(o => {
        let marketValueArr = o['MARKET TOTAL VALUE'].replace('$', '').replace(',', '').split('.');
        orderArr.push({
            'SITUS FULL ADDRESS': o['SITUS FULL ADDRESS'].trim(),
            'SITUS CITY': o['SITUS CITY'].trim(),
            'ALTERNATE APN': o['ALTERNATE APN'].replace('\"', '').replace('\"', '').replace('=', ''),
            'COUNTY': o['COUNTY'],
            'LOT AREA': Number(o['LOT AREA']),
            'LOT ACREAGE': Number(o['LOT ACREAGE']),
            'LATITUDE': o['LATITUDE'],
            'LONGITUDE': o['LONGITUDE'],
            'IN FLOOD ZONE': o['INSIDE SFHA'].includes('TRUE'),
            'OWNER MAILING NAME': o['OWNER MAILING NAME'],
            'MAILING STREET ADDRESS': o['MAILING STREET ADDRESS'].trim(),
            'MAIL CITY': o['MAIL CITY'].trim(),
            'MAIL STATE': o['MAIL STATE'].trim(),
            'MAIL ZIPZIP4': o['MAIL ZIP/ZIP+4'].replace('\"', '').replace('\"', '').replace('=', ''),
            'MARKET TOTAL VALUE': Number(marketValueArr[0]),
            'EST VALUE': 0,
            'OFFER': 0,
        })


    })

    return orderArr
}

function formatOfferData(csv) {
    let orderArr = [];

    csv.forEach(o => {

        let offer = o[' Offer '].replace('$', '').replace(',', '').split('.');
        orderArr.push({
            'SITUS FULL ADDRESS': o['SITUS FULL ADDRESS'].trim(),
            'JASON EST VALUE': Number(o['est value']),
            'JASON OFFER': Number(offer[0]),
        })


    })

    return orderArr
}

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit == "K") { dist = dist * 1.609344 }
        if (unit == "N") { dist = dist * 0.8684 }
        return dist;
    }
}

function mergeD(buyData, soldData, offerData) {


    _.forEach(buyData, (bv, bk) => {
        let soldArr = [],
            ppArr = [],
            pricePerAcreArr = [],
            totalPricePerAcreM1 = 0,
            totalPricePerAcreM2 = 0,
            offerObj = _.find(offerData, { 'SITUS FULL ADDRESS': buyData[bk]['SITUS FULL ADDRESS'] });
        _.forEach([0, 1, 2, 3, 4, 5, 6, 7, 8], (v, k) => {
            _.forEach(soldData, (sv, sk) => {
                let d = distance(bv['LATITUDE'], bv['LONGITUDE'], sv['LATITUDE'], sv['LONGITUDE'], 'M'),
                    minAcre = buyData[bk]['LOT ACREAGE'] - 1,
                    maxAcre = buyData[bk]['LOT ACREAGE'] + 1;
                if (buyData[bk]['LOT ACREAGE'] > 12) {
                    minAcre = buyData[bk]['LOT ACREAGE'] - 7;
                    maxAcre = buyData[bk]['LOT ACREAGE'] + 7;
                } else if (buyData[bk]['LOT ACREAGE'] > 8) {
                    minAcre = buyData[bk]['LOT ACREAGE'] - 4;
                    maxAcre = buyData[bk]['LOT ACREAGE'] + 4;
                } else if (buyData[bk]['LOT ACREAGE'] > 5) {
                    minAcre = buyData[bk]['LOT ACREAGE'] - 2;
                    maxAcre = buyData[bk]['LOT ACREAGE'] + 2;
                } else if (buyData[bk]['LOT ACREAGE'] > 3) {
                    minAcre = buyData[bk]['LOT ACREAGE'] - 1;
                    maxAcre = buyData[bk]['LOT ACREAGE'] + 1;
                } else if (buyData[bk]['LOT ACREAGE'] > .50) {
                    minAcre = buyData[bk]['LOT ACREAGE'] - .50;
                    maxAcre = buyData[bk]['LOT ACREAGE'] + .50;
                } else {
                    minAcre = buyData[bk]['LOT ACREAGE'] - .25;
                    maxAcre = buyData[bk]['LOT ACREAGE'] + .25;
                }
                // Less than 1 miles away and close to the same lot size


                if (soldArr.length < 5 && d < v + 1 && d > v && minAcre < soldData[sk]['LOT ACREAGE'] && maxAcre > soldData[sk]['LOT ACREAGE']) {
                    soldData[sk]['distance'] = Math.round(d * 100) / 100
                    totalPricePerAcreM1 += soldData[sk]['PRICE PER ACRE'];
                    pricePerAcreArr.push(soldData[sk]['PRICE PER ACRE']);
                    soldArr.push(soldData[sk]);
                }
            });
        });

        ppArr = pricePerAcreArr.length < 10 ? _(pricePerAcreArr).sortBy().take(Math.round(pricePerAcreArr.length / 2)).value() : _(pricePerAcreArr).sortBy().take(Math.round(pricePerAcreArr.length / 4)).value();


        buyData[bk]['avgPPA'] = ppArr.length > 0 ? Math.round(_.sum(ppArr) / ppArr.length) : 0;
        buyData[bk]['avgPPA2'] = totalPricePerAcreM1 > 0 ? Math.round(totalPricePerAcreM1 / soldArr.length) : 0;
        // Flood Zone TRUE-> discount 50%
        if (buyData[bk]['IN FLOOD ZONE']) {
            buyData[bk]['avgPPA'] *= .50;
            buyData[bk]['avgPPA2'] *= .50;
        }

        buyData[bk]['EST VALUE'] = Math.round(buyData[bk]['avgPPA'] * buyData[bk]['LOT ACREAGE']);
        buyData[bk]['EST VALUE2'] = Math.round(buyData[bk]['avgPPA2'] * buyData[bk]['LOT ACREAGE'])
        // buyData[bk]['OFFER'] = Math.round(buyData[bk]['EST VALUE'] * .50); 
        buyData[bk]['OFFER'] = Math.floor((buyData[bk]['EST VALUE'] * .50) / 100) * 100;
        buyData[bk]['OFFER2'] = Math.floor((buyData[bk]['EST VALUE2'] * .50) / 100) * 100;
        buyData[bk]['OFFER PPA'] = Math.round(buyData[bk]['OFFER'] / buyData[bk]['LOT ACREAGE']);
        buyData[bk]['JASON OFFER'] = offerObj ? offerObj['JASON OFFER'] : 0;
        buyData[bk]['JASON EST VALUE'] = offerObj ? offerObj['JASON EST VALUE'] : 0;
        

        // Add status color based off the amount of sold propeties
        if (soldArr.length > 3) {
            buyData[bk]['statusColor'] = 'green';
        } else if (soldArr.length <= 3 && soldArr.length > 1) {
            buyData[bk]['statusColor'] = 'yellow';
        } else {
            buyData[bk]['statusColor'] = 'red';
        }


        buyData[bk]['soldArr'] = soldArr;

    });

    createJSONFile(buyData, 'total');

}


var buyCSVData = fs.readFileSync('./csv/buy.csv', 'utf8');
buyCSVData = d3.csvParse(buyCSVData);

var soldCSVData = fs.readFileSync('./csv/sold.csv', 'utf8');
soldCSVData = d3.csvParse(soldCSVData);

var offerCSVData = fs.readFileSync('./csv/offer.csv', 'utf8');
offerCSVData = d3.csvParse(offerCSVData);

createJSONFile(formatBuyData(buyCSVData), 'buy');
createJSONFile(formatSoldData(soldCSVData), 'sold');
createJSONFile(formatOfferData(offerCSVData), 'offer');


var buyJSONData = JSON.parse(fs.readFileSync('./src/assets/json/buy.json', 'utf8'));
var soldJSONData = JSON.parse(fs.readFileSync('./src/assets/json/sold.json', 'utf8'));
var offerJSONData = JSON.parse(fs.readFileSync('./src/assets/json/offer.json', 'utf8'));


mergeD(buyJSONData, soldJSONData, offerJSONData);