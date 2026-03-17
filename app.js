(function () {
    // ─── Tabs VSCode-like ─────────────────────────────────────
    const tabs         = document.querySelectorAll(".tab");
    const fileSections = document.querySelectorAll(".file-section");
    const treeItems    = document.querySelectorAll(".tree-item");

    function showSection(targetId) {
        fileSections.forEach(section => {
            section.classList.toggle("hidden", section.id !== targetId);
        });
        tabs.forEach(tab => {
            tab.classList.toggle("active", tab.dataset.target === targetId);
        });
        treeItems.forEach(link => {
            link.classList.toggle("active", link.getAttribute("href") === `#${targetId}`);
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => showSection(tab.dataset.target));
    });

    treeItems.forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            showSection(link.getAttribute("href").replace("#", ""));
        });
    });

    // ─── Portfolio renderer ───────────────────────────────────
    const projectsGrid = document.getElementById("projectsGrid");
    const projects     = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];

    function buildThumbsHTML(images, projectName) {
        if (images.length <= 1) return "";
        const items = images.map((imgFile, i) => `
            <button type="button"
                    class="project-thumb${i === 0 ? " active" : ""}"
                    data-src="imagenes/${imgFile}"
                    aria-label="Ver imagen ${i + 1} de ${projectName}">
                <img src="imagenes/${imgFile}"
                     alt="Miniatura ${i + 1}"
                     loading="lazy"
                     onerror="this.src='https://placehold.co/128x80/1e1e1e/d4d4d4?text=?'">
            </button>`).join("");
        return `<div class="project-thumbs">${items}</div>`;
    }

    function buildLinksHTML(repoUrl, liveUrl) {
        const repo = repoUrl
            ? `<a href="${repoUrl}" target="_blank" rel="noopener noreferrer"> Repositorio</a>`
            : "";
        const live = liveUrl
            ? `<a href="${liveUrl}" target="_blank" rel="noopener noreferrer"> Ver proyecto</a>`
            : "";
        const combined = repo + live;
        return combined ? `<div class="project-links">${combined}</div>` : "";
    }

    function createProjectCard(project) {
        const images = Array.isArray(project.images) && project.images.length
            ? project.images
            : ["placeholder.png"];

        const name = project.name || "Proyecto sin nombre";
        const desc = project.description?.trim() || "Sin descripción (puedes editarla en projects-data.js).";

        const card = document.createElement("article");
        card.className = "project-card";
        card.innerHTML = `
            <div class="project-preview">
                <div class="project-main-image-wrap">
                    <img class="project-main-image"
                         src="imagenes/${images[0]}"
                         alt="Vista previa de ${name}"
                         loading="lazy"
                         onerror="this.src='https://placehold.co/1280x720/1e1e1e/d4d4d4?text=Imagen+no+encontrada'">
                </div>
                ${buildThumbsHTML(images, name)}
            </div>
            <div class="project-body">
                <div class="project-title">
                    <h3>${name}</h3>
                    <span class="project-id">${project.id || "sin-id"}</span>
                </div>
                <p class="project-desc">${desc}</p>
                ${buildLinksHTML(project.repoUrl, project.liveUrl)}
            </div>`;

        // Attach thumbnail click listeners
        const mainImg = card.querySelector(".project-main-image");
        card.querySelectorAll(".project-thumb").forEach(btn => {
            btn.addEventListener("click", () => {
                mainImg.src = btn.dataset.src;
                card.querySelectorAll(".project-thumb").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
            });
        });

        return card;
    }

    function renderProjects() {
        projectsGrid.innerHTML = "";

        if (!projects.length) {
            projectsGrid.innerHTML = `
                <div class="project-empty">
                    <p>No hay proyectos todavía.</p>
                    <p>Ejecuta <code>node add-project.js</code> para añadir el primero.</p>
                </div>`;
            return;
        }

        // Newest first
        [...projects].reverse().forEach(project => {
            projectsGrid.appendChild(createProjectCard(project));
        });
    }

    renderProjects();

    // Show section from URL hash
    const hash = window.location.hash.replace("#", "");
    const validSections = ["curriculum", "portfolio"];
    showSection(validSections.includes(hash) ? hash : "curriculum");
})();

// ─── Descargar CV como PDF ────────────────────────────────
function downloadCV() {
    window.print();
}
