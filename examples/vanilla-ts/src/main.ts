import "./style.css";

import image from "./images/example.jpg?preset=srcsetPng-srcsetWebp";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <pre>${JSON.stringify(image, null, 2)}</pre>
  <picture>
    ${image.sources.map((s) => `<source srcset="${s.srcset}" type="${s.type}"/>`).join("\n")}
    <img src="${image.fallback.src}" />
  </picture>
`;
