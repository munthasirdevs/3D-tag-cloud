// ------------------------------
// 3D SPHERE (Same as before)
// jQuery handles mouse events
// ------------------------------

const canvas = document.getElementById("sphereCanvas");
const ctx = canvas.getContext("2d");
const $box = $("#box");
const $tooltip = $("#tooltip");

let w = canvas.width,
    h = canvas.height;
let cx = w / 2,
    cy = h / 2;
let radius = 190;

// Text items (same set)
const ITEMS = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node",
    "Vite",
    "Tailwind",
    "Docker",
    "Git",
    "Figma",
    "MYSQL",
    "NoSQL",
    "Python",
    "TensorFlow",
    "AWS",
    "Firebase",
    "Vercel",
    "Linux",
    "TypeScript",
    "GraphQL",
];
// sphere points
let points = [];

// ------------------------------
// Generate Fibonacci Sphere
// ------------------------------
function makeSphere() {
    let n = ITEMS.length;
    let golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < n; i++) {
        let y = 1 - (i / (n - 1)) * 2;
        let r = Math.sqrt(1 - y * y);
        let phi = i * golden;

        points.push({
            label: ITEMS[i],
            x: Math.cos(phi) * r,
            y: y,
            z: Math.sin(phi) * r,
        });
    }
}
makeSphere();

// ------------------------------
// Projection function
// ------------------------------
function project(p) {
    let fov = radius * 1.8;
    let scale = fov / (fov + p.z * radius);

    return {
        x: cx + p.x * radius * scale,
        y: cy + p.y * radius * scale,
        scale,
    };
}

// ------------------------------
// Rotation
// ------------------------------
let rotX = 0.0025;
let rotY = -0.0025;

// On mouse move rotation multiplier
let mouseRX = 0;
let mouseRY = 0;

function rotateSphere() {
    let sinX = Math.sin(rotX + mouseRX);
    let cosX = Math.cos(rotX + mouseRX);

    let sinY = Math.sin(rotY + mouseRY);
    let cosY = Math.cos(rotY + mouseRY);

    points.forEach((p) => {
        // rotate X
        let y = p.y * cosX - p.z * sinX;
        let z = p.y * sinX + p.z * cosX;
        p.y = y;
        p.z = z;

        // rotate Y
        let x = p.x * cosY + p.z * sinY;
        z = -p.x * sinY + p.z * cosY;
        p.x = x;
        p.z = z;
    });
}

// ------------------------------
// Draw Sphere
// ------------------------------
function drawSphere() {
    ctx.clearRect(0, 0, w, h);

    let sorted = [...points].sort((a, b) => a.z - b.z);

    sorted.forEach((p) => {
        let s = project(p);

        ctx.globalAlpha = 0.7 + (p.z + 1) * 0.25;
        ctx.fillStyle = "white";
        ctx.font = `${14 + s.scale * 20}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText(p.label, s.x, s.y);
    });
}

// ------------------------------
// LOOP
// ------------------------------
function animate() {
    rotateSphere();
    drawSphere();
    requestAnimationFrame(animate);
}
animate();

// ------------------------------
// jQuery MOUSE INTERACTION
// ------------------------------

$box.on("mousemove", function (e) {
    let rect = this.getBoundingClientRect();
    let x = e.clientX - rect.left - rect.width / 2;
    let y = e.clientY - rect.top - rect.height / 2;

    mouseRX = y * 0.00005; // tilt up/down
    mouseRY = x * 0.00005; // spin left/right

    // Check hover item
    let best = null;
    let bestDist = 999;

    points.forEach((p) => {
        let s = project(p);
        let dx = e.clientX - rect.left - s.x;
        let dy = e.clientY - rect.top - s.y;
        let d = Math.sqrt(dx * dx + dy * dy);

        if (d < bestDist && d < 25) {
            best = { text: p.label, x: s.x, y: s.y };
            bestDist = d;
        }
    });

    if (best) {
        $tooltip
            .css({
                left: best.x,
                top: best.y - 20,
                opacity: 1,
            })
            .text(best.text);
    } else {
        $tooltip.css({ opacity: 0 });
    }
});

$box.on("mouseenter", function () {
    rotX = 0.001; // slow down
    rotY = -0.001;
});

$box.on("mouseleave", function () {
    mouseRX = 0;
    mouseRY = 0;

    rotX = 0.0025; // return to normal
    rotY = -0.0025;

    $tooltip.css({ opacity: 0 });
});
