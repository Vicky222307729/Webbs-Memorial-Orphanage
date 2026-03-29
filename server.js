const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const contactMessages = [];

const siteData = {
  title: "Webbs Memorial Orphanage",
  tagline: "A safe and hopeful home where every child is valued, supported, and encouraged to dream.",
  about:
    "Webbs Memorial Orphanage is a caring children's home dedicated to providing shelter, education, nutrition, and emotional support for every child. Our mission is to create a loving environment where children can grow with dignity, confidence, and opportunity.",
  stats: [
    { value: "24/7", label: "Care and supervision" },
    { value: "100%", label: "Focus on education and well-being" },
    { value: "1", label: "Safe and supportive home" }
  ],
  programs: [
    {
      title: "Education Support",
      description: "We help children build a strong future through schooling, tutoring, and life-skills development."
    },
    {
      title: "Healthy Living",
      description: "Balanced meals, health checkups, and daily care help every child stay healthy and active."
    },
    {
      title: "Emotional Care",
      description: "We create a nurturing environment where children feel safe, respected, and deeply cared for."
    }
  ],
  donations: {
    heading: "Give children comfort, care, and a brighter future",
    intro:
      "Your contribution helps us provide nutritious meals, school supplies, clothing, healthcare, and a secure home for every child.",
    methods: [
      {
        title: "One-Time Donation",
        description: "A one-time gift helps us respond quickly to urgent needs such as food, medical care, and learning materials."
      },
      {
        title: "Monthly Support",
        description: "Regular giving creates stability and helps us plan long-term support for education, health, and daily care."
      },
      {
        title: "Sponsor Essentials",
        description: "You can support essentials such as books, uniforms, hygiene products, and nutritious meals."
      }
    ],
    bankDetails: {
      accountName: "Webbs Memorial Orphanage",
      accountNumber: "123456789012",
      bankName: "Hope Community Bank",
      ifsc: "HCBI0001234"
    }
  },
  gallery: [
    {
      title: "Education",
      description: "Children learning together in a calm and supportive environment.",
      accent: "gold",
      image: "/images/education.jpeg"
    },
    {
      title: "Healthy Meals",
      description: "Fresh and balanced meals prepared to support daily well-being.",
      accent: "terracotta",
      image: "/images/healthy-meals.jpg"
    },
    {
      title: "Safe Home",
      description: "Comfortable living spaces that help children feel secure and at peace.",
      accent: "sage",
      image: "/images/safe-home.jpg"
    },
    {
      title: "Creative Activities",
      description: "Art, music, and play sessions that build confidence and joy.",
      accent: "rose",
      image: "/images/creative-activities.jpeg"
    }
  ],
  contact: {
    phone: "9444388087 / 81489 41518 / 9840230045",
    email: "webbs.simon1307@gmail.com",
    address: "No. 41, Mount Poonamallee High Road, St. Thomas Mount, Chennai - 600016"
  }
};

const mimeTypes = {
  ".html": "text/html; charset=UTF-8",
  ".css": "text/css; charset=UTF-8",
  ".js": "application/javascript; charset=UTF-8",
  ".json": "application/json; charset=UTF-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=UTF-8" });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath) {
  fs.readFile(filePath, (error, content) => {
    if (error) {
      sendJson(res, 500, { message: "Unable to load the requested resource." });
      return;
    }

    const extname = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[extname] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();

      if (body.length > 1e6) {
        reject(new Error("Request body is too large."));
      }
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(new Error("Invalid JSON body."));
      }
    });

    req.on("error", () => {
      reject(new Error("Unable to read request body."));
    });
  });
}

function isValidMessage(payload) {
  return (
    typeof payload.name === "string" &&
    payload.name.trim().length >= 2 &&
    typeof payload.email === "string" &&
    payload.email.includes("@") &&
    typeof payload.message === "string" &&
    payload.message.trim().length >= 10
  );
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const requestUrl = parsedUrl.pathname === "/" ? "/index.html" : parsedUrl.pathname;

  if (req.method === "GET" && requestUrl === "/api/site-data") {
    sendJson(res, 200, siteData);
    return;
  }

  if (req.method === "GET" && requestUrl === "/api/admin/messages") {
    sendJson(res, 200, { messages: contactMessages });
    return;
  }

  if (req.method === "POST" && requestUrl === "/api/contact") {
    try {
      const payload = await readJsonBody(req);

      if (!isValidMessage(payload)) {
        sendJson(res, 400, {
          message: "Please provide a valid name, email address, and message."
        });
        return;
      }

      const entry = {
        id: contactMessages.length + 1,
        name: payload.name.trim(),
        email: payload.email.trim(),
        subject: typeof payload.subject === "string" ? payload.subject.trim() : "",
        message: payload.message.trim(),
        createdAt: new Date().toISOString()
      };

      contactMessages.unshift(entry);
      sendJson(res, 201, {
        message: "Thank you for contacting Webbs Memorial Orphanage. We will reach out soon."
      });
      return;
    } catch (error) {
      sendJson(res, 400, { message: error.message });
      return;
    }
  }

  const safePath = path.normalize(requestUrl).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(publicDir, safePath);

  if (!filePath.startsWith(publicDir)) {
    sendJson(res, 403, { message: "Access denied." });
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      sendJson(res, 404, { message: "Page not found." });
      return;
    }

    serveFile(res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Webbs Memorial Orphanage website is running at http://localhost:${PORT}`);
});
