const fetch = require('node-fetch');
const countryPath = './data/countries.txt';

const helpers = require('./helpers.js');
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

module.exports.getListOfRandomCountries = function (first = [], count = 1) {
  const cList = first.length ? [first] : [];
  for (i = 0; i < count; i++) {
    cList.push(this.getRandomCountry(false));
  }
  return helpers.shuffleArray(cList);
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

module.exports.reset = function () {
  this.state = {
    score: 0,
    round: 1,
    inProgress: true,
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
};

module.exports.getStreetViewImage = async function (key) {
  const maxTrys = 5;
  let i = 0;
  try {
    while (i < maxTrys) {
      i++;
      const coords = await getCoordsWithinCountry();
      const area = await getNearestArea(coords);
      console.log(area);
      const res =
        await fetch(`https://maps.googleapis.com/maps/api/streetview?size=1000x600&location=${coords[0]}, ${coords[1]}
      &fov=100&heading=70&pitch=0&radius=100&return_error_codes=true
      &key=${key}`);
      if (res.statusText === 'OK') return res.url;
      console.log(res.statusText);
    }
  } catch (err) {
    console.log(err);
  }
  return '❌ Error Occured';
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

const getCoordsWithinCountry = async function () {
  try {
    const res = await fetch(`https://api.3geonames.org/?randomland=yes&json=1`);
    const data = await res.json();
    console.log(data);
    return [data.major.inlatt, data.major.inlongt];
  } catch (err) {
    console.log(err);
  }
};

const getNearestArea = async function (coords) {
  const res = await fetch(
    `https://api.3geonames.org/${coords[0]},${coords[1]}.json`
  );
  const data = await res.json();
  const country = await getCountryByCode(data.nearest.state);
  return [country, data.nearest.city];
};

const getCountryByCode = async function (code) {
  const res = await fetch(`https://restcountries.eu/rest/v2/alpha/${code}`);
  const data = await res.json();
  return data.name;
};
