const axios = require("axios");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

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

console.log("Variables d'environnement chargées. Contenu de process.env.STRAPI_JWT:", 
  process.env.STRAPI_JWT ? "Token présent" : "Token manquant");

// ------------------------
// Configuration à adapter
// ------------------------
const STRAPI_URL = "http://localhost:1337"; // ← Modifie si besoin
let STRAPI_TOKEN = process.env.STRAPI_JWT;

// Si le token n'est pas chargé depuis process.env, essayer de le récupérer directement depuis le fichier
if (!STRAPI_TOKEN) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const jwtMatch = envContent.match(/STRAPI_JWT=([^\r\n]+)/);
    if (jwtMatch && jwtMatch[1]) {
      STRAPI_TOKEN = jwtMatch[1].trim();
      console.log("JWT récupéré directement depuis le fichier .env");
    } else {
      // OPTION TEMPORAIRE: Décommentez la ligne suivante et ajoutez votre token directement
      // STRAPI_TOKEN = "votre_token_strapi_ici";
      // console.log("JWT défini directement dans le script");
    }
  } catch (error) {
    console.error("Impossible de lire le fichier .env pour récupérer le JWT:", error);
  }
}

// Vérifier si le token est présent
if (!STRAPI_TOKEN) {
  console.error("ERREUR: La variable d'environnement STRAPI_JWT n'est pas définie!");
  console.error("Assurez-vous que votre fichier .env contient STRAPI_JWT=votre_token");
  process.exit(1);
}

const PIXABAY_KEY = "28070895-d5d7490258931d5b68c81dede"; // ← À remplacer si nécessaire
const TMP_IMG_DIR = path.join(__dirname, "tmpcarsimg");
fs.mkdirSync(TMP_IMG_DIR, { recursive: true });

async function getCars() {
  try {
    console.log("Récupération des voitures depuis Strapi...");
    console.log("Token utilisé:", STRAPI_TOKEN ? "Token présent" : "Token manquant");
    const res = await axios.get(
      `${STRAPI_URL}/api/cars?populate=*&pagination[1]=1000`,
      {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      }
    );
    return res.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures:", error);
    if (error.response) {
      console.error("Statut:", error.response.status);
      console.error("Données:", error.response.data);
    }
    return [];
  }
}

async function getImageUrl(query) {
  try {
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3`;
    const res = await axios.get(url);
    if (res.data.hits && res.data.hits.length > 0)
      return res.data.hits[0].largeImageURL;
    return null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'image :", error);
    return null;
  }
}

async function downloadImage(imageUrl, carName) {
  try {
    const filename = path.resolve(
      TMP_IMG_DIR,
      `${carName.replace(/\W+/g, "_")}.jpg`
    );
    const res = await axios.get(imageUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(filename);
    res.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filename));
      writer.on("error", reject);
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement de l'image :", error);
    return null;
  }
}

async function uploadImageToStrapi(filePath) {
  try {
    // Vérification de la taille du fichier (Strapi limite à 2Mo par défaut)
    console.log("uploadImageToStrapi", filePath);
    const stats = fs.statSync(filePath);
    console.log(`Taille du fichier à uploader : ${stats.size} octets`);
    if (stats.size > 2 * 1024 * 1024) {
      console.error("Fichier trop volumineux pour Strapi (>2Mo).");
      return null;
    }
    const form = new FormData();
    form.append("files", fs.createReadStream(filePath));

    const res = await axios.post(`${STRAPI_URL}/api/upload`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      },
    });
    console.log("Image uploadée sur Strapi :", res.data);
    // Strapi retourne un tableau d'objets média
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0]; // retourne l'objet média
    }
    return null;
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(
        "Réponse Strapi :",
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("Erreur lors de l'upload de l'image sur Strapi:", error.message);
    }
    return null;
  }
}

async function updateCarImage(carId, mediaId) {
  try {
    console.log(`Mise à jour de la voiture ${carId} avec l'image ${mediaId}`);
    const res = await axios.put(
      `${STRAPI_URL}/api/cars/${carId}?populate=*`,
      {
        data: { image: mediaId },
      },
      {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      }
    );
    console.log("Voiture mise à jour :", res.data);
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) {
      console.error(
        "Réponse Strapi :",
        JSON.stringify(error.response.data, null, 2)
      );
    } else {
      console.error("Erreur lors de la mise à jour de la voiture:", error.message);
    }
    return null;
  }
}

(async () => {
  const cars = await getCars();
  for (const car of cars) {
    // Sauter si image déjà présente
    console.log("car", car);
    if (car?.attributes?.image?.data && car?.attributes?.image?.data.length > 0) {
      console.log(`[${car.id}] ${car?.attributes?.name} => déjà illustrée, skip`);
      continue;
    }
    
    const brandName = car?.attributes?.brand?.data?.attributes?.name || "";
    const carName = `${brandName} ${car?.attributes?.name}`;
    console.log(`[${car.id}] Recherche image pour: "${carName}"`);
    
    const imageUrl = await getImageUrl(carName);
    if (!imageUrl) {
      console.warn(
        `[${car.id}] Pas d'image trouvée sur Pixabay pour "${carName}"`
      );
      continue;
    }
    
    // Télécharger
    const imgPath = await downloadImage(imageUrl, carName);
    console.log(`[${car.id}] Image téléchargée : ${imgPath} (${imageUrl})`);
    if (!imgPath) {
      console.warn(`[${car.id}] Échec du téléchargement de l'image`);
      continue;
    }
    
    // Uploader sur Strapi
    const uploaded = await uploadImageToStrapi(imgPath);
    if (!uploaded) {
      console.warn(`[${car.id}] Échec de l'upload de l'image`);
      continue;
    }
    console.log(`[${car.id}] Image Strapi ID : ${uploaded.id}`);
    
    // Liaison à la voiture
    const updated = await updateCarImage(car.id, uploaded.id);
    if (!updated) {
      console.warn(`[${car.id}] Échec de la mise à jour de la voiture`);
      continue;
    }
    console.log(`[${car.id}] Voiture mise à jour avec l'image 🏁`);
    
    // Optionnel : supprimer localement
    try {
      fs.unlinkSync(imgPath);
    } catch (e) {
      console.warn(
        `[${car.id}] Impossible de supprimer le fichier local : ${imgPath} (${e.message})`
      );
    }
  }
  console.log("--- Fini !");
})();
