const form = document.getElementById("apartment-form");
const cardsContainer = document.getElementById("cards-container");
const searchInput = document.getElementById("search");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photo-preview");
const photoPreviewContainer = document.querySelector(".photo-preview-container");
const photoLabel = document.getElementById("photo-label");
const homeTitle = document.getElementById("home-title");

let apartments = JSON.parse(localStorage.getItem("apartments")) || [];
let editingId = null;

/* ----------------- FULLSCREEN PHOTO HELPER ----------------- */
function openPhotoFullscreen(src) {
  if (!src) return;
  const photoModal = document.getElementById("photo-modal");
  const photoModalImg = document.getElementById("photo-modal-img");
  photoModalImg.src = src;
  photoModal.style.display = "flex";
}

/* ----------------- Photo input preview ----------------- */
photoInput.addEventListener("change", () => {
  const file = photoInput.files[0];
  if (file) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreviewContainer.style.display = "block";
    photoLabel.textContent = "Replace Photo";
  } else {
    photoPreview.src = "";
    photoPreviewContainer.style.display = "none";
    photoLabel.textContent = "Add Photo";
  }
});

photoPreview.style.cursor = "pointer";
photoPreview.onclick = () => openPhotoFullscreen(photoPreview.src);

/* ----------------- Form submit ----------------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const file = photoInput.files[0];
  const photoURL = file
    ? URL.createObjectURL(file)
    : (editingId ? apartments.find(a => a.id === editingId).photo : "");

  const apartmentData = {
    id: editingId || Date.now(),
    address: document.getElementById("address").value,
    rent: document.getElementById("rent").value,
    broker: document.getElementById("broker").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value,
    photo: photoURL
  };

  if (editingId) {
    apartments = apartments.map(a => a.id === editingId ? apartmentData : a);
    editingId = null;
    form.querySelector("button").textContent = "Add Apartment";
  } else {
    apartments.push(apartmentData);
  }

  localStorage.setItem("apartments", JSON.stringify(apartments));
  renderApartments(apartments);

  form.reset();
  photoPreview.src = "";
  photoPreviewContainer.style.display = "none";
  photoLabel.textContent = "Add Photo";
});

/* ----------------- Render apartments ----------------- */
function renderApartments(list) {
  cardsContainer.innerHTML = "";

  list.forEach(apartment => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${apartment.address}</h3>
      <p><strong>Rent:</strong> $${apartment.rent}</p>
      <p><strong>Broker:</strong> ${apartment.broker}</p>
      <p><strong>Phone:</strong> ${apartment.phone}</p>
      <p><strong>Notes:</strong> ${apartment.notes}</p>
      ${apartment.photo ? `<img src="${apartment.photo}" class="card-photo" />` : ""}
      <button class="view-btn" data-id="${apartment.id}">View Listing</button>
      <button class="edit-btn" data-id="${apartment.id}">Edit</button>
      <button class="delete-btn" data-id="${apartment.id}">Delete</button>
    `;

    cardsContainer.appendChild(card);
  });

  attachEditHandlers();
  attachDeleteHandlers();
  attachViewButtons();
}

/* ----------------- Card photo fullscreen (delegated) ----------------- */
document.body.addEventListener("click", (e) => {
  if (e.target.classList.contains("card-photo")) {
    openPhotoFullscreen(e.target.src);
  }
});

document.body.addEventListener("mouseover", (e) => {
  if (e.target.classList.contains("card-photo")) {
    e.target.style.cursor = "pointer";
  }
});

/* ----------------- Edit handlers ----------------- */
function attachEditHandlers() {
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const apartment = apartments.find(a => a.id === id);

      document.getElementById("address").value = apartment.address;
      document.getElementById("rent").value = apartment.rent;
      document.getElementById("broker").value = apartment.broker;
      document.getElementById("phone").value = apartment.phone;
      document.getElementById("notes").value = apartment.notes;

      photoPreview.src = apartment.photo || "";
      photoPreviewContainer.style.display = apartment.photo ? "block" : "none";
      photoLabel.textContent = apartment.photo ? "Replace Photo" : "Add Photo";

      editingId = id;
      form.querySelector("button").textContent = "Update Apartment";
    };
  });
}

/* ----------------- Delete handlers ----------------- */
function attachDeleteHandlers() {
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      if (confirm("Are you sure you want to delete this apartment?")) {
        apartments = apartments.filter(a => a.id !== id);
        localStorage.setItem("apartments", JSON.stringify(apartments));
        renderApartments(apartments);
      }
    };
  });
}

/* ----------------- View listing modal ----------------- */
function attachViewButtons() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const apartment = apartments.find(a => a.id === id);

      document.getElementById("modal-address").textContent = apartment.address;
      document.getElementById("modal-rent").textContent = apartment.rent;
      document.getElementById("modal-broker").textContent = apartment.broker;
      document.getElementById("modal-phone").textContent = apartment.phone;
      document.getElementById("modal-notes").textContent = apartment.notes;

      const modalPhoto = document.getElementById("modal-photo");
      modalPhoto.src = apartment.photo || "";
      modalPhoto.style.cursor = "pointer";
      modalPhoto.onclick = () => openPhotoFullscreen(modalPhoto.src);

      document.getElementById("modal-container").style.display = "flex";

      document.getElementById("modal-edit").onclick = () => {
        document.getElementById("address").value = apartment.address;
        document.getElementById("rent").value = apartment.rent;
        document.getElementById("broker").value = apartment.broker;
        document.getElementById("phone").value = apartment.phone;
        document.getElementById("notes").value = apartment.notes;

        photoPreview.src = apartment.photo || "";
        photoPreviewContainer.style.display = apartment.photo ? "block" : "none";
        photoLabel.textContent = apartment.photo ? "Replace Photo" : "Add Photo";

        editingId = apartment.id;
        form.querySelector("button").textContent = "Update Apartment";
        closeModal();
      };

      document.getElementById("modal-delete").onclick = () => {
        if (confirm("Are you sure you want to delete this apartment?")) {
          apartments = apartments.filter(a => a.id !== apartment.id);
          localStorage.setItem("apartments", JSON.stringify(apartments));
          renderApartments(apartments);
          closeModal();
        }
      };
    };
  });
}

/* ----------------- Modal helpers ----------------- */
function closeModal() {
  document.getElementById("modal-container").style.display = "none";
}

document.getElementById("modal-close").onclick = closeModal;
document.getElementById("modal-container").onclick = (e) => {
  if (e.target.id === "modal-container") closeModal();
};

/* ----------------- Fullscreen photo modal close ----------------- */
document.getElementById("photo-modal-close").onclick = () => {
  document.getElementById("photo-modal").style.display = "none";
};

document.getElementById("photo-modal").onclick = (e) => {
  if (e.target.id === "photo-modal") {
    document.getElementById("photo-modal").style.display = "none";
  }
};

/* ----------------- Search ----------------- */
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = apartments.filter(a =>
    a.address.toLowerCase().includes(query) ||
    a.broker.toLowerCase().includes(query)
  );
  renderApartments(filtered);
});

/* ----------------- Reset to Add Apartment ----------------- */
homeTitle.style.cursor = "pointer";
homeTitle.addEventListener("click", () => {
  form.reset();
  photoPreview.src = "";
  photoPreviewContainer.style.display = "none";
  photoLabel.textContent = "Add Photo";
  editingId = null;
  form.querySelector("button").textContent = "Add Apartment";
  closeModal();
});

/* ----------------- Initial render ----------------- */
renderApartments(apartments);
