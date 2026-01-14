const form = document.getElementById("apartment-form");
const cardsContainer = document.getElementById("cards-container");
const searchInput = document.getElementById("search");

let apartments = JSON.parse(localStorage.getItem("apartments")) || [];
let editingId = null;


const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photo-preview");
const photoPreviewContainer = document.querySelector(".photo-preview-container");
const photoLabel = document.getElementById("photo-label");

// When selecting a new file
photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (file) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreviewContainer.style.display = "block"; 
    photoLabel.textContent = "Replace Photo"; // Change label when a file is selected
  } else {
    photoPreview.src = "";
    photoPreviewContainer.style.display = "none";
    photoLabel.textContent = "Add Photo"; // Revert if no file
  }
});



form.addEventListener("submit", function (e) {
  e.preventDefault();

  const photoInput = document.getElementById("photo");
  const file = photoInput.files[0];

  // if editing and no new file is chosen, keep the old photo
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
    apartments = apartments.map(a =>
      a.id === editingId ? apartmentData : a
    );
    editingId = null;
    form.querySelector("button").textContent = "Add Apartment";
  } else {
    apartments.push(apartmentData);
  }

  localStorage.setItem("apartments", JSON.stringify(apartments));
  renderApartments(apartments);
  form.reset();                      // clears all text fields and file input
  photoPreview.src = "";              // clears the preview image
  photoPreviewContainer.style.display = "none";  // hides the container
  editingId = null;                   // exit edit mode
  form.querySelector("button").textContent = "Add Apartment"; // reset button
});



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
        ${apartment.photo ? `<img src="${apartment.photo}" />` : ""}
        <button class="view-btn" data-id="${apartment.id}">View Listing</button>
        <button class="edit-btn" data-id="${apartment.id}">Edit</button>
        <button class="delete-btn" data-id="${apartment.id}">Delete</button>
    `;


    cardsContainer.appendChild(card);

    attachEditHandlers();
    attachDeleteHandlers();
    attachViewButtons(); 
  });

  attachDeleteHandlers();
}

function attachViewButtons() {
  document.querySelectorAll(".view-btn").forEach(btn => {
    btn.onclick = () => {
      const id = Number(btn.dataset.id);
      const apartment = apartments.find(a => a.id === id);

      // Populate modal content
      document.getElementById("modal-address").textContent = apartment.address;
      document.getElementById("modal-rent").textContent = apartment.rent;
      document.getElementById("modal-broker").textContent = apartment.broker;
      document.getElementById("modal-phone").textContent = apartment.phone;
      document.getElementById("modal-notes").textContent = apartment.notes;

      // Set the modal photo (at the bottom)
      document.getElementById("modal-photo").src = apartment.photo || "";

      // Show modal
      document.getElementById("modal-container").style.display = "flex";

      // Edit button in modal
      document.getElementById("modal-edit").onclick = () => {
        // Fill form fields with apartment data
        document.getElementById("address").value = apartment.address;
        document.getElementById("rent").value = apartment.rent;
        document.getElementById("broker").value = apartment.broker;
        document.getElementById("phone").value = apartment.phone;
        document.getElementById("notes").value = apartment.notes;

        // Set photo preview in form
        photoPreview.src = apartment.photo || "";
        photoPreviewContainer.style.display = apartment.photo ? "block" : "none";

        // Set editing state
        editingId = apartment.id;
        form.querySelector("button").textContent = "Update Apartment";

        // Close modal after starting edit
        closeModal();
      };

      // Delete button in modal
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

// Close modal helper
function closeModal() {
  document.getElementById("modal-container").style.display = "none";
}

// Close modal when clicking X
document.getElementById("modal-close").onclick = closeModal;

// Close modal when clicking outside modal content
document.getElementById("modal-container").onclick = (e) => {
  if (e.target.id === "modal-container") closeModal();
};


function attachDeleteHandlers() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach(button => {
    // Remove old click handlers first
    button.onclick = null;

    // Attach new click handler
    button.onclick = function () {
      const id = Number(this.dataset.id);

      const confirmed = confirm("Are you sure you want to delete this apartment?");
      if (!confirmed) return;

      apartments = apartments.filter(a => a.id !== id);
      localStorage.setItem("apartments", JSON.stringify(apartments));

      renderApartments(apartments);
    };
  });
}


function attachEditHandlers() {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach(button => {
    // Remove any previous click handler
    button.onclick = null;

    // Attach new click handler
    button.onclick = function () {
      const id = Number(this.dataset.id);
      const apartment = apartments.find(a => a.id === id);

      // Fill form with apartment data
      document.getElementById("address").value = apartment.address;
      document.getElementById("rent").value = apartment.rent;
      document.getElementById("broker").value = apartment.broker;
      document.getElementById("phone").value = apartment.phone;
      document.getElementById("notes").value = apartment.notes;

      // Show previous photo in preview
      photoPreview.src = apartment.photo || "";
      photoPreviewContainer.style.display = apartment.photo ? "block" : "none";
      photoLabel.textContent = apartment.photo ? "Replace Photo" : "Add Photo";

      // Set editing state
      editingId = id;
      form.querySelector("button").textContent = "Update Apartment";
    };
  });
}

// --- File input change handler ---
photoInput.addEventListener("change", function () {
  const file = photoInput.files[0];
  if (file) {
    photoPreview.src = URL.createObjectURL(file);
    photoPreviewContainer.style.display = "block";
  } else {
    // If editing and no new file selected, show previous photo
    if (editingId) {
      const apartment = apartments.find(a => a.id === editingId);
      photoPreview.src = apartment.photo || "";
      photoPreviewContainer.style.display = apartment.photo ? "block" : "none";
    } else {
      // If adding new apartment and no file selected, hide preview
      photoPreview.src = "";
      photoPreviewContainer.style.display = "none";
    }
  }
});

// HomeCards title click resets the form to Add Apartment mode
const homeTitle = document.getElementById("home-title");
homeTitle.style.cursor = "pointer"; // makes it feel clickable

homeTitle.addEventListener("click", () => {
  // Reset all form fields
  document.getElementById("address").value = "";
  document.getElementById("rent").value = "";
  document.getElementById("broker").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("notes").value = "";

  // Reset photo preview
  photoPreview.src = "";
  photoPreviewContainer.style.display = "none";
  photoLabel.textContent = "Add Photo";
  photoInput.value = "";

  // Reset editing state
  editingId = null;
  form.querySelector("button").textContent = "Add Apartment";

  // Close modal if open
  closeModal();
});


renderApartments(apartments);
attachEditHandlers();
attachViewButtons();


searchInput.addEventListener("input", function () {
  const query = searchInput.value.toLowerCase();

  const filtered = apartments.filter(apartment =>
    apartment.address.toLowerCase().includes(query) ||
    apartment.broker.toLowerCase().includes(query)
  );

  renderApartments(filtered);
});
