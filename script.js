const form = document.getElementById("apartment-form");
const cardsContainer = document.getElementById("cards-container");
const searchInput = document.getElementById("search");
const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photo-preview");
const photoPreviewContainer = document.querySelector(".photo-preview-container");
const photoLabel = document.getElementById("photo-label");
const homeTitle = document.getElementById("home-title");
const phoneInput = document.getElementById("phone");
const submitBtn = document.getElementById("submit-btn");

let apartments = JSON.parse(localStorage.getItem("apartments")) || [];
let editingId = null;

/* ----------------- Phone formatting while typing ----------------- */
phoneInput.addEventListener("input", () => {
  let digits = phoneInput.value.replace(/\D/g, "");
  if (digits.length > 10) digits = digits.slice(0, 10);

  let formatted = digits;
  if (digits.length >= 7) {
    formatted = `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
  } else if (digits.length >= 4) {
    formatted = `${digits.slice(0,3)}-${digits.slice(3)}`;
  }

  phoneInput.value = formatted;
});

/* ----------------- Only allow numbers and dashes ----------------- */
phoneInput.addEventListener("keydown", (e) => {
  const allowedKeys = [
    "Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab",
    "Home", "End"
  ];

  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
    return;
  }

  if (allowedKeys.includes(e.key)) return;
  if (!/[0-9-]/.test(e.key)) e.preventDefault();
});

/* ----------------- FULLSCREEN PHOTO HELPER ----------------- */
let fullscreenPhotos = [];
let fullscreenIndex = 0;

function openPhotoFullscreen(srcArray, startIndex = 0) {
  if (!srcArray || !srcArray.length) return;

  fullscreenPhotos = srcArray;
  fullscreenIndex = startIndex;

  const photoModal = document.getElementById("photo-modal");
  const photoModalImg = document.getElementById("photo-modal-img");
  const removeBtn = document.getElementById("fullscreen-remove-btn");

  const showImage = () => {
    photoModalImg.src = fullscreenPhotos[fullscreenIndex];
  };

  showImage();
  photoModal.style.display = "flex";

  // remove photo from list
  removeBtn.onclick = () => {
    selectedPhotos.splice(fullscreenIndex, 1);
    selectedPhotoURLs.splice(fullscreenIndex, 1);

    if (!selectedPhotoURLs.length) {
      photoModal.style.display = "none";
      photoPreviewContainer.style.display = "none";
      photoLabel.textContent = "Add Photos";
      submitBtn.textContent = "Add Apartment";
      editingId = null;
      return;
    }

    if (fullscreenIndex >= selectedPhotoURLs.length) {
      fullscreenIndex = selectedPhotoURLs.length - 1;
    }

    showImage();
    renderPhotoPreviews();
  };
}

document.getElementById("fullscreen-prev").onclick = () => {
  fullscreenIndex = (fullscreenIndex - 1 + fullscreenPhotos.length) % fullscreenPhotos.length;
  document.getElementById("photo-modal-img").src = fullscreenPhotos[fullscreenIndex];
};

document.getElementById("fullscreen-next").onclick = () => {
  fullscreenIndex = (fullscreenIndex + 1) % fullscreenPhotos.length;
  document.getElementById("photo-modal-img").src = fullscreenPhotos[fullscreenIndex];
};

function formatPhone(phone) {
  if (!phone) return "Not listed";
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 10) return phone;
  return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6)}`;
}

/* ----------------- Photo input preview (MULTI PHOTO) ----------------- */
let selectedPhotos = [];
let selectedPhotoURLs = [];

function renderPhotoPreviews() {
  photoPreview.innerHTML = selectedPhotoURLs
    .map((src, idx) => `
      <div class="preview-wrapper">
        <button class="remove-btn" data-index="${idx}">×</button>
        <img src="${src}" class="preview-img" data-index="${idx}" />
      </div>
    `)
    .join("");

  document.querySelectorAll(".preview-img").forEach(img => {
    img.onclick = () => openPhotoFullscreen(selectedPhotoURLs, Number(img.dataset.index));
  });

  document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.onclick = () => {
      const idx = Number(btn.dataset.index);
      selectedPhotos.splice(idx, 1);
      selectedPhotoURLs.splice(idx, 1);
      renderPhotoPreviews();
    };
  });
}

function isDuplicateFile(file) {
  return selectedPhotos.some(
    existing =>
      existing.name === file.name &&
      existing.size === file.size &&
      existing.lastModified === file.lastModified
  );
}

photoInput.addEventListener("change", () => {
  const newFiles = Array.from(photoInput.files);

  newFiles.forEach(file => {
    if (isDuplicateFile(file)) {
      alert("You already added this photo!");
      return;
    }

    const url = URL.createObjectURL(file);
    selectedPhotos.push(file);
    selectedPhotoURLs.push(url);
  });

  photoPreviewContainer.style.display = selectedPhotoURLs.length ? "block" : "none";
  photoLabel.textContent = "Add Photos";
  renderPhotoPreviews();
  photoInput.value = "";
});


/* ----------------- Form submit ----------------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const apartmentData = {
    id: editingId || Date.now(),
    address: document.getElementById("address").value,
    rent: document.getElementById("rent").value,
    broker: document.getElementById("broker").value,
    landlord: document.getElementById("landlord").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value,
    photos: selectedPhotoURLs
  };

  if (editingId) {
    apartments = apartments.map(a =>
      a.id === editingId ? apartmentData : a
    );
  } else {
    apartments.push(apartmentData);
  }

  localStorage.setItem("apartments", JSON.stringify(apartments));
  renderApartments(apartments);

  // ---------- reset form ----------
  form.reset();
  photoPreview.innerHTML = "";
  photoPreviewContainer.style.display = "none";
  photoLabel.textContent = "Add Photos";
  photoInput.value = "";

  editingId = null;
  submitBtn.textContent = "Add Apartment";
});

/* ----------------- Render apartments ----------------- */
function renderApartments(list) {
  cardsContainer.innerHTML = "";

  list.forEach(apartment => {
    const card = document.createElement("div");
    card.className = "card";

    const photoHtml = apartment.photos && apartment.photos.length
      ? `<img src="${apartment.photos[0]}" class="card-photo" />`
      : "";

    card.innerHTML = `
      <h3>${apartment.address}</h3>
      <p><strong>Rent:</strong> $${apartment.rent || "Not listed"}</p>
      <p><strong>Broker:</strong> ${apartment.broker || "Not listed"}</p>
      <p><strong>Landlord:</strong> ${apartment.landlord || "Not listed"}</p>
      <p><strong>Phone:</strong> ${formatPhone(apartment.phone)}</p>
      <p><strong>Notes:</strong> ${apartment.notes || "Not listed"}</p>
      ${photoHtml}
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
    const id = Number(e.target.closest(".card").querySelector(".view-btn").dataset.id);
    const apartment = apartments.find(a => a.id === id);
    openPhotoFullscreen(apartment.photos, 0);
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
      document.getElementById("landlord").value = apartment.landlord;
      document.getElementById("phone").value = apartment.phone;
      document.getElementById("notes").value = apartment.notes;

      // ---- FIXED MULTI PHOTO EDIT LOGIC ----
      selectedPhotos = []; // keep files empty in edit mode
      selectedPhotoURLs = apartment.photos ? [...apartment.photos] : [];

      photoPreviewContainer.style.display = selectedPhotoURLs.length ? "block" : "none";
      photoLabel.textContent = "Add Photos";

      renderPhotoPreviews();

      editingId = id;
      submitBtn.textContent = "Update Apartment";
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
let modalPhotos = [];
let modalIndex = 0;

function updateModalPhoto() {
  const modalPhoto = document.getElementById("modal-photo");
  modalPhoto.src = modalPhotos[modalIndex];
}

function attachViewButtons() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const apartment = apartments.find(a => a.id === id);

      document.getElementById("modal-address").textContent = apartment.address || "Not listed";
      document.getElementById("modal-rent").textContent = apartment.rent || "Not listed";
      document.getElementById("modal-broker").textContent = apartment.broker || "Not listed";
      document.getElementById("modal-landlord").textContent = apartment.landlord || "Not listed";
      document.getElementById("modal-phone").textContent = formatPhone(apartment.phone);
      document.getElementById("modal-notes").textContent = apartment.notes || "Not listed";

      modalPhotos = apartment.photos || [];
      modalIndex = 0;

      if (modalPhotos.length > 0) {
        updateModalPhoto();
        document.getElementById("modal-photo").style.display = "block";
      } else {
        document.getElementById("modal-photo").style.display = "none";
      }

      document.getElementById("modal-container").style.display = "flex";

      document.getElementById("modal-edit").onclick = () => {
        closeModal();
        document.querySelector(`.edit-btn[data-id="${apartment.id}"]`).click();
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

document.getElementById("modal-prev").onclick = () => {
  if (!modalPhotos.length) return;
  modalIndex = (modalIndex - 1 + modalPhotos.length) % modalPhotos.length;
  updateModalPhoto();
};

document.getElementById("modal-next").onclick = () => {
  if (!modalPhotos.length) return;
  modalIndex = (modalIndex + 1) % modalPhotos.length;
  updateModalPhoto();
};

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
    a.broker.toLowerCase().includes(query) ||
    a.landlord.toLowerCase().includes(query)
  );
  renderApartments(filtered);
});

/* ----------------- Reset to Add Apartment ----------------- */
homeTitle.style.cursor = "pointer";
homeTitle.addEventListener("click", () => {
  form.reset();
  photoPreview.innerHTML = "";
  photoPreviewContainer.style.display = "none";
  photoLabel.textContent = "Add Photos";
  editingId = null;
  submitBtn.textContent = "Add Apartment";
  closeModal();
});

/* ----------------- Initial render ----------------- */
renderApartments(apartments);
