console.log("APP JS LOADED");

window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  const form = document.getElementById("loginForm");

  if (!form) {
    console.error("Form not found");
    return;
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Form works — JS is stable");
  });
});