"use strict";

const headerIcon = document.querySelector(".header-icon");
const toggleIcon = document.createElement("div");
toggleIcon.setAttribute("id", "back-arrow");

const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgEl.classList.add("chevron-right-icon");
const useEl = document.createElementNS("http://www.w3.org/2000/svg", "use");
useEl.setAttribute("href", "./assets/icons.svg#chevron-right-icon");
svgEl.appendChild(useEl);

toggleIcon.appendChild(svgEl);
headerIcon.prepend(toggleIcon);

toggleIcon.addEventListener("click", function () {
	window.location.href = "./popup.html";
});
