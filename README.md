# COVID-19-worldwide-json-data-script
A script to access Coronavirus COVID-19 worldwide data in JSON format

This script stores data in JSON format from the John Hopkins University CSSE via [mathdroid API](https://github.com/mathdroid/covid-19-api). 

Builed data available at [https://github.com/maxMaxineChen/COVID-19-worldwide-json-data-script/blob/master/data/data.json](https://github.com/maxMaxineChen/COVID-19-worldwide-json-data-script/blob/master/data/data.json)

It will get updated every 8 hours by github actions.

## Data Format
 
The JSON contains global "confirmed", "recovered" and "deaths" cases summary updated by "lastUpdate" at the beginning. 

Following "dailyReports" is an array which contains global daily summary and details of every involved country ordered by date since 2020-01-22.

By using data, you can validate "errorStatus !== true" at first to get meaningful data.

```json
{
    "errorStatus": false,
    "lastSync": "2020-03-19T05:22:08.741Z",
    "lastUpdate": "2020-03-19T04:53:02.000Z", 
    "confirmed": 218814,
    "recovered": 84113,
    "deaths": 8810,
    "dailyReports": [
        {
            "errorStatus": false,
            "updatedDate": "2020-01-22",
            "confirmed": 555,
            "recovered": 28,
            "deaths": 17,
            "countries": [
                {
                    "country": "China",
                    "countryCode": "CN",
                    "confirmed": 547,
                    "recovered": 28,
                    "deaths": 17
                },
                ...
            ],
        },
        {
            "errorStatus": false,
            "updatedDate": "2020-01-23",
            "confirmed": 653,
            "recovered": 30,
            "deaths": 18,
            "countries": [
                {
                    "country": "China",
                    "countryCode": "CN",
                    "confirmed": 639,
                    "recovered": 30,
                    "deaths": 18
                },
                ...
            ],
        },
        ...
    ]
}
```

_Note: The "dailyReports" array is ordered by date since 2020-01-22. It means you can get spcific date by index.
For example, if you want to log a daily report by 2020-03-14:_
```js
//This example uses "moment" library to calculate the index
const moment = require("moment")
const recordIndex = ((date) => {
    return moment(date).diff("2020-01-22", "day")
})

fetch("https://github.com/maxMaxineChen/COVID-19-worldwide-json-data-script/blob/master/data/data.json")
  .then((response) => response.json())
  .then((data) => {
      if(data.dailyReports[recordIndex("2020-03-14")].errorStatus === false)
        console.log(`2020-03-14 daily reports: ${data.dailyReports[recordIndex("2020-03-14")]}`)
  })

```

## Script Usage

1.  **Clone.**

    ```shell
    git clone https://github.com/maxMaxineChen/COVID-19-worldwide-json-data-script.git
    ```

2.  **Install deps.**

    ```shell
    cd COVID-19-worldwide-json-data-script/
    npm install
    ```

3.  **Running the script**
    ```shell
    # Option 1. Gets the latest data to store at /data/data.json and saves log at updated.log (recommended!)
    npm start 
    #Option 2. Updates data based on the exisited /data/data.json to the latest date
    npm update 
    #Option 3. Builds the latest data to override the existed /data/data.json
    npm build 
    ```

    _Note:_ 

    If you see "Failed to fetch  2020-XX-XX Error code:  404" in log, it means the data hasn't updated from API server (Since the data updating always has gap, you may see the error often for the latest one or two days data fetching. Don't worry and keep using the existing data ^-^ ).

    If you see that the error code is 443, it means the API server failed to server some commands shortly.

    Running "npm start" OR "npm update" later if you like to fix some error data or get updated to the latest date.


## Projects using this dataset

- [A Coronavirus COVID-19 global data statistics website](https://github.com/maxMaxineChen/COVID19-Worldwide-Stats), (React + Gatsby + Material UI + Recharts) by [Maxine Chen](https://github.com/maxMaxineChen)

[+ Add yours](https://github.com/maxMaxineChen/COVID-19-worldwide-json-data-script/edit/master/README.md)


## License


MIT License 2020, Maxine Chen.
The data access from the John Hopkins University CSSE via [mathdroid API](https://github.com/mathdroid/covid-19-api). It may not be used for commercial purposes.
