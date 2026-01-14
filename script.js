const form = document.getElementById("apartment-form");
const cardsContainer = document.getElementById("cards-container");
const searchInput = document.getElementById("search");

let apartments = JSON.parse(localStorage.getItem("apartments")) || [];

form.addEventListener("submit", function (e) {
  e.preventDefault();

  const photoInput = document.getElementById("photo");
  const file = photoInput.files[0];

  const apartment = {
    id: Date.now(),
    address: document.getElementById("address").value,
    rent: document.getElementById("rent").value,
    broker: document.getElementById("broker").value,
    phone: document.getElementById("phone").value,
    notes: document.getElementById("notes").value,
    photo: file ? URL.createObjectURL(file) : ""
  };

  apartments.push(apartment);
  localStorage.setItem("apartments", JSON.stringify(apartments));

  form.reset();
  renderApartments(apartments);
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
    `;

    cardsContainer.appendChild(card);
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
