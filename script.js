const upload = document.getElementById("upload");
const foto = document.getElementById("foto");
const editor = document.getElementById("editor");
const zoom = document.getElementById("zoom");
const baixar = document.getElementById("baixar");

const filtroPB = document.getElementById("filtroPB");
const filtroBrilho = document.getElementById("filtroBrilho");
const filtroContraste = document.getElementById("filtroContraste");

let pos = { x: 0, y: 0 };
let dragging = false;
let offset = { x: 0, y: 0 };
let escalaAtual = 1;
let fotoCarregada = false;

// -------------------------------
// Carregar imagem
// -------------------------------
upload.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    fotoCarregada = false;
    foto.style.filter = "none";

    foto.onload = () => {
        fotoCarregada = true;

        foto.style.width = foto.naturalWidth + "px";
        foto.style.height = foto.naturalHeight + "px";

        const editorW = editor.clientWidth;
        const editorH = editor.clientHeight;

        // Centralizar a imagem
        pos.x = (editorW - foto.naturalWidth) / 2;
        pos.y = (editorH - foto.naturalHeight) / 2;

        foto.style.left = pos.x + "px";
        foto.style.top = pos.y + "px";

        escalaAtual = 1;
        zoom.value = 1;

        aplicarFiltrosPreview();
    };

    foto.src = URL.createObjectURL(file);
});

// -------------------------------
// Zoom
// -------------------------------
zoom.addEventListener("input", () => {
    escalaAtual = parseFloat(zoom.value);
    foto.style.transform = `scale(${escalaAtual})`;
});

// -------------------------------
// Preview dos filtros
// -------------------------------
function aplicarFiltrosPreview() {
    if (!fotoCarregada) return;

    let filtrosCSS = `
        ${filtroPB.checked ? "grayscale(100%)" : ""}
        brightness(${filtroBrilho.value}%)
        contrast(${filtroContraste.value}%)
    `;

    foto.style.filter = filtrosCSS;
}

[filtroPB, filtroBrilho, filtroContraste].forEach(el => {
    el.addEventListener("input", aplicarFiltrosPreview);
});

// -------------------------------
// Arrastar no DESKTOP
// -------------------------------
editor.addEventListener("mousedown", (e) => {
    dragging = true;
    offset.x = e.clientX - pos.x;
    offset.y = e.clientY - pos.y;
});

editor.addEventListener("mousemove", (e) => {
    if (!dragging) return;

    pos.x = e.clientX - offset.x;
    pos.y = e.clientY - offset.y;

    foto.style.left = pos.x + "px";
    foto.style.top = pos.y + "px";
});

editor.addEventListener("mouseup", () => dragging = false);
editor.addEventListener("mouseleave", () => dragging = false);

// -------------------------------
// Arrastar no MOBILE
// -------------------------------
editor.addEventListener("touchstart", (e) => {
    dragging = true;
    const touch = e.touches[0];
    offset.x = touch.clientX - pos.x;
    offset.y = touch.clientY - pos.y;
});

editor.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const touch = e.touches[0];

    pos.x = touch.clientX - offset.x;
    pos.y = touch.clientY - offset.y;

    foto.style.left = pos.x + "px";
    foto.style.top = pos.y + "px";
});

editor.addEventListener("touchend", () => dragging = false);

// -------------------------------
// Baixar imagem FINAL
// -------------------------------
baixar.addEventListener("click", () => {

    if (!fotoCarregada) {
        alert("Envie uma foto antes!");
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = editor.offsetWidth;
    canvas.height = editor.offsetHeight;
    const ctx = canvas.getContext("2d");

    // Posição e escala
    const fotoRect = foto.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();

    const posX = fotoRect.left - editorRect.left;
    const posY = fotoRect.top - editorRect.top;
    const escala = escalaAtual;

    // -------------------
    // Aplicar filtros no canvas
    // -------------------
    let filtrosCanvas = `
        ${filtroPB.checked ? "grayscale(100%)" : ""}
        brightness(${filtroBrilho.value}%)
        contrast(${filtroContraste.value}%)
    `;

    ctx.filter = filtrosCanvas;

    // -------------------
    // Desenhar foto
    // -------------------
    ctx.save();
    ctx.translate(posX, posY);
    ctx.scale(escala, escala);
    ctx.drawImage(foto, 0, 0, foto.naturalWidth, foto.naturalHeight);
    ctx.restore();

    // -------------------
    // Desenhar moldura por cima (sem filtros)
    // -------------------
    ctx.filter = "none";
    ctx.drawImage(moldura, 0, 0, canvas.width, canvas.height);

    // -------------------
    // Download
    // -------------------
    const link = document.createElement("a");
    link.download = "moldura-final.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
});
