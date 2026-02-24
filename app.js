(function () {
    // -------- Tabs VSCode-like --------
    const tabs = document.querySelectorAll(".tab");
    const fileSections = document.querySelectorAll(".file-section");
    const treeItems = document.querySelectorAll(".tree-item");

    function showSection(targetId) {
        fileSections.forEach(section => {
            section.classList.toggle("hidden", section.id !== targetId);
        });

        tabs.forEach(tab => {
            tab.classList.toggle("active", tab.dataset.target === targetId);
        });

        treeItems.forEach(link => {
            const isActive = link.getAttribute("href") === `#${targetId}`;
            link.classList.toggle("active", isActive);
        });
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", () => showSection(tab.dataset.target));
    });

    treeItems.forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetId = link.getAttribute("href").replace("#", "");
            showSection(targetId);
        });
    });

    // -------- Portfolio renderer --------
    const projectsGrid = document.getElementById("projectsGrid");
    const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];

    function createProjectCard(project) {
        const card = document.createElement("article");
        card.className = "project-card";

        const images = Array.isArray(project.images) && project.images.length
            ? project.images
            : ["placeholder.png"]; // opcional, si quieres crear uno real en /imagenes

        // Preview section
        const preview = document.createElement("div");
        preview.className = "project-preview";

        const mainWrap = document.createElement("div");
        mainWrap.className = "project-main-image-wrap";

        const mainImg = document.createElement("img");
        mainImg.className = "project-main-image";
        mainImg.src = `imagenes/${images[0]}`;
        mainImg.alt = `Vista previa del proyecto ${project.name}`;
        mainImg.loading = "lazy";
        mainImg.onerror = function () {
            this.src = "https://placehold.co/1280x720/1e1e1e/d4d4d4?text=Imagen+no+encontrada";
        };

        mainWrap.appendChild(mainImg);
        preview.appendChild(mainWrap);

        if (images.length > 1) {
            const thumbs = document.createElement("div");
            thumbs.className = "project-thumbs";

            images.forEach((imgFile, index) => {
                const thumbBtn = document.createElement("button");
                thumbBtn.type = "button";
                thumbBtn.className = "project-thumb" + (index === 0 ? " active" : "");
                thumbBtn.setAttribute("aria-label", `Ver imagen ${index + 1} del proyecto ${project.name}`);

                const thumbImg = document.createElement("img");
                thumbImg.src = `imagenes/${imgFile}`;
                thumbImg.alt = `Miniatura ${index + 1}`;
                thumbImg.loading = "lazy";
                thumbImg.onerror = function () {
                    this.src = "https://placehold.co/128x80/1e1e1e/d4d4d4?text=?";
                };

                thumbBtn.appendChild(thumbImg);

                thumbBtn.addEventListener("click", () => {
                    mainImg.src = `imagenes/${imgFile}`;
                    mainImg.alt = `Vista previa del proyecto ${project.name} (${index + 1})`;

                    thumbs.querySelectorAll(".project-thumb").forEach(btn => btn.classList.remove("active"));
                    thumbBtn.classList.add("active");
                });

                thumbs.appendChild(thumbBtn);
            });

            preview.appendChild(thumbs);
        }

        // Body
        const body = document.createElement("div");
        body.className = "project-body";

        const titleWrap = document.createElement("div");
        titleWrap.className = "project-title";

        const title = document.createElement("h3");
        title.textContent = project.name || "Proyecto sin nombre";

        const idTag = document.createElement("span");
        idTag.className = "project-id";
        idTag.textContent = project.id || "sin-id";

        titleWrap.appendChild(title);
        titleWrap.appendChild(idTag);

        const desc = document.createElement("p");
        desc.className = "project-desc";
        desc.textContent = project.description?.trim() || "Sin descripción (puedes editarla en projects-data.js).";

        const links = document.createElement("div");
        links.className = "project-links";

        if (project.repoUrl) {
            const repoLink = document.createElement("a");
            repoLink.href = project.repoUrl;
            repoLink.target = "_blank";
            repoLink.rel = "noopener noreferrer";
            repoLink.textContent = "🌿 Repositorio";
            links.appendChild(repoLink);
        }

        if (project.liveUrl) {
            const liveLink = document.createElement("a");
            liveLink.href = project.liveUrl;
            liveLink.target = "_blank";
            liveLink.rel = "noopener noreferrer";
            liveLink.textContent = "🚀 Ver proyecto";
            links.appendChild(liveLink);
        }

        body.appendChild(titleWrap);
        body.appendChild(desc);
        if (links.childElementCount) body.appendChild(links);

        card.appendChild(preview);
        card.appendChild(body);

        return card;
    }

    function renderProjects() {
        projectsGrid.innerHTML = "";

        if (!projects.length) {
            const empty = document.createElement("div");
            empty.className = "project-empty";
            empty.innerHTML = `
        <p>No hay proyectos todavía.</p>
        <p>Ejecuta <code>node add-project.js</code> para añadir el primero.</p>
      `;
            projectsGrid.appendChild(empty);
            return;
        }

        // Mostrar últimos primero
        [...projects].reverse().forEach(project => {
            projectsGrid.appendChild(createProjectCard(project));
        });
    }

    renderProjects();

    // Mostrar sección según hash si existe
    const hash = window.location.hash.replace("#", "");
    const validSections = ["curriculum", "portfolio", "contacto"];
    if (validSections.includes(hash)) {
        showSection(hash);
    } else {
        showSection("curriculum");
    }
})();