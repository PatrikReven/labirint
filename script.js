document.addEventListener("DOMContentLoaded", () => {
  // Definiramo začetne pozicije
  const INITIAL_CX = 234;
  const INITIAL_CY = 10;

  const solutionBtn = document.getElementById("solution-btn");
  const resetBtn = document.getElementById("reset-btn");
  const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
  const themeBtn = document.getElementById("theme-btn");
  const downloadBtn = document.getElementById("download-btn");
  const colorBtn = document.getElementById("color-btn");

  const solutionPath = document.getElementById("solution-path");
  const player = document.getElementById("player"); 
  const playerTrail = document.getElementById("player-trail");
  const spinner = document.getElementById("spinner");
  const mazeSVG = document.getElementById("maze");
  const instructionsModal = document.getElementById("instructions-modal");
  const closeModalBtn = document.getElementById("close-modal-btn");
  const winModal = document.getElementById("win-modal");
  const closeWinModalBtn = document.getElementById("close-win-modal-btn");

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
  const circleRadius = parseFloat(player.getAttribute("r")) || 5;

  if (solutionPath) {
    pathLength = solutionPath.getTotalLength();
    solutionPath.style.strokeDasharray = pathLength;
    solutionPath.style.strokeDashoffset = pathLength;
  }

  // ========== Timer ==========
  const startTimer = () => {
    if (isTimerRunning) return;
    isTimerRunning = true;
    startTime = performance.now();
    timerInterval = requestAnimationFrame(updateTimer);
    console.log("Timer started");
  };

  const updateTimer = () => {
    if (!isTimerRunning) return;
    const elapsed = Math.floor((performance.now() - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsed}s`;
    timerInterval = requestAnimationFrame(updateTimer);
  };

  const stopTimer = () => {
    isTimerRunning = false;
    cancelAnimationFrame(timerInterval);
    console.log("Timer stopped");
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
      console.log("Solution shown");
    } else {
      solutionPath.style.strokeDashoffset = pathLength;
      solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';
      console.log("Solution hidden");
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

    // Resetiramo položaj igralca na začetno točko
    player.setAttribute("cx", INITIAL_CX);
    player.setAttribute("cy", INITIAL_CY);

    // Resetiramo pot, ki jo je igralec prehodil
    playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);

    // Resetiramo stanje tipk
    keysPressed = {};

    // Prikažejo se kratko sporočilo
    const resetMessage = document.createElement("div");
    resetMessage.textContent = "Game has been reset!";
    resetMessage.classList.add("reset-message");
    document.body.appendChild(resetMessage);

    setTimeout(() => {
      resetMessage.classList.add("fade-out");
      setTimeout(() => resetMessage.remove(), 1000);
    }, 2000);

    console.log("Maze reset");
  };

  // ========== Theme Toggle ==========
  const toggleTheme = () => {
    document.body.classList.toggle("dark-theme");
    isDarkTheme = !isDarkTheme;
    themeBtn.innerHTML = isDarkTheme
      ? '<i class="fas fa-sun"></i> Light Theme'
      : '<i class="fas fa-moon"></i> Dark Theme';
    console.log(`Theme changed to ${isDarkTheme ? "Dark" : "Light"}`);
  };

  // ========== Download Maze ==========
  const downloadMaze = () => {
    spinner.classList.remove("hidden");
    downloadBtn.disabled = true;
    console.log("Maze download started");

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
      console.log("Maze download completed");
    }, 1000);
  };

  // ========== Random Solution Color ==========
  const randomColor = () => {
    if (!solutionPath) return;
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    solutionPath.style.stroke = color;
    console.log(`Solution path color changed to ${color}`);
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

  // ========== Kontinuirano Premikanje Igralca ==========
  const keysPressed = {};
  const moveSpeedContinuous = 6; // Povečana hitrost za kontinuirano premikanje
  const boundary = 482;
  const MAX_TRAIL_POINTS = 500; // Maksimalno število točk v sledi

  // Funkcija za preverjanje, ali je nova pozicija varna
  function canMoveTo(newCx, newCy) {
    // Preverimo meje SVG
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
        console.log(`Collision detected at (${newCx}, ${newCy}) with line (${x1}, ${y1})-(${x2}, ${y2})`);
        return { blocked: true, cx: player.getAttribute("cx"), cy: player.getAttribute("cy") };
      }
    }

    // Preverjanje, če je igralec dosegel končno točko
    const endX = 180; // x koordinata iPhone-ja
    const endY = 470; // y koordinata iPhone-ja
    const distance = Math.hypot(newCx - endX, newCy - endY);
    const winRadius = circleRadius + 20; // Tolerance

    if (distance <= winRadius) {
      console.log("Win condition met");
      return { blocked: false, cx: newCx, cy: newCy, win: true };
    }

    return { blocked: false, cx: newCx, cy: newCy, win: false };
  }

  // Funkcija za risanje poti igralca – dodamo novo točko
  function updateTrail(x, y) {
    let points = playerTrail.getAttribute("points").split(" ");
    points.push(`${x},${y}`);
    if (points.length > MAX_TRAIL_POINTS) {
      points.shift(); // Odstrani najstarejšo točko
    }
    playerTrail.setAttribute("points", points.join(" "));
    // console.log(`Trail updated: (${x}, ${y})`);
  }

  // Funkcija za preverjanje, če smo dosegli konec (približno 180, 470)
  function checkWin(cx, cy) {
    const endX = 180; // x koordinata iPhone-ja
    const endY = 470; // y koordinata iPhone-ja
    const distance = Math.hypot(cx - endX, cy - endY);
    const winRadius = circleRadius + 20; // Tolerance

    if (distance <= winRadius) {
      stopTimer();
      showWinModal();
      console.log("Win modal shown");
    }
  }

  // Funkcija za prikaz win modala
  function showWinModal() {
    winModal.classList.add("show");
    winModal.classList.remove("hidden");
  }

  // Funkcija za posodabljanje položaja igralca
  function updatePlayerPosition() {
    let cx = parseFloat(player.getAttribute("cx"));
    let cy = parseFloat(player.getAttribute("cy"));
    let moved = false;

    if (keysPressed["w"]) {
      cy -= moveSpeedContinuous;
      moved = true;
    }
    if (keysPressed["s"]) {
      cy += moveSpeedContinuous;
      moved = true;
    }
    if (keysPressed["a"]) {
      cx -= moveSpeedContinuous;
      moved = true;
    }
    if (keysPressed["d"]) {
      cx += moveSpeedContinuous;
      moved = true;
    }

    if (moved) {
      // Preverimo, ali je nova pozicija varna
      const result = canMoveTo(cx, cy);
      if (!result.blocked) {
        // Posodobimo položaj
        player.setAttribute("cx", result.cx);
        player.setAttribute("cy", result.cy);
        updateTrail(result.cx, result.cy);

        if (result.win) {
          checkWin(result.cx, result.cy);
        }
      }
    }

    requestAnimationFrame(updatePlayerPosition);
  }

  // Zaženemo animacijsko zanko
  requestAnimationFrame(updatePlayerPosition);

  // ========== Event Listeners za Tipke ==========
  function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      keysPressed[key] = true;
      console.log(`Key pressed: ${key}`);
      if (!isTimerRunning) {
        startTimer();
        // Inicializiramo pot, če še ni nastavljena
        if (!playerTrail.getAttribute("points")) {
          playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);
        }
      }
    }
  }

  function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (keysPressed[key]) {
      delete keysPressed[key];
      console.log(`Key released: ${key}`);
    }
  }

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // ========== Modal + Button Listeners ==========
  toggleInstructionsBtn.addEventListener("click", () => {
    instructionsModal.classList.add("show");
    instructionsModal.classList.remove("hidden");
    console.log("Instructions modal shown");
  });

  closeModalBtn.addEventListener("click", () => {
    instructionsModal.classList.remove("show");
    setTimeout(() => instructionsModal.classList.add("hidden"), 400);
    console.log("Instructions modal closed");
  });

  solutionBtn.addEventListener("click", toggleSolution);
  resetBtn.addEventListener("click", resetMaze);
  themeBtn.addEventListener("click", toggleTheme);
  downloadBtn.addEventListener("click", downloadMaze);
  colorBtn.addEventListener("click", randomColor);

  // Dodate Event Listener za Zaprtje Win Modala
  closeWinModalBtn.addEventListener("click", () => {
    winModal.classList.remove("show");
    setTimeout(() => winModal.classList.add("hidden"), 400);
    console.log("Win modal closed");
  });

  // Nastavi začetno pozicijo igralca ob nalaganju strani
  player.setAttribute("cx", INITIAL_CX);
  player.setAttribute("cy", INITIAL_CY);
  playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);
  console.log(`Player initialized at (${INITIAL_CX}, ${INITIAL_CY})`);
});
