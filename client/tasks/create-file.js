const d3 = require('d3')
const fs = require('fs')
const _ = require('lodash')
const path = require('path')
const { Parser } = require('json2csv')

 
 console.log('sync-1');


//  const done = true;
//  const isItDoneYet = new Promise((resolve, reject) => {
//   if (done) {
//     const workDone = 'Here is the thing I built'

//     // resolve(workDone);
//     return new Promise(() => { 
//         setTimeout(() => {
//         return workDone;
//         },2000);
//         });
//   } else {
//     const why = 'Still working on something else'
//     throw 'ERROR: No bueno';
//     reject(why)
//   }
//   // resolve();
// });
// isItDoneYet.then((a) => {console.log(a); console.log(isItDoneYet);});
  console.log('sync-2');
  // console.log(isItDoneYet);
async function getUserData(userId){

    let user = getUser(userId);
    let profile = getProfile('ueuue');
    let me = addMe('pepep');
    return await Promise.all([user,profile,me]);

}
 function getUser(userId){
      return new Promise((res,rej) => {
          setTimeout(()=> {
              res({name: 'hooper', age: 33});
          },2000);
      });
  }

  const getProfile = (person) => {
      return new Promise((res,rej) => {
          setTimeout(() => {
              res({sex: 'male'});
          }, 2000);
      });
  }

  function addMe(blah){
      return new Promise((res,rej) => {
             setTimeout(()=> {
                 res({quote: 'I love this shit'});
             }, 2000);
      });
  }

  // getUser(100).then(getProfile).then(console.log).then(addMe).then(console.log).catch(err => console.log(err));
    console.log('sync-3');

    getUserData(100).then(console.log).catch(console.log);




