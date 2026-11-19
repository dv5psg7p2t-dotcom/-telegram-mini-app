const tg = window.Telegram && window.Telegram.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

const MAX_SIDE = 1280;

const fileInput = document.getElementById("fileInput");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const processing = document.getElementById("processing");
const result = document.getElementById("result");
const resultImage = document.getElementById("resultImage");
const resetBtn = document.getElementById("resetBtn");
const downloadBtn = document.getElementById("downloadBtn");
const tabs = document.querySelectorAll(".tab");
const actions = document.querySelectorAll(".action");

let currentImage = null; // data URL (сжатое исходное фото)
let currentStyle = "enhance";
let busy = false;

function setStyle(style) {
  currentStyle = style;
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.style === style));
}

// Сжимаем фото, чтобы уложиться в лимит Vercel
function loadAndResize(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
      width = Math.round(width * scale);
      height = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Не удалось прочитать фото"));
    };
    img.src = url;
  });
}

fileInput.addEventListener("change", async () => {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  try {
    currentImage = await loadAndResize(file);
    preview.src = currentImage;
    editor.classList.remove("hidden");
    result.classList.add("hidden");
    resultImage.src = "";
  } catch (err) {
    alert(err.message);
  }
});

tabs.forEach((tab) => {
  tab.addEventListener("click", () => setStyle(tab.dataset.style));
});

async function process(style) {
  if (busy) return;
  if (!currentImage) {
    alert("Сначала загрузи фото");
    return;
  }

  busy = true;
  setStyle(style);
  processing.classList.remove("hidden");
  result.classList.add("hidden");

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: currentImage, style })
    });

    let data = {};
    try {
      data = await response.json();
    } catch (e) {
      // ответ не JSON (например, 413 от Vercel)
    }

    if (!response.ok) {
      throw new Error(data.error || "Ошибка сервера (" + response.status + ")");
    }

    resultImage.src = data.image;
    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (err) {
    alert("Не получилось обработать фото: " + err.message);
  } finally {
    processing.classList.add("hidden");
    busy = false;
  }
}

actions.forEach((btn) => {
  btn.addEventListener("click", () => process(btn.dataset.action));
});

resetBtn.addEventListener("click", () => {
  currentImage = null;
  fileInput.value = "";
  preview.src = "";
  resultImage.src = "";
  editor.classList.add("hidden");
  result.classList.add("hidden");
  processing.classList.add("hidden");
  setStyle("enhance");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

downloadBtn.addEventListener("click", () => {
  if (!resultImage.src) {
    alert("Сначала обработай фото");
    return;
  }
  const a = document.createElement("a");
  a.href = resultImage.src;
  a.download = "ai-photo-studio.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
});
