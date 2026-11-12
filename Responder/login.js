
// Get HTML elements
const container = document.querySelector(".container");
const screens = document.querySelectorAll(".screen");

const widthSlider = document.getElementById("frameWidth");
const heightSlider = document.getElementById("frameHeight");
const gapSlider = document.getElementById("frameGap");

const widthValue = document.getElementById("widthValue");
const heightValue = document.getElementById("heightValue");
const gapValue = document.getElementById("gapValue");

const resetButton = document.getElementById("resetFrames");

// Change frame width
widthSlider.addEventListener("input", function () {
    const width = this.value;

    screens.forEach(screen => {
        screen.style.width = width + "px";
    });

    widthValue.textContent = width + "px";
});

// Change frame height
heightSlider.addEventListener("input", function () {
    const height = this.value;

    screens.forEach(screen => {
        screen.style.height = height + "px";
    });

    heightValue.textContent = height + "px";
});

// Change spacing between frames
gapSlider.addEventListener("input", function () {
    const gap = this.value;

    container.style.gap = gap + "px";

    gapValue.textContent = gap + "px";
});

// Reset all frames
resetButton.addEventListener("click", function () {

    screens.forEach(screen => {
        screen.style.width = "100%";
        screen.style.height = "500px";
    });

    container.style.gap = "15px";

    widthSlider.value = 100;
    heightSlider.value = 500;
    gapSlider.value = 15;

    widthValue.textContent = "100%";
    heightValue.textContent = "500px";
    gapValue.textContent = "15px";
});

console.log("Frame customization loaded!");
