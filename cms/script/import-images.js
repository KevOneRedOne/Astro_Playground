const axios = require("axios");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");

// ------------------------
// Configuration à adapter
// ------------------------
const STRAPI_URL = "http://localhost:1337"; // ← Modifie si besoin
const STRAPI_TOKEN =
  "ae67b1a7e5b7dd0e6ecb3d2f590e9a51a41da2216c4b6034b6b891966095c893d68b9d47f4280b441c7e6e39f038ba2e56f6883bc37b53b8eeaaf6f65a911456e0684d89d1baf34da167b1faf632e83d7d1ac49a132e98d125e9a0bf864c69557b1e96b2dd58cb18aa23599fdcaa35940f99b23aea0d41fa6961d6a70ff5f36a"; // ← À remplacer !
const PIXABAY_KEY = "28070895-d5d7490258931d5b68c81dede"; // ← À remplacer !
const TMP_IMG_DIR = path.join(__dirname, "tmpcarsimg");
fs.mkdirSync(TMP_IMG_DIR, { recursive: true });

async function getCars() {
  try {
    const res = await axios.get(`${STRAPI_URL}/api/cars?populate=*`, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
    });
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
    form.append(
      "files",
      fs.createReadStream("./script/tmpcarsimg/test_test.jpg")
    );
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

async function updateCarImage(carId, mediaId) {
  try {
    const res = await axios.put(
      `${STRAPI_URL}/api/cars/${carId}`,
      {
        data: { image: [mediaId] },
      },
      {
        headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      }
    );
    return res.data;
  } catch (error) {
    console.error(
      `Erreur lors de la mise à jour de l'image pour la voiture ${carId} :`,
      error
    );
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
    const updated = await updateCarImage(car.id, uploaded.id);
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
