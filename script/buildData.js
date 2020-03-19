const axios = require("axios")
const moment = require("moment")
const fs = require("fs")
const formatCountryString = require("./format-country-string").formatCountryString

const path = require('path')
const dataSavePath = `${path.resolve(__dirname, '..')}/data/data.json`
const recordStartDate = moment("2020-01-22")
const lastSyncDate = moment()

const recordIndex = ((date) => {
    return moment(date).diff(recordStartDate, "day")
})

function convertStringToNumber(stringValue) {
    let validatedNumber = parseInt(stringValue)
    validatedNumber = Number.isInteger(validatedNumber) ? validatedNumber : 0
    return validatedNumber
}

function pushToCountryDailyArray(countryDailyArray, countryObject) {
    const index = countryDailyArray.findIndex((e) => e.country === countryObject.country);
    if (index === -1) {
        countryDailyArray.push(countryObject);
    } else {
        countryDailyArray[index].confirmed += countryObject.confirmed;
        countryDailyArray[index].recovered += countryObject.recovered;
        countryDailyArray[index].deaths += countryObject.deaths;
    }
}

function loadDailyData(date) {
    return axios.get("https://covid19.mathdro.id/api/daily/" + date)
        .then((response) => {
            let dailyRecord = []
            let countConfirmed = 0
            let countRecovered = 0
            let countDeaths = 0
            let countryDailyArray = []
            response.data.forEach((countryData) => {
                countryData.confirmed = convertStringToNumber(countryData.confirmed)
                countryData.recovered = convertStringToNumber(countryData.recovered)
                countryData.deaths = convertStringToNumber(countryData.deaths)
                countConfirmed += countryData.confirmed
                countRecovered += countryData.recovered
                countDeaths += countryData.deaths
                pushToCountryDailyArray(countryDailyArray, { country: formatCountryString(countryData.countryRegion).name, countryCode: formatCountryString(countryData.countryRegion).iso1A2, confirmed: countryData.confirmed, recovered: countryData.recovered, deaths: countryData.deaths })
            })
            dailyRecord = { errorStatus: false, updatedDate: date, confirmed: countConfirmed, recovered: countRecovered, deaths: countDeaths, countries: countryDailyArray }
            return dailyRecord
        })
        .catch(error => {
            if (typeof (error.response) != "undefined") {
                console.log("Failed to fetch ", date, "Error code: ", error.response.status)
            }
            else console.log(error)
            return ({ updatedDate: date, confirmed: 0, recovered: 0, deaths: 0, countries: [], errorStatus: true })

        })
        .finally(console.log("finished fetch ", date))
}

const loadData = ((startDate, endDate) => {
    let loadDataArray = []
    for (let date = moment(startDate); moment(date).isSameOrBefore(endDate, "day"); date = moment(date).add(1, "d")) {
        loadDataArray.push(loadDailyData(date.format("YYYY-MM-DD")))
    }
    return loadDataArray
})

function updateByDate(existedData, startDate, endDate) {
    Promise.all(loadData(startDate, endDate))
        .then((records) => {
            if (typeof (existedData.dailyReports) != "undefined") {
                records.forEach((record) => {
                    existedData.dailyReports[recordIndex(record.updatedDate)] = record
                })
            }
            else existedData.dailyReports = records
            return existedData
        })
        .then((existedData) => {
            axios.get("https://covid19.mathdro.id/api/")
                .then(response => {
                    let confirmed = convertStringToNumber(response.data.confirmed.value)
                    let recovered = convertStringToNumber(response.data.recovered.value)
                    let deaths = convertStringToNumber(response.data.deaths.value)
                    return fs.writeFileSync(dataSavePath, JSON.stringify({ errorStatus: false, lastSync: lastSyncDate, lastUpdate: response.data.lastUpdate, confirmed: confirmed, recovered: recovered, deaths: deaths, dailyReports: existedData.dailyReports }))
                })
                .catch(error => {
                    //Sync last updated data if there is an error
                    let confirmed = convertStringToNumber(existedData.confirmed)
                    let recovered = convertStringToNumber(existedData.recovered)
                    let deaths = convertStringToNumber(existedData.deaths)
                    return fs.writeFileSync(dataSavePath, JSON.stringify({ errorStatus: true, lastSync: lastSyncDate, lastUpdate: (existedData.lastUpdate || lastSyncDate), confirmed: confirmed, recovered: recovered, deaths: deaths, dailyReports: existedData.dailyReports }))
                })
        })
        .catch(error => console.log(error))
}

var inputArguments = process.argv.slice(2);

if (typeof (inputArguments[0]) === "undefined") inputArguments[0] = "default"
console.log("Option:", inputArguments[0]);

switch (inputArguments[0].toLowerCase()) {
    case "build":
        {
            updateByDate([], recordStartDate, lastSyncDate)
        }
        break;
    case "update":
    default:
        fs.readFile(dataSavePath, (error, existedData) => {
            if (error) {
                updateByDate({ dailyReports: [] }, recordStartDate, lastSyncDate)
            }
            else {
                existedData = JSON.parse(existedData)
                let updateFlag = false
                if (existedData.errorStatus !== true) {
                    if (typeof (existedData.dailyReports) != "undefined") {
                        existedData.dailyReports.forEach((record) => {
                            if (typeof (record) != "undefined") {
                                if (record.errorStatus === true) {
                                    updateFlag = true
                                    updateByDate(existedData, record.updatedDate, record.updatedDate)
                                }
                            }
                        })
                        updateFlag || updateByDate(existedData, existedData.lastUpdate, lastSyncDate)
                        updateFlag = true
                    }
                }
                updateFlag || updateByDate({ dailyReports: [] }, recordStartDate, lastSyncDate)
            }
        })
}