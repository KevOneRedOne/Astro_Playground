const fs = require("fs");
const axios = require("axios");

const JWT =
  "ae67b1a7e5b7dd0e6ecb3d2f590e9a51a41da2216c4b6034b6b891966095c893d68b9d47f4280b441c7e6e39f038ba2e56f6883bc37b53b8eeaaf6f65a911456e0684d89d1baf34da167b1faf632e83d7d1ac49a132e98d125e9a0bf864c69557b1e96b2dd58cb18aa23599fdcaa35940f99b23aea0d41fa6961d6a70ff5f36a";
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
