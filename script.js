document.addEventListener("DOMContentLoaded", () => {
  const solutionBtn = document.getElementById("solution-btn");
  const resetBtn = document.getElementById("reset-btn");
  const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
  const themeBtn = document.getElementById("theme-btn");
  const downloadBtn = document.getElementById("download-btn");
  const colorBtn = document.getElementById("color-btn");

  const solutionPath = document.getElementById("solution-path");
  const player = document.getElementById("player"); 
  const playerTrail = document.getElementById("player-trail"); // NOVO: element za pot
  const spinner = document.getElementById("spinner");
  const mazeSVG = document.getElementById("maze");
  const instructionsModal = document.getElementById("instructions-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");

  // Zberemo vse črte labirinta (za preverjanje trka)
  const lines = document.querySelectorAll('.maze-paths line');

  // Timer
  const timerDisplay = document.getElementById("timer-display");
  let timerInterval;
  let startTime = 0;
  let isTimerRunning = false;

  let isSolutionVisible = false;
  let isDarkTheme = false;
  let pathLength = 0;
  const circleRadius = parseFloat(player.getAttribute("r")) || 8;

  if (solutionPath) {
    pathLength = solutionPath.getTotalLength();
    solutionPath.style.strokeDasharray = pathLength;
    solutionPath.style.strokeDashoffset = pathLength;
  }

  // ========== Timer ==========
  const startTimer = () => {
    if (isTimerRunning) return;
    isTimerRunning = true;
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      timerDisplay.textContent = `Time: ${elapsed}s`;
    }, 1000);
  };
  const stopTimer = () => {
    clearInterval(timerInterval);
    isTimerRunning = false;
  };
  const resetTimerDisplay = () => {
    timerDisplay.textContent = "Time: 0s";
  };

  // ========== Toggle Solution ==========
  const toggleSolution = () => {
    if (!solutionPath) return;
    solutionBtn.disabled = true;
    if (!isSolutionVisible) {
      solutionPath.style.strokeDashoffset = "0";
      solutionBtn.innerHTML = '<i class="fas fa-pause-circle"></i> Hide Solution';
      stopTimer();
    } else {
      solutionPath.style.strokeDashoffset = pathLength;
      solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';
    }
    isSolutionVisible = !isSolutionVisible;
    setTimeout(() => (solutionBtn.disabled = false), 2000);
  };

  // ========== Reset Maze ==========
  const resetMaze = () => {
    if (solutionPath) {
      solutionPath.style.strokeDashoffset = pathLength;
    }
    isSolutionVisible = false;
    solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';
  
    stopTimer();
    resetTimerDisplay();
  
    // Resetiramo položaj igralca na začetno točko (npr. 2,2)
    // Prav tako počistimo pot, ki jo je igralec prehodil.
    player.setAttribute("cx", 2);
    player.setAttribute("cy", 2);
    playerTrail.setAttribute("points", "2,2");
  };

  // ========== Theme Toggle ==========
  const toggleTheme = () => {
    document.body.classList.toggle("dark-theme");
    isDarkTheme = !isDarkTheme;
    themeBtn.innerHTML = isDarkTheme
      ? '<i class="fas fa-sun"></i> Light Theme'
      : '<i class="fas fa-moon"></i> Dark Theme';
  };

  // ========== Download Maze ==========
  const downloadMaze = () => {
    spinner.classList.remove("hidden");
    downloadBtn.disabled = true;
  
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(mazeSVG);
  
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;
  
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
  
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "spotify_labyrinth.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  
    setTimeout(() => {
      spinner.classList.add("hidden");
      downloadBtn.disabled = false;
    }, 1000);
  };

  // ========== Random Solution Color ==========
  const randomColor = () => {
    if (!solutionPath) return;
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    solutionPath.style.stroke = color;
  };

  // ========== LINE-CIRCLE COLLISION HELPER ==========
  function lineCircleCollides(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLenSq = dx * dx + dy * dy;
  
    if (lineLenSq === 0) {
      const dist = Math.hypot(cx - x1, cy - y1);
      return dist <= r;
    }
  
    const t = ((cx - x1) * dx + (cy - y1) * dy) / lineLenSq;
    let closestX, closestY;
    if (t < 0) {
      closestX = x1;
      closestY = y1;
    } else if (t > 1) {
      closestX = x2;
      closestY = y2;
    } else {
      closestX = x1 + t * dx;
      closestY = y1 + t * dy;
    }
  
    const distX = closestX - cx;
    const distY = closestY - cy;
    const distSq = distX * distX + distY * distY;
  
    return distSq <= r * r;
  }
  
  // ========== SMOOTH PLAYER MOVEMENT IN ZOGICA ==========
  const moveSpeed = 3;  // osnovna hitrost premikanja (ciljna sprememba)
  const boundary = 482;
  
  // Funkcija za preverjanje, ali je nova pozicija varna
  function canMoveTo(newCx, newCy) {
    if (newCx < 0) newCx = 0;
    if (newCy < 0) newCy = 0;
    if (newCx > boundary) newCx = boundary;
    if (newCy > boundary) newCy = boundary;
  
    for (const line of lines) {
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));
  
      const collides = lineCircleCollides(x1, y1, x2, y2, newCx, newCy, circleRadius);
      if (collides) {
        return { blocked: true, cx: 0, cy: 0 };
      }
    }
    return { blocked: false, cx: newCx, cy: newCy };
  }
  
  // Funkcija za risanje poti igralca – dodamo novo točko
  function updateTrail(x, y) {
    let points = playerTrail.getAttribute("points");
    points = points ? points + ` ${x},${y}` : `${x},${y}`;
    playerTrail.setAttribute("points", points);
  }
  
  // Funkcija za gladko animacijo premika igralca
  function animateMove(startX, startY, targetX, targetY, duration = 150) {
    const startTime = performance.now();
  
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const t = Math.min(elapsed / duration, 1); // 0 ... 1 (interpolacija)
  
      // Linearna interpolacija (lahko uporabite tudi bolj kompleksne funkcije za lažje gibanje)
      const currentX = startX + (targetX - startX) * t;
      const currentY = startY + (targetY - startY) * t;
  
      player.setAttribute("cx", currentX);
      player.setAttribute("cy", currentY);
  
      // Dodamo točko v pot
      updateTrail(currentX, currentY);
  
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        // Preverimo, če smo dosegli ciljno območje
        checkWin(targetX, targetY);
      }
    }
    requestAnimationFrame(animate);
  }
  
  // Funkcija za preverjanje, če smo dosegli konec (približno 470,470)
  function checkWin(cx, cy) {
    if (cx >= 470 && cy >= 470) {
      stopTimer();
      alert("You Win! Congrats on reaching the bottom-right corner!");
    }
  }
  
  // Ključni dogodek: premikanje z tipkami W, A, S, D
  document.addEventListener("keydown", (e) => {
    let cx = parseFloat(player.getAttribute("cx"));
    let cy = parseFloat(player.getAttribute("cy"));
  
    let newCx = cx;
    let newCy = cy;
  
    switch (e.key.toLowerCase()) {
      case "w": newCy -= moveSpeed; break;
      case "s": newCy += moveSpeed; break;
      case "a": newCx -= moveSpeed; break;
      case "d": newCx += moveSpeed; break;
      default: return; // samo WASD
    }
  
    // Zaženemo timer, če še ne teče
    if (!isTimerRunning) {
      startTimer();
      // Prav tako inicializiramo začetno točko poti, če še ni nastavljena
      if (!playerTrail.getAttribute("points")) {
        playerTrail.setAttribute("points", `${cx},${cy}`);
      }
    }
  
    // Preverimo, če je premik dovoljen
    const result = canMoveTo(newCx, newCy);
    if (!result.blocked) {
      // Za gladek premik uporabimo animacijo
      animateMove(cx, cy, result.cx, result.cy);
    }
  });
  
  // ========== Modal + Button Listeners ==========
  toggleInstructionsBtn.addEventListener("click", () => {
    instructionsModal.classList.add("show");
    instructionsModal.classList.remove("hidden");
  });
  closeModalBtn.addEventListener("click", () => {
    instructionsModal.classList.remove("show");
    setTimeout(() => instructionsModal.classList.add("hidden"), 400);
  });
  
  solutionBtn.addEventListener("click", toggleSolution);
  resetBtn.addEventListener("click", resetMaze);
  themeBtn.addEventListener("click", toggleTheme);
  downloadBtn.addEventListener("click", downloadMaze);
  colorBtn.addEventListener("click", randomColor);
});
