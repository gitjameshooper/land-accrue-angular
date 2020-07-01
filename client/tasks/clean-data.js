const d3 = require('d3')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const { Parser } = require('json2csv')

var county = 'grayson';

function createJSONFile(propertyData, name) {
    fs.writeFileSync('./src/assets/json/' + name + '.json', JSON.stringify(propertyData));
    console.log('\x1b[36m%s\x1b[0m', 'Task: Format ' + name.toUpperCase() + ' JSON Property Data Complete');
}

function createCSVFile(propertyData, name) {
 
    const fields =  [
    "statusColor",
    "estimatedValue",
    "LOT ACREAGE",
    "pricePerAcre",
    "offer",
    "SUBDIVISION",
    "SITUS CITY",
    "SITUS ZIP CODE",
    "LATITUDE",
    "LONGITUDE",
    "MARKET TOTAL VALUE",
    "MARKET IMPROVEMENT VALUE",
    "MUNICIPALITY/TOWNSHIP",
    "LEGAL DESCRIPTION",
    "LEGAL LOT",
    "IN FLOOD ZONE",
    "SITUS STREET ADDRESS",
    "COUNTY",
    "SITUS STATE",
    "LOT AREA",
    "APN - FORMATTED",
    // "APN - UNFORMATTED",
    "OWNER MAILING NAME",
    "MAILING STREET ADDRESS",
    "MAIL CITY",
    "MAIL STATE",
    "MAIL ZIPZIP4",
    "date",
    "propertyLink"
    ];
     
     
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(propertyData);
 
    fs.writeFileSync('./csv/' + county + '/' + name + '.csv', csv);
    console.log('\x1b[36m%s\x1b[0m', 'Task: Format ' + name.toUpperCase() + ' CSV Property Data Complete');
}

function formatSoldData(csv) {
    let orderArr = [];

    csv.forEach(o => {
        // console.log(o);
        let acreSquareFeet = 43560,
            priceArr = o['PRICE'].replace('$', '').replace(',', '').replace(' ', '').split('.');
        orderArr.push({
            'ADDRESS': o['ADDRESS'],
            'CITY': o['CITY'],
            'STATE': o['STATE OR PROVINCE'],
            'ZIP': o['ZIP OR POSTAL CODE'],
            'SOLD PRICE': Number(priceArr[0]),
            'LOT AREA': Number(o['LOT SIZE']),
            'LOT ACREAGE': Number(parseFloat(o['LOT SIZE'] / acreSquareFeet).toFixed(2)),
            'PRICE PER ACRE': Math.round(Number(priceArr[0]) / (o['LOT SIZE'] / acreSquareFeet)),
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
  
               // console.log(o);
        let marketValueArr = o['MARKET TOTAL VALUE'].replace('$', '').replace(',', '').replace(' ', '').split('.'),
            marketImproveValueArr = o['MARKET IMPROVEMENT VALUE'].replace('$', '').replace(',', '').replace(' ', '').split('.');
        orderArr.push({
            'SITUS STREET ADDRESS': o['SITUS STREET ADDRESS'].trim().replace(',', ''),
            'SITUS CITY': o['SITUS CITY'].trim(),
            'SITUS STATE': o['SITUS STATE'].trim(),
            'SITUS ZIP CODE': o['SITUS ZIP CODE'].trim(),
            // 'ALTERNATE APN': o['ALTERNATE APN'].replace('\"', '').replace('\"', '').replace('=', ''),
            'COUNTY': o['COUNTY'],
            'LOT AREA': Number(o['LOT AREA']),
            'LOT ACREAGE': Number(o['LOT ACREAGE']),
            'LEGAL DESCRIPTION' : o['LEGAL DESCRIPTION'],
            'LEGAL LOT' : o['LEGAL LOT'],
            'SUBDIVISION' : o['SUBDIVISION'],
            'MUNICIPALITY/TOWNSHIP' : o['MUNICIPALITY/TOWNSHIP'],
            'LATITUDE': o['LATITUDE'],
            'LONGITUDE': o['LONGITUDE'],
 
            // 'APN - UNFORMATTED': o['APN - UNFORMATTED'].length > o['ALTERNATE APN'].length ? o['ALTERNATE APN'] : o['APN - UNFORMATTED'],
            // 'APN - UNFORMATTED': o['APN - UNFORMATTED'],
            'APN - FORMATTED': o['APN - FORMATTED'],
            // 'IN FLOOD ZONE': o['INSIDE SFHA'].includes('TRUE'),
            // Flood zone A and AE  true;  X  and blank false
            'IN FLOOD ZONE': o['FLOOD ZONE CODE'],
            'OWNER MAILING NAME': o['OWNER MAILING NAME'],
            'MAILING STREET ADDRESS': o['MAILING STREET ADDRESS'].trim(),
            'MAIL CITY': o['MAIL CITY'].trim(),
            'MAIL STATE': o['MAIL STATE'].trim(),
            'MAIL ZIPZIP4': o['MAIL ZIP/ZIP+4'].replace('\"', '').replace('\"', '').replace('=', ''),
            'MARKET TOTAL VALUE': Number(marketValueArr[0]),
            'MARKET IMPROVEMENT VALUE': Number(marketImproveValueArr[0]),
            'date': getFormattedDate(),
            'id': 0,
            'pricePerAcre': 0,
            'avgPPA': 0,
            'avgPPA2': 0,
            'avgPPA3': 0,
            'estValue': 0,
            'estValue2': 0,
            'estValue3': 0,
            'offer': 0,
            'offer1': 0,
            'offer2': 0,
            'offer3': 0,
            'offerPPA': 0,
            'jasonOffer': 0,
            'jasonEstValue': 0,
            'statusColor': '',
            'marketValueFlag': false,
            // 'propertyLink': 'https://www.google.com/search?q='+o['SITUS FULL ADDRESS'].trim().replace(/[ ]/g,'+').replace('++','+')
            'propertyLink': 'https://www.google.com/maps/place/'+o['LATITUDE']+'+'+o['LONGITUDE']
        })


    })

    return orderArr
}

function getFormattedDate() {
    var date = new Date();
     return ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '/' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate())) + '/' + date.getFullYear();
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
// function mergeData(buyData, soldData, offerData) {
function mergeData(buyData, soldData) {
    let dupArr = [],
        uniqueId = 1,
        BD = [],
        buyDataAll = [],
        buyDataFlood = [],
        buyDataNonFlood = [];
    _.forEach(buyData, (bv, bk) => {
        let soldArr = [],
            totalPricePerAcre = 0;
            // offerObj = _.find(offerData, { 'SITUS FULL ADDRESS': buyData[bk]['SITUS FULL ADDRESS'] });
            buyData[bk]['id'] = uniqueId++;

        // 8 miles radius from buy property - Loops through each mile adding to the sold array
        _.forEach([0, 1, 2, 3, 4, 5, 6, 7, 8], (v, k) => {
            _.forEach(soldData, (sv, sk) => {
                let soldProp = { ...soldData[sk]},
                    soldDistance = distance(bv['LATITUDE'], bv['LONGITUDE'], sv['LATITUDE'], sv['LONGITUDE'], 'M'),
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
                if (soldArr.length < 5 && soldDistance < v + 1 && soldDistance > v && minAcre < soldProp['LOT ACREAGE'] && maxAcre > soldProp['LOT ACREAGE']) {

                    soldProp['distance'] = Math.round(soldDistance * 100) / 100;
                    totalPricePerAcre += soldData[sk]['PRICE PER ACRE'];
                    soldArr.push(soldProp);
                }
            });
        });
        buyData[bk]['soldArr'] = soldArr;


        // Top 3 Closests by distance: Properties Price per Acre
        let sortedDistanceSoldArr = _.sortBy(soldArr, ['distance']);
        let totalPPADistance = 0;
        let totalPPADistanceDivider = 0;


        if (sortedDistanceSoldArr[0] && sortedDistanceSoldArr[1] && sortedDistanceSoldArr[2]) {

            totalPPADistance = sortedDistanceSoldArr[0]['PRICE PER ACRE'] + sortedDistanceSoldArr[1]['PRICE PER ACRE'] + sortedDistanceSoldArr[2]['PRICE PER ACRE'];
           totalPPADistanceDivider = 3;
        } else if (sortedDistanceSoldArr[0] && sortedDistanceSoldArr[1]) {
            totalPPADistance = sortedDistanceSoldArr[0]['PRICE PER ACRE'] + sortedDistanceSoldArr[1]['PRICE PER ACRE'];
            totalPPADistanceDivider = 2;
        } else if (sortedDistanceSoldArr[0]) {
            totalPPADistance = sortedDistanceSoldArr[0]['PRICE PER ACRE'];
            totalPPADistanceDivider = 1;
        }

        buyData[bk]['avgPPA'] = totalPPADistance / totalPPADistanceDivider;


        // 3 middle with avg. Price per Acre
        let sortedPPASoldArr = _.sortBy(soldArr, ['PRICE PER ACRE']);

        let totalPPAMiddle = 0;
        let totalPPAMiddleDivider = 0;
        if (sortedPPASoldArr[1] && sortedPPASoldArr[2] && sortedPPASoldArr[3]) {
            totalPPAMiddle = sortedPPASoldArr[1]['PRICE PER ACRE'] + sortedPPASoldArr[2]['PRICE PER ACRE'] + sortedPPASoldArr[3]['PRICE PER ACRE'];
            totalPPAMiddleDivider = 3;
        } else if (sortedPPASoldArr[1] && sortedPPASoldArr[2]) {
            totalPPAMiddle = sortedPPASoldArr[1]['PRICE PER ACRE'] + sortedPPASoldArr[2]['PRICE PER ACRE'];
            totalPPAMiddleDivider = 2;
        } else if (sortedPPASoldArr[1]) {
            totalPPAMiddle = sortedPPASoldArr[1]['PRICE PER ACRE'];
            totalPPAMiddleDivider = 1;
        }
        buyData[bk]['avgPPA2'] = totalPPAMiddle / totalPPAMiddleDivider;

        // All 5 avg. Price per Acre
        buyData[bk]['avgPPA3'] = totalPricePerAcre > 0 ? Math.round(totalPricePerAcre / soldArr.length) : 0;

        // Flood Zone TRUE-> discount 25%
        // if (buyData[bk]['IN FLOOD ZONE']) {
        //     buyData[bk]['avgPPA'] *= .75;
        //     buyData[bk]['avgPPA2'] *= .75;
        //     buyData[bk]['avgPPA3'] *= .75;
        // }
        
        // Calculates Estimated Values and Offers
        buyData[bk]['estValue'] = Math.round(buyData[bk]['avgPPA'] * buyData[bk]['LOT ACREAGE']);
        buyData[bk]['estValue2'] = Math.round(buyData[bk]['avgPPA2'] * buyData[bk]['LOT ACREAGE'])
        buyData[bk]['estValue3'] = Math.round(buyData[bk]['avgPPA3'] * buyData[bk]['LOT ACREAGE'])
        buyData[bk]['offer1'] = Math.floor((buyData[bk]['estValue'] * .50) / 100) * 100;
        buyData[bk]['offer2'] = Math.floor((buyData[bk]['estValue2'] * .50) / 100) * 100;
        buyData[bk]['offer3'] = Math.floor((buyData[bk]['estValue3'] * .50) / 100) * 100;
        buyData[bk]['offerPPA'] = Math.round(buyData[bk]['offer'] / buyData[bk]['LOT ACREAGE']);

        // buyData[bk]['jasonOffer'] = offerObj ? offerObj['jasonOffer'] : 0;
        // buyData[bk]['jasonEstValue'] = offerObj ? offerObj['jasonEstValue'] : 0;


        // Add status color based off the amount of sold propeties
        if (soldArr.length > 3) {
            buyData[bk]['statusColor'] = 'green';
            buyData[bk]['offer'] = buyData[bk]['offer2'];
            buyData[bk]['estimatedValue'] = buyData[bk]['estValue2'];

        } else if (soldArr.length <= 3 && soldArr.length > 1) {
            buyData[bk]['statusColor'] = 'yellow';
            buyData[bk]['offer'] = buyData[bk]['offer3']
            buyData[bk]['estimatedValue'] = buyData[bk]['estValue3'];
        } else {
            buyData[bk]['statusColor'] = 'red';
            buyData[bk]['offer'] = buyData[bk]['offer3']
            buyData[bk]['estimatedValue'] = buyData[bk]['estValue3'];
        }
        
        // Calculate Price Per Acre
        buyData[bk]['pricePerAcre'] = Math.round(buyData[bk]['estimatedValue'] / buyData[bk]['LOT ACREAGE']);
        // MARKET TOTAL VALUE vs Estimated Value
        buyData[bk]['marketValueFlag'] = (buyData[bk]['statusColor'] !== 'red') && (buyData[bk]['MARKET TOTAL VALUE'] / buyData[bk]['estValue']) > 2 ? true : false;

        if (buyData[bk]['marketValueFlag']) {
            buyData[bk]['statusColor'] = 'red';
        }


        // Remove Duplicates: Choose from the most sold data for each property
        // _.forEach(buyData, (bv2, bk2) => {
        //     if (buyData[bk2]['soldArr'] && buyData[bk]['MAILING STREET ADDRESS'] === buyData[bk2]['MAILING STREET ADDRESS'] && buyData[bk]['SITUS FULL ADDRESS'] !== buyData[bk2]['SITUS FULL ADDRESS']) {

        //         if (buyData[bk]['soldArr'].length === buyData[bk2]['soldArr'].length) {
        //             dupArr.push(buyData[bk]);
        //         } else if (buyData[bk]['soldArr'].length < buyData[bk2]['soldArr'].length) {
        //             dupArr.push(buyData[bk]);
        //         } else if (buyData[bk]['soldArr'].length > buyData[bk2]['soldArr'].length) {
        //             dupArr.push(buyData[bk2]);
        //         }
        //     }

        // });

        // Flood Zone Seperationg Data
        // if (buyData[bk]['IN FLOOD ZONE']) {
        //     buyDataFlood[bk] = buyData[bk];
        // } else {
        //     buyDataNonFlood[bk] = buyData[bk];
        // }
         buyDataAll[bk] = buyData[bk];

    });

    // Removes Duplicate Mailing addresses filteredBuyData : buyData
    let filteredBuyData = _.differenceBy(buyData, dupArr, 'id');
    createJSONFile(filteredBuyData, 'total');

    let filteredBuyAllData = _.differenceBy(buyDataAll, dupArr, 'id');
    createCSVFile(filteredBuyAllData, 'total');
 
    // let filteredBuyDataFlood = _.differenceBy(buyDataFlood, dupArr, 'id');
    // createCSVFile(filteredBuyDataFlood , 'total-flood');


}

// Read and Write Files
let buyCSVData = fs.readFileSync('./csv/'+county+'/buy.csv', 'utf8');
buyCSVData = d3.csvParse(buyCSVData);

let soldCSVData = fs.readFileSync('./csv/'+county+'/sold.csv', 'utf8');
soldCSVData = d3.csvParse(soldCSVData);

// let offerCSVData = fs.readFileSync('./csv/'+county+'/offer.csv', 'utf8');
// offerCSVData = d3.csvParse(offerCSVData);

createJSONFile(formatBuyData(buyCSVData), 'buy');
createJSONFile(formatSoldData(soldCSVData), 'sold');
// createJSONFile(formatOfferData(offerCSVData), 'offer');


let buyJSONData = JSON.parse(fs.readFileSync('./src/assets/json/buy.json', 'utf8'));
let soldJSONData = JSON.parse(fs.readFileSync('./src/assets/json/sold.json', 'utf8'));
// let offerJSONData = JSON.parse(fs.readFileSync('./src/assets/json/offer.json', 'utf8'));


// mergeData(buyJSONData, soldJSONData, offerJSONData);
mergeData(buyJSONData, soldJSONData);