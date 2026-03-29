function formatDate(isoDate) {
  return new Date(isoDate).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function renderMessages(messages) {
  const container = document.getElementById("message-list");

  if (!messages.length) {
    container.innerHTML = `
      <article class="message-card empty-state">
        <h3>No messages yet</h3>
        <p>New contact form submissions will appear here.</p>
      </article>
    `;
    return;
  }

  container.innerHTML = messages
    .map(
      (message) => `
        <article class="message-card">
          <div class="message-meta">
            <strong>${message.name}</strong>
            <span>${formatDate(message.createdAt)}</span>
          </div>
          <p><strong>Email:</strong> ${message.email}</p>
          <p><strong>Subject:</strong> ${message.subject || "General enquiry"}</p>
          <p>${message.message}</p>
        </article>
      `
    )
    .join("");
}

async function loadMessages() {
  const status = document.getElementById("admin-status");
  status.textContent = "Loading messages...";
  status.className = "form-status";

  try {
    const response = await fetch("/api/admin/messages");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to load messages.");
    }

    renderMessages(data.messages);
    status.textContent = `Showing ${data.messages.length} message(s).`;
    status.className = "form-status success";
  } catch (error) {
    status.textContent = error.message;
    status.className = "form-status error";
  }
}

document.getElementById("refresh-messages").addEventListener("click", loadMessages);
loadMessages();
