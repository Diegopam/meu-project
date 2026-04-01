const STORAGE_KEY = "gbaVaultRoms";

const romUpload = document.getElementById("rom-upload");
const romList = document.getElementById("rom-list");
const clearLibraryBtn = document.getElementById("clear-library");
const template = document.getElementById("rom-item-template");

const getLibrary = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveLibrary = (roms) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roms));
};

const formatBytes = (size) => {
  if (!size) return "0 KB";
  return `${(size / 1024).toFixed(1)} KB`;
};

const openRomInNewTab = (rom) => {
  const emulatorBase = "https://gba.js.org/?rom=";
  const target = `${emulatorBase}${encodeURIComponent(rom.data)}`;
  window.open(target, "_blank", "noopener,noreferrer");
};

const removeRom = (id) => {
  const roms = getLibrary().filter((rom) => rom.id !== id);
  saveLibrary(roms);
  renderLibrary();
};

const renderLibrary = () => {
  const roms = getLibrary();
  romList.innerHTML = "";

  if (!roms.length) {
    romList.innerHTML = "<li class='tip'>Nenhuma ROM adicionada ainda.</li>";
    return;
  }

  roms.forEach((rom) => {
    const node = template.content.cloneNode(true);
    node.querySelector("h3").textContent = rom.name;
    node.querySelector("small").textContent = `${formatBytes(rom.size)} • ${new Date(
      rom.createdAt
    ).toLocaleString("pt-BR")}`;

    node.querySelector(".btn-play").addEventListener("click", () => openRomInNewTab(rom));
    node.querySelector(".btn-remove").addEventListener("click", () => removeRom(rom.id));

    romList.appendChild(node);
  });
};

romUpload.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const asDataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Falha ao ler a ROM"));
    reader.readAsDataURL(file);
  });

  const roms = getLibrary();
  roms.unshift({
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    createdAt: Date.now(),
    data: asDataUrl,
  });

  saveLibrary(roms);
  renderLibrary();
  event.target.value = "";
});

clearLibraryBtn.addEventListener("click", () => {
  if (!confirm("Deseja realmente remover toda a sua biblioteca?")) return;
  saveLibrary([]);
  renderLibrary();
});

renderLibrary();
