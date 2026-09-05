import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// CORS middleware: allow access from any origin (e.g. Vercel deployments, cross-domain preview)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-file-name, Range, Authorization, Accept");
  res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Body parsers: allow binary video uploads up to 100MB (comfortably exceeding the 50MB minimum)
app.use(
  express.raw({
    type: ["video/*", "application/octet-stream"],
    limit: "100mb",
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const VIDEOS_DIR = path.join(process.cwd(), "public", "videos");
const IMAGES_DIR = path.join(process.cwd(), "public", "images");
const DATA_DIR = path.join(process.cwd(), "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEOS_DIR)) {
  fs.mkdirSync(VIDEOS_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Helper to determine the canonical public base URL for assets
function getCanonicalBaseUrl(req: express.Request): string {
  if (process.env.APP_URL && process.env.APP_URL.trim() !== "") {
    return process.env.APP_URL.replace(/\/+$/, "");
  }
  const host = req.get("x-forwarded-host") || req.get("host") || "localhost:3000";
  const proto = req.get("x-forwarded-proto") || req.protocol || "https";
  return `${proto}://${host}`;
}

// Serve videos folder with full range support and CORS (crucial for iOS Safari & Android mobile streaming)
app.use("/videos", express.static(VIDEOS_DIR, {
  acceptRanges: true,
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Range, Accept");
    res.setHeader("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
    res.setHeader("Cache-Control", "public, max-age=3600");
  }
}));

// Serve images folder with static caching and CORS
app.use("/images", express.static(IMAGES_DIR, {
  setHeaders: (res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "public, max-age=3600");
  }
}));

const HERO_CONFIG_PATH = path.join(DATA_DIR, "hero_video_config.json");
const MENU_IMAGES_CONFIG_PATH = path.join(DATA_DIR, "menu_images.json");

const DEFAULT_HERO_CONFIG = {
  src: "/videos/sabor_da_roca_hero.mp4",
  type: "default",
  label: "Vídeo da Hero",
  updatedAt: new Date().toISOString(),
};

function getHeroConfig() {
  try {
    if (fs.existsSync(HERO_CONFIG_PATH)) {
      const data = fs.readFileSync(HERO_CONFIG_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading hero video config:", err);
  }
  return DEFAULT_HERO_CONFIG;
}

function saveHeroConfig(config: any) {
  try {
    fs.writeFileSync(HERO_CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving hero video config:", err);
  }
}

// ==========================================
// API ROUTES FOR HERO VIDEO & CROSS-DEVICE SYNC
// ==========================================

app.get("/api/hero-video", (req, res) => {
  const config = getHeroConfig();
  const baseUrl = getCanonicalBaseUrl(req);
  
  // Ensure publicUrl is always populated
  const publicUrl = config.src && config.src.startsWith("http")
    ? config.src
    : `${baseUrl}${config.src || "/videos/sabor_da_roca_hero.mp4"}`;

  res.json({
    ...config,
    publicUrl,
  });
});

// Binary file upload handler: saves video directly to public/videos
app.post("/api/hero-video/upload", (req, res) => {
  try {
    const rawData = req.body;
    if (!rawData || !Buffer.isBuffer(rawData) || rawData.length === 0) {
      return res.status(400).json({ error: "Nenhum dado de vídeo recebido no servidor." });
    }

    const fileNameHeader = req.headers["x-file-name"] as string;
    const originalName = fileNameHeader
      ? decodeURIComponent(fileNameHeader)
      : "video_hero.mp4";

    const ext = path.extname(originalName) || ".mp4";
    const targetFileName = `hero_active${ext}`;
    const targetPath = path.join(VIDEOS_DIR, targetFileName);

    fs.writeFileSync(targetPath, rawData);

    const timestamp = Date.now();
    const baseUrl = getCanonicalBaseUrl(req);
    const relativeSrc = `/videos/${targetFileName}?v=${timestamp}`;
    const publicUrl = `${baseUrl}${relativeSrc}`;

    const newConfig = {
      src: publicUrl,
      relativeSrc,
      publicUrl,
      type: "file",
      label: originalName,
      size: rawData.length,
      updatedAt: new Date().toISOString(),
    };

    saveHeroConfig(newConfig);
    console.log(`[Hero Video] Novo vídeo salvo no servidor: ${originalName} (${(rawData.length / (1024 * 1024)).toFixed(2)} MB) -> URL: ${publicUrl}`);
    return res.json({ success: true, config: newConfig });
  } catch (err: any) {
    console.error("Erro ao salvar arquivo de vídeo no servidor:", err);
    return res.status(500).json({ error: "Falha ao salvar vídeo no servidor: " + (err.message || String(err)) });
  }
});

app.post("/api/hero-video/url", (req, res) => {
  try {
    const { url, label } = req.body;
    if (!url || typeof url !== "string") {
      return res.status(400).json({ error: "URL inválida." });
    }

    const cleanUrl = url.trim();
    const baseUrl = getCanonicalBaseUrl(req);
    const publicUrl = cleanUrl.startsWith("http") ? cleanUrl : `${baseUrl}${cleanUrl}`;

    const newConfig = {
      src: cleanUrl,
      publicUrl,
      type: "url",
      label: label || "Link de Vídeo Externo",
      updatedAt: new Date().toISOString(),
    };

    saveHeroConfig(newConfig);
    console.log(`[Hero Video] Nova URL salva no servidor: ${cleanUrl}`);
    return res.json({ success: true, config: newConfig });
  } catch (err: any) {
    console.error("Erro ao salvar URL do vídeo no servidor:", err);
    return res.status(500).json({ error: "Falha ao salvar URL." });
  }
});

app.post(["/api/hero-video/reset", "/api/hero-video/remove"], (req, res) => {
  try {
    // Delete any custom hero_active files if present
    if (fs.existsSync(VIDEOS_DIR)) {
      const files = fs.readdirSync(VIDEOS_DIR);
      for (const file of files) {
        if (file.startsWith("hero_active")) {
          try {
            fs.unlinkSync(path.join(VIDEOS_DIR, file));
          } catch {}
        }
      }
    }

    const baseUrl = getCanonicalBaseUrl(req);
    const defaultSrc = "/videos/sabor_da_roca_hero.mp4";
    const newConfig = {
      src: defaultSrc,
      publicUrl: `${baseUrl}${defaultSrc}`,
      type: "default",
      label: "Vídeo Padrão Oficial (Sabor da Roça)",
      updatedAt: new Date().toISOString(),
    };

    saveHeroConfig(newConfig);
    console.log("[Hero Video] Vídeo restaurado no servidor.");
    return res.json({ success: true, config: newConfig });
  } catch (err: any) {
    console.error("Erro ao resetar vídeo:", err);
    return res.status(500).json({ error: "Falha ao resetar vídeo." });
  }
});

// ==========================================
// MENU CUSTOMIZATIONS API (PHOTO & NAME SYNC)
// ==========================================

const MENU_CUSTOMIZATIONS_PATH = path.join(DATA_DIR, "menu_customizations.json");

interface ProductCustomization {
  name?: string;
  image?: string;
  imageUrl?: string;
  updatedAt?: string;
}

function getMenuCustomizations(): Record<string, ProductCustomization> {
  try {
    if (fs.existsSync(MENU_CUSTOMIZATIONS_PATH)) {
      const data = fs.readFileSync(MENU_CUSTOMIZATIONS_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading menu customizations:", err);
  }

  // Automatic migration if legacy menu_images.json exists
  try {
    if (fs.existsSync(MENU_IMAGES_CONFIG_PATH)) {
      const legacyImages = JSON.parse(fs.readFileSync(MENU_IMAGES_CONFIG_PATH, "utf-8"));
      const migrated: Record<string, ProductCustomization> = {};
      for (const [id, img] of Object.entries(legacyImages)) {
        if (typeof img === "string" && img.trim()) {
          migrated[id] = { image: img, updatedAt: new Date().toISOString() };
        }
      }
      return migrated;
    }
  } catch {}

  return {};
}

function saveMenuCustomizations(customs: Record<string, ProductCustomization>) {
  try {
    fs.writeFileSync(MENU_CUSTOMIZATIONS_PATH, JSON.stringify(customs, null, 2), "utf-8");
    // Also keep legacy menu_images.json updated
    const legacyImages: Record<string, string> = {};
    for (const [id, item] of Object.entries(customs)) {
      if (item.image) {
        legacyImages[id] = item.image;
      }
    }
    fs.writeFileSync(MENU_IMAGES_CONFIG_PATH, JSON.stringify(legacyImages, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving menu customizations:", err);
  }
}

function saveCustomImageFile(itemId: string, dataUrlOrUrl: string): string {
  if (!dataUrlOrUrl || !dataUrlOrUrl.startsWith("data:image/")) {
    return dataUrlOrUrl;
  }
  try {
    const matches = dataUrlOrUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return dataUrlOrUrl;
    }
    let ext = matches[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "svg+xml") ext = "svg";
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const safeId = itemId.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `custom_dish_${safeId}.${ext}`;
    const filePath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/images/${filename}?v=${Date.now()}`;
  } catch (e) {
    console.error("Error writing custom dish image file:", e);
    return dataUrlOrUrl;
  }
}

// Full customizations (name + image)
app.get("/api/menu-customizations", (req, res) => {
  res.json(getMenuCustomizations());
});

app.post("/api/menu-customizations", (req, res) => {
  try {
    const { itemId, name, image, imageUrl } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: "itemId é obrigatório." });
    }

    const customs = getMenuCustomizations();
    const current = customs[itemId] || {};

    const incomingImage = imageUrl !== undefined ? imageUrl : image;
    let processedImage = current.imageUrl || current.image;
    if (incomingImage !== undefined) {
      if (incomingImage === "" || incomingImage === null) {
        processedImage = "";
      } else {
        processedImage = saveCustomImageFile(itemId, incomingImage);
      }
    }

    let processedName = current.name;
    if (name !== undefined) {
      processedName = typeof name === "string" ? name.trim() : current.name;
    }

    const updatedItem: ProductCustomization = {
      ...current,
      ...(processedName !== undefined ? { name: processedName } : {}),
      ...(processedImage !== undefined
        ? { image: processedImage, imageUrl: processedImage }
        : {}),
      updatedAt: new Date().toISOString(),
    };

    customs[itemId] = updatedItem;
    saveMenuCustomizations(customs);
    console.log(`[Menu Customization] Prato ${itemId} atualizado: nome="${updatedItem.name || ''}" foto="${updatedItem.image || ''}"`);
    return res.json({ success: true, customizations: customs, item: updatedItem });
  } catch (err: any) {
    console.error("Erro ao salvar produto:", err);
    return res.status(500).json({ error: "Erro ao salvar personalização do produto." });
  }
});

app.delete("/api/menu-customizations/:itemId", (req, res) => {
  try {
    const itemId = req.params.itemId;
    const customs = getMenuCustomizations();
    delete customs[itemId];
    saveMenuCustomizations(customs);
    return res.json({ success: true, customizations: customs });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao redefinir produto." });
  }
});

app.post("/api/menu-customizations/reset-all", (req, res) => {
  try {
    saveMenuCustomizations({});
    return res.json({ success: true, customizations: {} });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao redefinir produtos." });
  }
});

// Legacy Menu Images API (backward-compatibility)
app.get("/api/menu-images", (req, res) => {
  const customs = getMenuCustomizations();
  const images: Record<string, string> = {};
  for (const [id, item] of Object.entries(customs)) {
    if (item.image) {
      images[id] = item.image;
    }
  }
  res.json(images);
});

app.post("/api/menu-images", (req, res) => {
  try {
    const { itemId, imageUrl } = req.body;
    if (!itemId) {
      return res.status(400).json({ error: "itemId é obrigatório." });
    }
    const customs = getMenuCustomizations();
    const current = customs[itemId] || {};
    const processedImage = imageUrl ? saveCustomImageFile(itemId, imageUrl) : "";
    customs[itemId] = {
      ...current,
      image: processedImage,
      updatedAt: new Date().toISOString(),
    };
    saveMenuCustomizations(customs);
    res.json({ success: true, images: { [itemId]: processedImage } });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar imagem." });
  }
});

app.delete("/api/menu-images/:itemId", (req, res) => {
  try {
    const itemId = req.params.itemId;
    const customs = getMenuCustomizations();
    if (customs[itemId]) {
      customs[itemId].image = "";
      customs[itemId].updatedAt = new Date().toISOString();
      saveMenuCustomizations(customs);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao remover imagem." });
  }
});

// ==========================================
// SITE INSTITUTIONAL PHOTOS API (CROSS-DEVICE SYNC)
// ==========================================

const SITE_PHOTOS_CONFIG_PATH = path.join(DATA_DIR, "site_photos.json");

function getSitePhotos(): Record<string, string> {
  try {
    if (fs.existsSync(SITE_PHOTOS_CONFIG_PATH)) {
      const data = fs.readFileSync(SITE_PHOTOS_CONFIG_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading site photos config:", err);
  }
  return {};
}

function saveSitePhotos(photos: Record<string, string>) {
  try {
    fs.writeFileSync(SITE_PHOTOS_CONFIG_PATH, JSON.stringify(photos, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving site photos config:", err);
  }
}

function saveCustomSiteImageFile(photoKey: string, dataUrlOrUrl: string): string {
  if (!dataUrlOrUrl || !dataUrlOrUrl.startsWith("data:image/")) {
    return dataUrlOrUrl;
  }
  try {
    const matches = dataUrlOrUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches || matches.length < 3) {
      return dataUrlOrUrl;
    }
    let ext = matches[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "svg+xml") ext = "svg";
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");
    const safeKey = photoKey.replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `site_${safeKey}.${ext}`;
    const filePath = path.join(IMAGES_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return `/images/${filename}?v=${Date.now()}`;
  } catch (e) {
    console.error("Error writing site image file:", e);
    return dataUrlOrUrl;
  }
}

app.get("/api/site-photos", (req, res) => {
  res.json(getSitePhotos());
});

app.post("/api/site-photos", (req, res) => {
  try {
    const { photoKey, imageUrl } = req.body;
    if (!photoKey) {
      return res.status(400).json({ error: "photoKey é obrigatório." });
    }

    const photos = getSitePhotos();
    const processedUrl = imageUrl ? saveCustomSiteImageFile(photoKey, imageUrl) : "";
    photos[photoKey] = processedUrl;
    saveSitePhotos(photos);

    console.log(`[Site Photos] Foto "${photoKey}" atualizada no servidor.`);
    return res.json({ success: true, photos, savedUrl: processedUrl });
  } catch (err: any) {
    console.error("Erro ao salvar foto do site:", err);
    return res.status(500).json({ error: "Falha ao salvar foto do site." });
  }
});

app.delete("/api/site-photos/:photoKey", (req, res) => {
  try {
    const photoKey = req.params.photoKey;
    const photos = getSitePhotos();
    delete photos[photoKey];
    saveSitePhotos(photos);

    // Also attempt cleanup of any custom image file
    try {
      const safeKey = photoKey.replace(/[^a-zA-Z0-9_-]/g, "_");
      const files = fs.readdirSync(IMAGES_DIR);
      for (const file of files) {
        if (file.startsWith(`site_${safeKey}.`)) {
          try {
            fs.unlinkSync(path.join(IMAGES_DIR, file));
          } catch {}
        }
      }
    } catch {}

    console.log(`[Site Photos] Foto "${photoKey}" restaurada para o padrão.`);
    return res.json({ success: true, photos });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao restaurar foto do site." });
  }
});

app.post("/api/site-photos/reset-all", (req, res) => {
  try {
    saveSitePhotos({});
    try {
      const files = fs.readdirSync(IMAGES_DIR);
      for (const file of files) {
        if (file.startsWith("site_")) {
          try {
            fs.unlinkSync(path.join(IMAGES_DIR, file));
          } catch {}
        }
      }
    } catch {}

    console.log("[Site Photos] Todas as fotos do site foram restauradas.");
    return res.json({ success: true, photos: {} });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao restaurar todas as fotos do site." });
  }
});

// ==========================================
// MOST ORDERED (MAIS PEDIDOS) API
// ==========================================

const MOST_ORDERED_CONFIG_PATH = path.join(DATA_DIR, "most_ordered.json");

const DEFAULT_MOST_ORDERED_IDS: string[] = [
  "tapioca-rendada-carne-seca-banana-terra-queijo",
  "tapioca-rendada-carne-seca-queijo",
  "tapioca-rendada-frango-queijo",
  "tapioca-rendada-frango-queijo-catupiry",
  "cuscuz-queijo-carne-seca-banana",
  "cuscuz-queijo-frango",
];

function getMostOrderedIds(): string[] {
  try {
    if (fs.existsSync(MOST_ORDERED_CONFIG_PATH)) {
      const data = fs.readFileSync(MOST_ORDERED_CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      if (parsed && Array.isArray(parsed.itemIds) && parsed.itemIds.length > 0) {
        return parsed.itemIds;
      }
    }
  } catch (err) {
    console.error("Error reading most ordered config:", err);
  }
  return DEFAULT_MOST_ORDERED_IDS;
}

function saveMostOrderedIds(itemIds: string[]) {
  try {
    fs.writeFileSync(MOST_ORDERED_CONFIG_PATH, JSON.stringify({ itemIds }, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving most ordered config:", err);
  }
}

app.get("/api/most-ordered", (req, res) => {
  const itemIds = getMostOrderedIds();
  res.json({ itemIds });
});

app.post("/api/most-ordered", (req, res) => {
  try {
    const { itemIds } = req.body;
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ error: "itemIds deve ser uma lista de IDs." });
    }

    // Filter valid strings
    const cleanIds = itemIds
      .filter((id: any) => typeof id === "string" && id.trim() !== "")
      .map((id: string) => id.trim());

    saveMostOrderedIds(cleanIds);
    console.log(`[Most Ordered] Lista de Mais Pedidos atualizada (${cleanIds.length} itens):`, cleanIds);
    return res.json({ success: true, itemIds: cleanIds });
  } catch (err) {
    console.error("Erro ao salvar mais pedidos:", err);
    return res.status(500).json({ error: "Falha ao salvar lista de mais pedidos." });
  }
});

app.post("/api/most-ordered/reset", (req, res) => {
  try {
    saveMostOrderedIds(DEFAULT_MOST_ORDERED_IDS);
    console.log("[Most Ordered] Lista de Mais Pedidos restaurada para o padrão.");
    return res.json({ success: true, itemIds: DEFAULT_MOST_ORDERED_IDS });
  } catch (err) {
    return res.status(500).json({ error: "Erro ao restaurar mais pedidos." });
  }
});

// ==========================================
// VITE MIDDLEWARE & STATIC ASSETS SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: 3000 },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sabor da Roça server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
