const fs = require("fs");
const dotenv = require("dotenv");
const axios = require("axios");
const path = require("path");

// Charger les variables d'environnement depuis le fichier .env dans le répertoire racine
const envPath = path.resolve(__dirname, '../.env');
console.log(`Chargement du fichier .env depuis: ${envPath}`);

// Vérifier si le fichier .env existe
if (!fs.existsSync(envPath)) {
  console.error(`ERREUR: Le fichier .env n'existe pas à l'emplacement: ${envPath}`);
  process.exit(1);
}

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Erreur lors du chargement du fichier .env:", result.error);
  process.exit(1);
}

console.log("Variables d'environnement chargées. Contenu de process.env.STRAPI_JWT:", process.env.STRAPI_JWT ? "Token présent" : "Token manquant");

const API_BRAND = "http://localhost:1337/api/brands";
const API_CAR = "http://localhost:1337/api/cars";

// Tenter de récupérer le JWT directement depuis le contenu du fichier
let JWT = process.env.STRAPI_JWT;
if (!JWT) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const jwtMatch = envContent.match(/STRAPI_JWT=([^\r\n]+)/);
    if (jwtMatch && jwtMatch[1]) {
      JWT = jwtMatch[1].trim();
      console.log("JWT récupéré directement depuis le fichier .env");
    } else {
      // OPTION TEMPORAIRE: Décommentez la ligne suivante et ajoutez votre token directement
      // JWT = "votre_token_strapi_ici";
      // console.log("JWT défini directement dans le script");
    }
  } catch (error) {
    console.error("Impossible de lire le fichier .env pour récupérer le JWT:", error);
  }
}

// Vérifier si le JWT est disponible
if (!JWT) {
  console.error("ERREUR: La variable d'environnement STRAPI_JWT n'est pas définie!");
  console.error("Assurez-vous que votre fichier .env contient STRAPI_JWT=votre_token");
  process.exit(1);
}

// Charge tous les brands avec des chemins absolus
const brands = JSON.parse(fs.readFileSync(path.resolve(__dirname, "brands.json"), "utf-8"));
const cars = JSON.parse(fs.readFileSync(path.resolve(__dirname, "cars.json"), "utf-8"));

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
