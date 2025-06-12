const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// ------------------------
// Configuration à adapter
// ------------------------
const STRAPI_URL = "http://localhost:1337"; // ← Modifie si besoin
const STRAPI_TOKEN =
  "ac96435e143f1edde962ec8644ed6d4812a9606847e5d3c1529658d38ee3259dd11db2679cea498dbd2a24bb940726166dac3d21e3b7f638abb068cc06aa128147f704e143a054e9a8caf047a146dd3afee6d04c4c354e03579a27b5b6448c7181ee0c98e5ce9cb93b235e3551319c3ca175be64d663d851aa3a1e7ec57abdd8"; // ← À remplacer !
const PIXABAY_KEY = "28070895-d5d7490258931d5b68c81dede"; // ← À remplacer !
const TMP_IMG_DIR = path.join(__dirname, "tmpcarsimg");
fs.mkdirSync(TMP_IMG_DIR, { recursive: true });

async function getCars() {
  try {
    const res = await axios.get(
      `${STRAPI_URL}/api/cars?populate=*&pagination[1]=1000`,
      {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      }
    );
    return res.data.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des voitures:", error);
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
    console.log("Image uploadée sur Strapi :", res);
    // Strapi retourne un tableau d'objets média
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data[0]; // retourne l'objet média
    }
    return null;
  } catch (error) {
    // console.error("Erreur lors de l'upload de l'image sur Strapi :", error);
    if (error.response && error.response.data) {
      console.error(
        "Réponse Strapi :",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    return null;
  }
}

async function updateCarImage(documentId, mediaId) {
  try {
    console.log(`${STRAPI_URL}/api/cars/${documentId}`, mediaId);
    const res = await axios.put(
      `${STRAPI_URL}/api/cars/${documentId}?populate=*`,
      {
        data: { image: mediaId },
      },
      {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      }
    );
    console.log("@@@@Voiture mise à jour :", res.data);
    return res.data;
  } catch (error) {
    // console.error("Erreur lors de l'upload de l'image sur Strapi :", error);
    if (error.response && error.response.data) {
      console.error(
        "Réponse Strapi :",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    return null;
  }
}

(async () => {
  const cars = await getCars();
  for (const car of cars) {
    // Sauter si image déjà présente
    console.log("car", car);
    if (car?.image && car?.image.data && car?.image.data.length > 0) {
      console.log(`[${car.id}] ${car?.name} => déjà illustrée, skip`);
      break;
    }
    const carName = `${car?.brand?.name || ""} ${car?.name}`;
    console.log(`[${car.id}] Recherche image pour: "${carName}"`);
    const imageUrl = await getImageUrl(carName);
    if (!imageUrl) {
      console.warn(
        `[${car.id}] Pas d'image trouvée sur Pixabay pour "${carName}"`
      );
      break;
    }
    // Télécharger
    const imgPath = await downloadImage(imageUrl, carName);
    console.log(`[${car.id}] Image téléchargée : ${imgPath} (${imageUrl})`);
    if (!imgPath) {
      console.warn(`[${car.id}] Échec du téléchargement de l'image`);
      break;
    }
    // Log de la taille du fichier téléchargé
    try {
      const stats = fs.statSync(imgPath);
      console.log(
        `[${car.id}] Image téléchargée : ${imgPath} (${stats.size} octets)`
      );
    } catch (e) {
      console.log(`[${car.id}] Image téléchargée : ${imgPath}`);
    }
    // Uploader sur Strapi
    const uploaded = await uploadImageToStrapi(imgPath);
    if (!uploaded) {
      console.warn(`[${car.id}] Échec de l'upload de l'image`);
      break;
    }
    console.log(`[${car.id}] Image Strapi ID : ${uploaded.id}`);
    // Liaison à la voiture
    console.log(
      `[${car.id}] Mise à jour de la voiture avec l'image ${uploaded.id}`
    );
    const updated = await updateCarImage(car.documentId, uploaded.id);
    if (!updated) {
      console.warn(`[${car.id}] Échec de la mise à jour de la voiture`);
      break;
    }
    console.log(`[${car.id}] Voiture mise à jour avec l'image 🏁`);
    // Optionnel : supprimer localement
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
