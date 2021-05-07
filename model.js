const fetch = require('node-fetch');
const countryPath = './data/countries.txt';
const flagURL = 'https://flagcdn.com/256x192/za.png';

const { countryCodeEmoji } = require('country-code-emoji');
const fs = require('fs');
const countryList = fs.readFileSync(countryPath).toString().split('\n');

module.exports.state = {
  score: 0,
  inProgress: false,
  coords: [],
  country: {
    name: '',
    code: '',
    flag: '',
    languages: '',
    currency: '',
    region: '',
  },
  record: [],
};

module.exports.getRandomCountry = function (code = true) {
  const countryData =
    countryList[Math.floor(Math.random() * countryList.length)];
  let [countryCode, name] = countryData.split('|');
  if (code) return countryCode;
  return removePrefix(fixName(name));
};

module.exports.loadCountryData = async function (countryCode, tryAgain = true) {
  if (!tryAgain) throw new Error();
  try {
    const res = await fetch(
      `https://restcountries.eu/rest/v2/alpha/${countryCode}`
    );

    if (!res) return;

    const data = await res.json();
    this.state.country.name = data.name;
    this.state.country.code = data.alpha2Code;
    this.state.country.language = data.languages[0].name;
    this.state.country.currency = data.currencies[0].name;
    this.state.country.region = data.subregion;
    this.state.country.flag = `http://www.geognos.com/api/en/countries/flag/${data.alpha2Code}.png`;
    return;
  } catch {
    console.error(
      `An error occured fetching the data for the country code ${countryCode}`
    );
    this.loadCountryData(countryCode, false);
    return 'Country not found';
  }
};

module.exports.addToRecord = function (country, result) {
  this.state.record.push({
    countryName: country.name,
    emoji: countryCodeEmoji(country.code),
    correct: result,
  });
};

const fixName = function (name) {
  name = name.trim();
  if (name.includes(',')) {
    const [last, first] = name.split(',');
    name = [first, last].join(' ');
  }
  return name.trim();
};

const removePrefix = function (name) {
  if (!name.includes('(')) return name;
  return name.split('(')[0];
};
