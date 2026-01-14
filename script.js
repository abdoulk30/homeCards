const form = document.getElementById("apartment-form");
const cardsContainer = document.getElementById("cards-container");
const searchInput = document.getElementById("search");

let apartments = JSON.parse(localStorage.getItem("apartments")) || [];
let editingId = null;


form.addEventListener("submit", function (e) {
  e.preventDefault();

  const apartmentData = {
    id: editingId || Date.now(),
    address: document.getElementById("address").value,
    rent: document.getElementById("rent").value,
    broker: document.getElementById("broker").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value,
    photo: ""
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
  form.reset();
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
      <p>${apartment.notes}</p>
      ${apartment.photo ? `<img src="${apartment.photo}" />` : ""}
      <button class="edit-btn" data-id="${apartment.id}">Edit</button>
      <button class="delete-btn" data-id="${apartment.id}">Delete</button>
    `;

    cardsContainer.appendChild(card);

    attachEditHandlers();
    attachDeleteHandlers();
  });

  attachDeleteHandlers();
}

function attachDeleteHandlers() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach(button => {
    button.addEventListener("click", function () {
      const id = Number(this.dataset.id);

      apartments = apartments.filter(apartment => apartment.id !== id);
      localStorage.setItem("apartments", JSON.stringify(apartments));

      renderApartments(apartments);
    });
  });
}

function attachEditHandlers() {
  const editButtons = document.querySelectorAll(".edit-btn");

  editButtons.forEach(button => {
    button.addEventListener("click", function () {
      const id = Number(this.dataset.id);
      const apartment = apartments.find(a => a.id === id);

      document.getElementById("address").value = apartment.address;
      document.getElementById("rent").value = apartment.rent;
      document.getElementById("broker").value = apartment.broker;
      document.getElementById("phone").value = apartment.phone;
      document.getElementById("notes").value = apartment.notes;

      editingId = id;

      form.querySelector("button").textContent = "Update Apartment";
    });
  });
}


renderApartments(apartments);

searchInput.addEventListener("input", function () {
  const query = searchInput.value.toLowerCase();

  const filtered = apartments.filter(apartment =>
    apartment.address.toLowerCase().includes(query) ||
    apartment.broker.toLowerCase().includes(query)
  );

  renderApartments(filtered);
});
