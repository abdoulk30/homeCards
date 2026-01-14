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

// ----------------- Photo input preview -----------------
photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (file) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreviewContainer.style.display = "block";
    photoLabel.textContent = "Replace Photo";
  } else {
    if (editingId) {
      const apartment = apartments.find(a => a.id === editingId);
      photoPreview.src = apartment.photo || "";
      photoPreviewContainer.style.display = apartment.photo ? "block" : "none";
      photoLabel.textContent = apartment.photo ? "Replace Photo" : "Add Photo";
    } else {
      photoPreview.src = "";
      photoPreviewContainer.style.display = "none";
      photoLabel.textContent = "Add Photo";
    }
  }
});

// ----------------- Form submit -----------------
form.addEventListener("submit", function (e) {
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

  // Reset form
  form.reset();
  photoPreview.src = "";
  photoPreviewContainer.style.display = "none";
  photoLabel.textContent = "Add Photo";
  editingId = null;
  form.querySelector("button").textContent = "Add Apartment";
});

// ----------------- Render apartments -----------------
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

  // Attach handlers AFTER all cards exist
  attachEditHandlers();
  attachDeleteHandlers();
  attachViewButtons();
}

// ----------------- Edit handlers -----------------
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

// ----------------- Delete handlers -----------------
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

// ----------------- View listing handlers -----------------
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
      document.getElementById("modal-photo").src = apartment.photo || "";

      document.getElementById("modal-container").style.display = "flex";

      // Modal Edit
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

      // Modal Delete
      document.getElementById("modal-delete").onclick = () => {
        if (confirm("Are you sure you want to delete this apartment?")) {
          apartments = apartments.filter(a => a.id !== apartment.id);
          renderApartments(apartments);
          closeModal();
        }
      };
    };
  });
}

// ----------------- Modal close helpers -----------------
function closeModal() {
  document.getElementById("modal-container").style.display = "none";
}

document.getElementById("modal-close").onclick = closeModal;
document.getElementById("modal-container").onclick = e => {
  if (e.target.id === "modal-container") closeModal();
};

// ----------------- Full screen photo modal -----------------
document.body.addEventListener("click", (e) => {
  // Use event delegation for all future .card-photo elements
  if (e.target.classList.contains("card-photo")) {
    const src = e.target.src;
    const photoModal = document.getElementById("photo-modal");
    const photoModalImg = document.getElementById("photo-modal-img");
    photoModalImg.src = src;
    photoModal.style.display = "flex";
  }
});


document.getElementById("photo-modal-close").onclick = () => {
  document.getElementById("photo-modal").style.display = "none";
};

document.getElementById("photo-modal").onclick = e => {
  if (e.target.id === "photo-modal") document.getElementById("photo-modal").style.display = "none";
};

// ----------------- Search -----------------
searchInput.addEventListener("input", function () {
  const query = searchInput.value.toLowerCase();
  const filtered = apartments.filter(a =>
    a.address.toLowerCase().includes(query) ||
    a.broker.toLowerCase().includes(query)
  );
  renderApartments(filtered);
});

// ----------------- Reset to Add Apartment mode -----------------
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

// ----------------- Initial render -----------------
renderApartments(apartments);
