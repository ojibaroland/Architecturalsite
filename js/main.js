// Header scroll state
const header = document.querySelector(".site-header");
const onScroll = () => {
  header.classList.toggle("scrolled", window.scrollY > 24);
};
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile navigation
const toggle = document.querySelector(".nav-toggle");
const links = document.querySelector(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  });
  links.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      document.body.style.overflow = "";
    })
  );
}

// Scroll reveal
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Contact form (no backend — opens a pre-filled email)
const form = document.querySelector("#contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent(
      `Inquiry — ${data.get("service") || "General"} (${data.get("name")})`
    );
    const body = encodeURIComponent(
      `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nLocation: ${
        data.get("location") || "—"
      }\nService: ${data.get("service") || "—"}\n\n${data.get("message")}`
    );
    window.location.href = `mailto:inquiries@olavarchitectural.com?subject=${subject}&body=${body}`;
  });
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});
