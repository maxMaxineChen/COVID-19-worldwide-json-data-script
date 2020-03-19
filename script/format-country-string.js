const countriesData = require('./country.json')

RegExp.escape = (s) => {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function formatCountryString(countryString) {
    let formatCountry = { "iso1A2": countryString, "name": countryString }
    countriesData.some((countryCode) => {
        let re = new RegExp("\\b" + RegExp.escape(countryString), "i")
        if (countryCode.name.search(re) !== -1) {
            formatCountry = countryCode
            return true
        }

        if (typeof (countryCode.alternativeName) !== "undefined") {
            if (Object.values(countryCode.alternativeName).toString().search(re) !== -1) {
                formatCountry = countryCode
                return true
            }
        }
    })
    return formatCountry
}

exports.formatCountryString = formatCountryString