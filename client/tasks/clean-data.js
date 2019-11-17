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
            'distance': 0
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
            'id': 0,
            'avgPPA': 0,
            'avgPPA2': 0,
            'avgPPA3': 0,
            'estValue': 0,
            'estValue2': 0,
            'estValue3': 0,
            'offer': 0,
            'offer2': 0,
            'offer3': 0,
            'offerPPA': 0,
            'jasonOffer': 0,
            'jasonEstValue': 0,
            'statusColor': '',
            'marketValueFlag': false,
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
            'jasonEstValue': Number(o['est value']),
            'jasonOffer': Number(offer[0]),
        })


    })

    return orderArr
}

function distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
        return 0;
    } else {
        let radlat1 = Math.PI * lat1 / 180;
        let radlat2 = Math.PI * lat2 / 180;
        let theta = lon1 - lon2;
        let radtheta = Math.PI * theta / 180;
        let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
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

function mergeData(buyData, soldData, offerData) {
    let dupArr = [],
        uniqueId = 1,
        BD = [];
    _.forEach(buyData, (bv, bk) => {
        let soldArr = [],
            totalPricePerAcre = 0,
            offerObj = _.find(offerData, { 'SITUS FULL ADDRESS': buyData[bk]['SITUS FULL ADDRESS'] });
            buyData[bk]['id'] = uniqueId++;

        // 8 miles radius from buy property - Loops through each mile adding to the sold array
        _.forEach([0, 1, 2, 3, 4, 5, 6, 7, 8], (v, k) => {
            _.forEach(soldData, (sv, sk) => {
                let soldDistance = distance(bv['LATITUDE'], bv['LONGITUDE'], sv['LATITUDE'], sv['LONGITUDE'], 'M'),
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
              
                // Less than 5 sold properties on array and Less than (d) miles away and close to the same lot acreage
                if (soldArr.length < 5 && soldDistance < v + 1 && soldDistance > v && minAcre < soldData[sk]['LOT ACREAGE'] && maxAcre > soldData[sk]['LOT ACREAGE']) {
                  let soldProp = soldData.slice();
                    soldProp[sk]['distance'] = Math.round(soldDistance * 100) / 100;
                        // console.log('BUY:'+buyData[bk]['SITUS FULL ADDRESS']);
                        // console.log(soldProp[sk]['ADDRESS']+'-'+soldDistance);
                        // console.log('-------------------');
                    totalPricePerAcre += soldData[sk]['PRICE PER ACRE'];
                    soldArr.push(soldProp[sk]);

                  
                    // console.log(soldArr);
                }
            });
        });
        buyData[bk]['soldArr'] = [];
          buyData[bk]['soldArr'] = soldArr;
            console.log('-------------------');
              console.log('-------------------');
                console.log('-------------------');
        

        // Top 3 Closests by distance: Properties Price per Acre
        let sortedDistanceSoldArr = _.sortBy(soldArr, ['distance']);
        let totalPPADistance = 0;


        if (sortedDistanceSoldArr[0] && sortedDistanceSoldArr[1] && sortedDistanceSoldArr[2]) {
            totalPPADistance = sortedDistanceSoldArr[0]['PRICE PER ACRE'] + sortedDistanceSoldArr[1]['PRICE PER ACRE'] + sortedDistanceSoldArr[2]['PRICE PER ACRE'];
        } else if (sortedDistanceSoldArr[0] && sortedDistanceSoldArr[1]) {
            totalPPADistance = sortedDistanceSoldArr[0]['PRICE PER ACRE'] + sortedDistanceSoldArr[1]['PRICE PER ACRE'];
        } else if (sortedDistanceSoldArr[0]) {
            totalPPADistance = sortedDistanceSoldArr[0]['PRICE PER ACRE'];
        }

        // if (buyData[bk]['SITUS FULL ADDRESS'] === '7998 FM 539 SUTHERLAND SPRINGS,TX 78161') {
        //     console.log(sortedDistanceSoldArr);
        //     console.log(totalPPADistance);
        // }
        buyData[bk]['avgPPA'] = totalPPADistance / 3;


        // 3 middle with avg. Price per Acre
        let sortedPPASoldArr = _.sortBy(soldArr, ['PRICE PER ACRE']);

        let totalPPAMiddle = 0;
        if (sortedPPASoldArr[1] && sortedPPASoldArr[2] && sortedPPASoldArr[3]) {
            totalPPAMiddle = sortedPPASoldArr[1]['PRICE PER ACRE'] + sortedPPASoldArr[2]['PRICE PER ACRE'] + sortedPPASoldArr[3]['PRICE PER ACRE'];
        } else if (sortedPPASoldArr[1] && sortedPPASoldArr[2]) {
            totalPPAMiddle = sortedPPASoldArr[1]['PRICE PER ACRE'] + sortedPPASoldArr[2]['PRICE PER ACRE'];
        } else if (sortedPPASoldArr[1]) {
            totalPPAMiddle = sortedPPASoldArr[1]['PRICE PER ACRE'];
        }
        buyData[bk]['avgPPA2'] = totalPPAMiddle / 3;

        // All 5 avg. Price per Acre
        buyData[bk]['avgPPA3'] = totalPricePerAcre > 0 ? Math.round(totalPricePerAcre / soldArr.length) : 0;

        // Flood Zone TRUE-> discount 50%
        if (buyData[bk]['IN FLOOD ZONE']) {
            buyData[bk]['avgPPA'] *= .50;
            buyData[bk]['avgPPA2'] *= .50;
            buyData[bk]['avgPPA3'] *= .50;
        }

        // Calculates Estimated Values and Offers
        buyData[bk]['estValue'] = Math.round(buyData[bk]['avgPPA'] * buyData[bk]['LOT ACREAGE']);
        buyData[bk]['estValue2'] = Math.round(buyData[bk]['avgPPA2'] * buyData[bk]['LOT ACREAGE'])
        buyData[bk]['estValue3'] = Math.round(buyData[bk]['avgPPA3'] * buyData[bk]['LOT ACREAGE'])
        buyData[bk]['offer'] = Math.floor((buyData[bk]['estValue'] * .50) / 100) * 100;
        buyData[bk]['offer2'] = Math.floor((buyData[bk]['estValue2'] * .50) / 100) * 100;
        buyData[bk]['offer3'] = Math.floor((buyData[bk]['estValue3'] * .50) / 100) * 100;
        buyData[bk]['offerPPA'] = Math.round(buyData[bk]['offer'] / buyData[bk]['LOT ACREAGE']);
        buyData[bk]['jasonOffer'] = offerObj ? offerObj['jasonOffer'] : 0;
        buyData[bk]['jasonEstValue'] = offerObj ? offerObj['jasonEstValue'] : 0;


        // Add status color based off the amount of sold propeties
        if (soldArr.length > 3) {
            buyData[bk]['statusColor'] = 'green';
        } else if (soldArr.length <= 3 && soldArr.length > 1) {
            buyData[bk]['statusColor'] = 'yellow';
        } else {
            buyData[bk]['statusColor'] = 'red';
        }

        // MARKET TOTAL VALUE vs Estimated Value
        buyData[bk]['marketValueFlag'] = (buyData[bk]['statusColor'] !== 'red') && (buyData[bk]['MARKET TOTAL VALUE'] / buyData[bk]['estValue']) > 2 ? true : false;

        if (buyData[bk]['marketValueFlag']) {
            buyData[bk]['statusColor'] = 'red';
        }
        if (buyData[bk]['SITUS FULL ADDRESS'] === '7998 FM 539 SUTHERLAND SPRINGS,TX 78161') {
            console.log(sortedDistanceSoldArr);

        }
       

        // Remove Duplicates: Choose from the most sold data for each property
        _.forEach(buyData, (bv2, bk2) => {
            if (buyData[bk2]['soldArr'] && buyData[bk]['MAILING STREET ADDRESS'] === buyData[bk2]['MAILING STREET ADDRESS'] && buyData[bk]['SITUS FULL ADDRESS'] !== buyData[bk2]['SITUS FULL ADDRESS']) {

                if (buyData[bk]['soldArr'].length === buyData[bk2]['soldArr'].length) {
                    dupArr.push(buyData[bk]);
                } else if (buyData[bk]['soldArr'].length < buyData[bk2]['soldArr'].length) {
                    dupArr.push(buyData[bk]);
                } else if (buyData[bk]['soldArr'].length > buyData[bk2]['soldArr'].length) {
                    dupArr.push(buyData[bk2]);
                }
            }

        });
        BD.push(buyData[bk]);
// console.log(BD[bk]);
    });

    // Removes Duplicate Mailing addresses filteredBuyData : buyData
    let filteredBuyData = _.differenceBy(buyData, dupArr, 'id');
    
        console.log(BD[2].soldArr);
    console.log('--------------');
        console.log(BD[4].soldArr);
    // createJSONFile(filteredBuyData, 'total');

}

// Read and Write Files
let buyCSVData = fs.readFileSync('./csv/buy2.csv', 'utf8');
buyCSVData = d3.csvParse(buyCSVData);

let soldCSVData = fs.readFileSync('./csv/sold.csv', 'utf8');
soldCSVData = d3.csvParse(soldCSVData);

let offerCSVData = fs.readFileSync('./csv/offer.csv', 'utf8');
offerCSVData = d3.csvParse(offerCSVData);

createJSONFile(formatBuyData(buyCSVData), 'buy');
createJSONFile(formatSoldData(soldCSVData), 'sold');
createJSONFile(formatOfferData(offerCSVData), 'offer');


let buyJSONData = JSON.parse(fs.readFileSync('./src/assets/json/buy.json', 'utf8'));
let soldJSONData = JSON.parse(fs.readFileSync('./src/assets/json/sold.json', 'utf8'));
let offerJSONData = JSON.parse(fs.readFileSync('./src/assets/json/offer.json', 'utf8'));


mergeData(buyJSONData, soldJSONData, offerJSONData);