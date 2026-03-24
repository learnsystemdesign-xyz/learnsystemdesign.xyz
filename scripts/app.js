// App module - functions will be implemented in later tasks
// Using ES module exports for testability

export const TOPIC_ORDER = [
  "Fundamentals",
  "Scalability",
  "Load Balancing",
  "Caching",
  "Databases",
  "Message Queues",
  "Distributed Systems Concepts",
  "Real-World System Design Examples"
];

const REQUIRED_FIELDS = ["title", "description", "type", "url", "topic"];

/**
 * Fetches and parses the resource data from JSON.
 * Returns the array of resource objects.
 */
export async function loadResources() {
  try {
    const response = await fetch("data/resources.json");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data.resources;
  } catch (error) {
    const content = document.getElementById("content");
    if (content) {
      content.textContent = "Unable to load resources. Please try refreshing the page.";
    }
    return [];
  }
}

/**
 * Groups resources by their topic field.
 * Skips resources missing required fields.
 * Returns a Map preserving the defined topic order, with unknown topics appended.
 */
export function groupByTopic(resources) {
  const grouped = new Map();

  for (const resource of resources) {
    const missing = REQUIRED_FIELDS.filter((field) => !resource[field]);
    if (missing.length > 0) {
      console.warn(`Skipping resource: missing fields [${missing.join(", ")}]`, resource);
      continue;
    }

    const topic = resource.topic;
    if (!grouped.has(topic)) {
      grouped.set(topic, []);
    }
    grouped.get(topic).push(resource);
  }

  // Build ordered map: TOPIC_ORDER first, then unknown topics
  const ordered = new Map();

  for (const topic of TOPIC_ORDER) {
    if (grouped.has(topic)) {
      ordered.set(topic, grouped.get(topic));
    }
  }

  for (const [topic, resources] of grouped) {
    if (!ordered.has(topic)) {
      ordered.set(topic, resources);
    }
  }

  return ordered;
}

/**
 * Derives a slug from a topic name: lowercase, spaces replaced with hyphens.
 */
function toSlug(name) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

/**
 * Renders all Topic Sections and their Resource Cards into #content.
 */
export function renderSections(grouped) {
  const content = document.getElementById("content");
  if (!content) return;
  content.innerHTML = "";

  for (const [topic, resources] of grouped) {
    const slug = toSlug(topic);

    const section = document.createElement("section");
    section.id = `topic-${slug}`;
    section.className = "topic-section";
    section.setAttribute("aria-labelledby", `heading-${slug}`);

    const h2 = document.createElement("h2");
    h2.id = `heading-${slug}`;
    h2.textContent = topic;
    section.appendChild(h2);

    const grid = document.createElement("div");
    grid.className = "resource-grid";

    for (const resource of resources) {
      const article = document.createElement("article");
      article.className = "resource-card";
      article.setAttribute("data-title", resource.title.toLowerCase());
      article.setAttribute("data-description", resource.description.toLowerCase());

      const badge = document.createElement("span");
      badge.className = "resource-type-badge";
      badge.textContent = resource.type;

      const h3 = document.createElement("h3");
      h3.className = "resource-title";

      const a = document.createElement("a");
      a.href = resource.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.setAttribute("aria-label", `Read '${resource.title}' (opens in new tab)`);
      a.textContent = resource.title;

      h3.appendChild(a);

      const p = document.createElement("p");
      p.className = "resource-description";
      p.textContent = resource.description;

      article.appendChild(badge);
      article.appendChild(h3);
      article.appendChild(p);
      grid.appendChild(article);
    }

    section.appendChild(grid);
    content.appendChild(section);
  }
}

/**
 * Renders navigation links for each topic in the nav bar.
 */
export function renderNavLinks(topics) {
  const navLinks = document.getElementById("nav-links");
  if (!navLinks) return;
  navLinks.innerHTML = "";

  for (const topic of topics) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#topic-${toSlug(topic)}`;
    a.textContent = topic;
    li.appendChild(a);
    navLinks.appendChild(li);
  }
}

/**
 * Filters visible Resource Cards based on the search query string.
 * Matches against resource title and description (case-insensitive).
 * Shows a "no results" message when nothing matches.
 * Hides topic sections that have no visible cards.
 */
export function filterResources(query) {
  const content = document.getElementById("content");
  if (!content) return;

  // Remove any existing "no results" message
  const existing = content.querySelector(".no-results");
  if (existing) existing.remove();

  const cards = content.querySelectorAll(".resource-card");
  const trimmed = query.trim().toLowerCase();

  // Empty/whitespace query — show everything
  if (trimmed === "") {
    cards.forEach((card) => { card.style.display = ""; });
    content.querySelectorAll(".topic-section").forEach((section) => {
      section.style.display = "";
    });
    return;
  }

  // Filter cards by title/description match
  let matchCount = 0;
  cards.forEach((card) => {
    const title = card.getAttribute("data-title") || "";
    const description = card.getAttribute("data-description") || "";
    if (title.includes(trimmed) || description.includes(trimmed)) {
      card.style.display = "";
      matchCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Hide topic sections with no visible cards
  content.querySelectorAll(".topic-section").forEach((section) => {
    const visibleCards = section.querySelectorAll('.resource-card:not([style*="display: none"])');
    section.style.display = visibleCards.length > 0 ? "" : "none";
  });

  // Show "no results" message if nothing matched
  if (matchCount === 0) {
    const msg = document.createElement("p");
    msg.className = "no-results";
    msg.textContent = "No resources found matching your search.";
    content.appendChild(msg);
  }
}

/**
 * Smooth-scrolls to the element matching the given section ID,
 * accounting for the fixed nav bar height offset.
 */
export function scrollToSection(sectionId) {
  const target = document.getElementById(sectionId);
  if (!target) return;

  const navHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--nav-height")) *
    parseFloat(getComputedStyle(document.documentElement).fontSize);

  window.scrollTo({
    top: target.offsetTop - navHeight,
    behavior: "smooth"
  });
}

// --- Initialization ---
// Guard: only run in browser environments (skip in test/Node.js)
if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", async () => {
    const resources = await loadResources();
    const grouped = groupByTopic(resources);
    renderSections(grouped);
    renderNavLinks(Array.from(grouped.keys()));

    // Wire filter input
    const filterInput = document.getElementById("filter-input");
    if (filterInput) {
      filterInput.addEventListener("input", (e) => {
        filterResources(e.target.value);
      });
    }

    // Wire nav link click handlers for smooth scrolling
    const navLinks = document.getElementById("nav-links");
    if (navLinks) {
      navLinks.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link && link.hash) {
          e.preventDefault();
          // Close mobile menu on nav click
          navLinks.classList.remove("open");
          const toggle = document.getElementById("menu-toggle");
          if (toggle) toggle.setAttribute("aria-expanded", "false");
          scrollToSection(link.hash.slice(1));
        }
      });
    }

    // Wire hamburger menu toggle
    const menuToggle = document.getElementById("menu-toggle");
    if (menuToggle && navLinks) {
      menuToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }
  });
}
