const fs = require("fs");
const axios = require("axios");

const JWT =
  "ac96435e143f1edde962ec8644ed6d4812a9606847e5d3c1529658d38ee3259dd11db2679cea498dbd2a24bb940726166dac3d21e3b7f638abb068cc06aa128147f704e143a054e9a8caf047a146dd3afee6d04c4c354e03579a27b5b6448c7181ee0c98e5ce9cb93b235e3551319c3ca175be64d663d851aa3a1e7ec57abdd8";
const API_BRAND = "http://localhost:1337/api/brands";
const API_CAR = "http://localhost:1337/api/cars";

// Charge tous les brands
const brands = JSON.parse(fs.readFileSync("./script/brands.json", "utf-8"));
const cars = JSON.parse(fs.readFileSync("./script/cars.json", "utf-8"));

// Insère chaque brand et conserve le mapping "nom de marque" <=> "id reçu"
async function importBrands() {
  const brandMap = {};
  for (const brand of brands) {
    const res = await axios.post(
      API_BRAND,
      { data: brand },
      { headers: { Authorization: `Bearer ${JWT}` } }
    );
    brandMap[brand.name] = res.data.data.id;
    console.log(`Brand importée: ${brand.name} => id ${res.data.data.id}`);
  }
  return brandMap;
}

// Puis charge cars et les relie
async function importCars(brandMap) {
  for (const car of cars) {
    if (!brandMap[car.brand]) {
      console.error("No brand found for car:", car.name, "brand:", car.brand);
      continue;
    }
    // Adaptation : car.brand = id Strapi
    const toSend = { ...car, brand: brandMap[car.brand] };
    const res = await axios.post(
      API_CAR,
      { data: toSend },
      { headers: { Authorization: `Bearer ${JWT}` } }
    );
    console.log(`Car importée: ${car.name}`, res.data.data.id);
  }
}

(async () => {
  const brandMap = await importBrands();
  await importCars(brandMap);
})();
