function renderStats(stats) {
  const statsContainer = document.getElementById("stats");
  statsContainer.innerHTML = stats
    .map(
      (item) => `
        <article class="stat-card">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </article>
      `
    )
    .join("");
}

function renderPrograms(programs) {
  const programList = document.getElementById("program-list");
  programList.innerHTML = programs
    .map(
      (program) => `
        <article class="program-card">
          <h3>${program.title}</h3>
          <p>${program.description}</p>
        </article>
      `
    )
    .join("");
}

function renderDonations(donations) {
  document.getElementById("donation-heading").textContent = donations.heading;
  document.getElementById("donation-intro").textContent = donations.intro;

  document.getElementById("donation-methods").innerHTML = donations.methods
    .map(
      (method) => `
        <article class="program-card">
          <h3>${method.title}</h3>
          <p>${method.description}</p>
        </article>
      `
    )
    .join("");

  const bank = donations.bankDetails;
  document.getElementById("bank-details").innerHTML = `
    <h3>Bank Transfer Details</h3>
    <p><strong>Account Name:</strong> ${bank.accountName}</p>
    <p><strong>Account Number:</strong> ${bank.accountNumber}</p>
    <p><strong>Bank Name:</strong> ${bank.bankName}</p>
    <p><strong>IFSC Code:</strong> ${bank.ifsc}</p>
  `;
}

function renderGallery(items) {
  document.getElementById("gallery-list").innerHTML = items
    .map(
      (item) => `
        <article class="gallery-card accent-${item.accent}">
          ${
            item.image
              ? `<img class="gallery-photo" src="${item.image}" alt="${item.title}" />`
              : `<div class="gallery-visual" aria-hidden="true"></div>`
          }
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderContact(contact) {
  document.getElementById("contact-card").innerHTML = `
    <h3>Contact Information</h3>
    <p><strong>Phone:</strong> ${contact.phone}</p>
    <p><strong>Email:</strong> ${contact.email}</p>
    <p><strong>Address:</strong> ${contact.address}</p>
    <p>We welcome enquiries, partnerships, sponsorships, and volunteer support.</p>
  `;
}

async function submitContactForm(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const formStatus = document.getElementById("form-status");
  const submitButton = form.querySelector("button[type='submit']");
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  formStatus.textContent = "Sending your message...";
  formStatus.className = "form-status";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Unable to submit your message.");
    }

    form.reset();
    formStatus.textContent = result.message;
    formStatus.className = "form-status success";
  } catch (error) {
    formStatus.textContent = error.message;
    formStatus.className = "form-status error";
  } finally {
    submitButton.disabled = false;
  }
}

async function loadWebsite() {
  const response = await fetch("/api/site-data");
  const data = await response.json();

  document.getElementById("site-title").textContent = data.title;
  document.getElementById("tagline").textContent = data.tagline;
  document.getElementById("about-text").textContent = data.about;
  document.getElementById("year").textContent = new Date().getFullYear();

  renderStats(data.stats);
  renderPrograms(data.programs);
  renderDonations(data.donations);
  renderGallery(data.gallery);
  renderContact(data.contact);

  document.getElementById("contact-form").addEventListener("submit", submitContactForm);
}

loadWebsite().catch(() => {
  document.getElementById("tagline").textContent =
    "We are unable to load the website details right now. Please try again shortly.";
});
