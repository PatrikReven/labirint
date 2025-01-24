
document.addEventListener("DOMContentLoaded", () => {

  /*************************************************
   * 1) INICIALIZACIJA SPREMENLJIVK
   *************************************************/
  const INITIAL_CX = 234;
  const INITIAL_CY = 10;

  const solutionBtn           = document.getElementById("solution-btn");
  const resetBtn              = document.getElementById("reset-btn");
  const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
  const themeBtn              = document.getElementById("theme-btn");
  const downloadBtn           = document.getElementById("download-btn");
  const colorBtn              = document.getElementById("color-btn");

  const solutionPath          = document.getElementById("solution-path");
  const player                = document.getElementById("player");
  const playerTrail           = document.getElementById("player-trail");
  const spinner               = document.getElementById("spinner");
  const mazeSVG               = document.getElementById("maze");
  const instructionsModal     = document.getElementById("instructions-modal");
  const closeModalBtn         = document.getElementById("close-modal-btn");
  const winModal              = document.getElementById("win-modal");
  const closeWinModalBtn      = document.getElementById("close-win-modal-btn");
  const mobileControls        = document.querySelector(".mobile-controls");
  const moveUpBtn             = document.getElementById("move-up");
  const moveDownBtn           = document.getElementById("move-down");
  const moveLeftBtn           = document.getElementById("move-left");
  const moveRightBtn          = document.getElementById("move-right");

  const lines                 = document.querySelectorAll(".maze-paths line");
  const timerDisplay          = document.getElementById("timer-display");

  let timerInterval;
  let startTime        = 0;
  let isTimerRunning   = false;
  let isSolutionVisible = false;
  let isDarkTheme       = false;
  let pathLength        = 0;

  // Polmer kroga (igralca)
  const circleRadius = parseFloat(player.getAttribute("r")) || 5;

  // Če obstaja 'solutionPath', nastavimo črto za animacijo
  if (solutionPath) {
    pathLength = solutionPath.getTotalLength();
    solutionPath.style.strokeDasharray  = pathLength;
    solutionPath.style.strokeDashoffset = pathLength;
  }

  /*************************************************
   * 2) FUNKCIJA ZA POSTAVITEV iPHONA NA KONEC REŠITVE
   *************************************************/
  function moveIphoneToSolution() {
    if (!solutionPath) return;
    const solutionPoints = solutionPath.getAttribute("points");
    if (!solutionPoints) return;

    // Zadnja točka rešitve
    const lastPoint = solutionPoints.trim().split(" ").pop();
    const [x, y] = lastPoint.split(",").map(Number);

    // Pridobimo <image> in njene dimenzije
    const iphone = document.querySelector("image");
    const phoneWidth  = parseInt(iphone.getAttribute("width"), 10);
    const phoneHeight = parseInt(iphone.getAttribute("height"), 10);

    // Postavimo iPhone tako, da bo sredina slike na zadnji točki
    iphone.setAttribute("x", x - phoneWidth / 2);
    iphone.setAttribute("y", y - phoneHeight / 2);

    console.log(`iPhone moved to (${x}, ${y})`);
  }

  /*************************************************
   * 3) TIMER FUNKCIJE (ZA IZPIS ČASA)
   *************************************************/
  const startTimer = () => {
    if (isTimerRunning) return;
    isTimerRunning = true;
    startTime = performance.now();
    timerInterval = requestAnimationFrame(updateTimer);
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
  };

  const resetTimerDisplay = () => {
    timerDisplay.textContent = "Time: 0s";
  };

  /*************************************************
   * 4) FUNKCIJA ZA PRIKAZ/SKRIVANJE REŠITVE
   *************************************************/
  const toggleSolution = () => {
    if (!solutionPath) return;
    solutionBtn.disabled = true;

    if (!isSolutionVisible) {
      // Pokažemo pot
      solutionPath.style.strokeDashoffset = "0";
      solutionBtn.innerHTML = '<i class="fas fa-pause-circle"></i> Hide Solution';
      stopTimer();
    } else {
      // Skrijemo pot
      solutionPath.style.strokeDashoffset = pathLength;
      solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';
    }

    isSolutionVisible = !isSolutionVisible;
    setTimeout(() => (solutionBtn.disabled = false), 2000);
  };

  /*************************************************
   * 5) RESET IRGE
   *************************************************/
  const resetMaze = () => {
    if (solutionPath) {
      // Ponovno skrijemo pot
      solutionPath.style.strokeDashoffset = pathLength;
    }
    isSolutionVisible = false;
    solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';

    stopTimer();
    resetTimerDisplay();

    player.setAttribute("cx", INITIAL_CX);
    player.setAttribute("cy", INITIAL_CY);
    playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);
    keysPressed = {};

    const resetMessage = document.createElement("div");
    resetMessage.textContent = "Game has been reset!";
    resetMessage.classList.add("reset-message");
    document.body.appendChild(resetMessage);

    setTimeout(() => {
      resetMessage.classList.add("fade-out");
      setTimeout(() => resetMessage.remove(), 1000);
    }, 2000);
  };

  /*************************************************
   * 6) PREKLOP TEME (DARK/LIGHT)
   *************************************************/
  const toggleTheme = () => {
    document.body.classList.toggle("dark-theme");
    isDarkTheme = !isDarkTheme;
    themeBtn.innerHTML = isDarkTheme
      ? '<i class="fas fa-sun"></i> Light Theme'
      : '<i class="fas fa-moon"></i> Dark Theme';
  };

  /*************************************************
   * 7) SHRANJEVANJE SVG (DOWNLOAD)
   *************************************************/
  const downloadMaze = () => {
    spinner.classList.remove("hidden");
    downloadBtn.disabled = true;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(mazeSVG);

    // Dodamo manjkajoče namespace, če slučajno niso
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

  /*************************************************
   * 8) NAKLJUČNA BARVA REŠITVE
   *************************************************/
  const randomColor = () => {
    if (!solutionPath) return;
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    solutionPath.style.stroke = color;
  };

  /*************************************************
   * 9) DETEKCIJA TRKOV - ALI JE MIŠKA NALATELA NA STENO
   *************************************************/
  function lineCircleCollides(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLenSq = dx * dx + dy * dy;

    // Če je dolžina 0, gre za točko
    if (lineLenSq === 0) {
      return Math.hypot(cx - x1, cy - y1) <= r;
    }

    // Projekcija točke na premico
    const t = ((cx - x1) * dx + (cy - y1) * dy) / lineLenSq;
    const closestX = (t < 0) ? x1 : (t > 1) ? x2 : (x1 + t * dx);
    const closestY = (t < 0) ? y1 : (t > 1) ? y2 : (y1 + t * dy);

    // Če je razdalja od najbližje točke do sredine kroga <= r, je trk
    return Math.hypot(closestX - cx, closestY - cy) <= r;
  }

  /*************************************************
   * 10) FUNKCIJE ZA PREMIKANJE IGRALCA
   *************************************************/
  const keysPressed = {};
  const moveSpeedContinuous = 2;
  const boundary = 482;
  const MAX_TRAIL_POINTS = 500;

  function canMoveTo(newCx, newCy) {
    // Ostanemo znotraj "okna" labirinta
    newCx = Math.max(0, Math.min(boundary, newCx));
    newCy = Math.max(0, Math.min(boundary, newCy));

    // Preverimo, ali se dotaknemo kake stene (line)
    for (const line of lines) {
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));

      if (lineCircleCollides(x1, y1, x2, y2, newCx, newCy, circleRadius)) {
        // Če se zaletimo, vrnemo "blocked = true"
        return {
          blocked: true,
          cx: player.getAttribute("cx"),
          cy: player.getAttribute("cy")
        };
      }
    }

    // Preverimo, ali smo se dotaknili iPhona, a z marginom
    const iphone = document.querySelector("image");
    const bbox   = iphone.getBBox();

    // Recimo, da hočemo bounding box 20 pikslov manjši z vseh strani:
    const margin = 20;
    if (
      newCx >= bbox.x + margin &&
      newCx <= bbox.x + bbox.width  - margin &&
      newCy >= bbox.y + margin &&
      newCy <= bbox.y + bbox.height - margin
    ) {
      return { blocked: false, cx: newCx, cy: newCy, win: true };
    }

    // Če ni bila nobena ovira ali dotik iPhona, lahko se normalno premaknemo
    return { blocked: false, cx: newCx, cy: newCy, win: false };
  } // <-- MANJKAJOČI ZAKLJUČNI OKLEPAJ TU

  /*************************************************
   * 11) FUNKCIJA ZA SLED (PLAYER TRAIL)
   *************************************************/
  function updateTrail(x, y) {
    let points = playerTrail.getAttribute("points").split(" ");
    points.push(`${x},${y}`);
    if (points.length > MAX_TRAIL_POINTS) {
      points.shift();
    }
    playerTrail.setAttribute("points", points.join(" "));
  }

  // Glavna zanka, ki premika igralca glede na pritisnjene tipke (w, a, s, d)
  function updatePlayerPosition() {
    let cx = parseFloat(player.getAttribute("cx"));
    let cy = parseFloat(player.getAttribute("cy"));
    let moved = false;

    if (keysPressed["w"]) { cy -= moveSpeedContinuous; moved = true; }
    if (keysPressed["s"]) { cy += moveSpeedContinuous; moved = true; }
    if (keysPressed["a"]) { cx -= moveSpeedContinuous; moved = true; }
    if (keysPressed["d"]) { cx += moveSpeedContinuous; moved = true; }

    if (moved) {
      const result = canMoveTo(cx, cy);
      if (!result.blocked) {
        player.setAttribute("cx", result.cx);
        player.setAttribute("cy", result.cy);
        updateTrail(result.cx, result.cy);
        checkWin(result.cx, result.cy);
      }
    }
    requestAnimationFrame(updatePlayerPosition);
  }
  requestAnimationFrame(updatePlayerPosition);

  /*************************************************
   * 12) TIPKE (WASD) -> PRITISK/IZPUST
   *************************************************/
  function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d"].includes(key)) {
      keysPressed[key] = true;
      if (!isTimerRunning) startTimer();
    }
  }
  function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (keysPressed[key]) {
      delete keysPressed[key];
    }
  }

  /*************************************************
   * 13) PREVERIMO ZMAGO
   *************************************************/
  function checkWin(cx, cy) {
    const iphone = document.querySelector("image");
    const bbox   = iphone.getBBox();

    if (
      cx >= bbox.x && cx <= bbox.x + bbox.width &&
      cy >= bbox.y && cy <= bbox.y + bbox.height
    ) {
      stopTimer();
      showWinModal();
      console.log("Player reached the iPhone!");
    }
  }

  function showWinModal() {
    winModal.classList.add("show");
    winModal.classList.remove("hidden");
  }

  /*************************************************
   * 14) DOGODKI (NA GUMBI, TIPKE ...)
   *************************************************/
  closeWinModalBtn.addEventListener("click", () => {
    winModal.classList.remove("show");
    setTimeout(() => winModal.classList.add("hidden"), 400);
    console.log("Win modal closed");
  });

  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup",   handleKeyUp);

  moveUpBtn.addEventListener("click", () => {
    keysPressed["w"] = true;
    setTimeout(() => delete keysPressed["w"], 100);
  });
  moveDownBtn.addEventListener("click", () => {
    keysPressed["s"] = true;
    setTimeout(() => delete keysPressed["s"], 100);
  });
  moveLeftBtn.addEventListener("click", () => {
    keysPressed["a"] = true;
    setTimeout(() => delete keysPressed["a"], 100);
  });
  moveRightBtn.addEventListener("click", () => {
    keysPressed["d"] = true;
    setTimeout(() => delete keysPressed["d"], 100);
  });

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

  // Ponovno zapiranje win-modal, če slučajno dvakrat
  closeWinModalBtn.addEventListener("click", () => {
    winModal.classList.remove("show");
    setTimeout(() => winModal.classList.add("hidden"), 400);
  });

  /*************************************************
   * 15) KONČNA INICIALIZACIJA
   *************************************************/
  // Nastavi začetni položaj igralca in sled
  player.setAttribute("cx", INITIAL_CX);
  player.setAttribute("cy", INITIAL_CY);
  playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);

  // Takoj postavimo iPhone na konec solution-path
  moveIphoneToSolution();

});
