const fetch = require("node-fetch");
const countryPath = "./data/countries.txt";
const flagURL = "https://flagcdn.com/256x192/za.png";
const fs = require("fs");
const countryList = fs.readFileSync(countryPath).toString().split("\n");

module.exports.state = {
  coords: [],
  country: {
    name: "",
    code: "",
    flag: "",
    languages: "",
    currency: "",
  },
};

module.exports.getRandomCountry = function (code = true) {
  const countryData =
    countryList[Math.floor(Math.random() * countryList.length)];
  let [countryCode, name] = countryData.split("|");
  if (code) return countryCode;
  return removePrefix(fixName(name));
};

module.exports.loadCountryData = async function (countryCode) {
  try {
    const res = await fetch(
      `https://restcountries.eu/rest/v2/alpha/${countryCode}`
    );
    const data = await res.json();
    this.state.country.name = data.name;
    this.state.country.code = data.alpha2Code;
    this.state.country.language = data.languages[0].name;
    this.state.country.currency = data.currencies[0].symbol;
    this.state.country.flag = `http://www.geognos.com/api/en/countries/flag/${data.alpha2Code}.png`;
    return;
  } catch {
    console.error("An error occured fetching the data");
    return "Country not found";
  }
};

const fixName = function (name) {
  name = name.trim();
  if (name.includes(",")) {
    const [last, first] = name.split(",");
    name = [first, last].join(" ");
  }
  return name.trim();
};

const removePrefix = function (name) {
  if (!name.includes("(")) return name;
  return name.split("(")[0];
};
