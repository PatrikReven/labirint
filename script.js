document.addEventListener("DOMContentLoaded", () => {
  /*************************************************
   * 1) INITIALIZATION
   *************************************************/
  const INITIAL_CX = 234;
  const INITIAL_CY = 10;

  const solutionBtn           = document.getElementById("solution-btn");
  const resetBtn              = document.getElementById("reset-btn");
  const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
  const themeBtn              = document.getElementById("theme-btn");
  const downloadBtn           = document.getElementById("download-btn");
  const colorBtn              = document.getElementById("color-btn");

  // NEW: Music toggle button & audio element
  const musicBtn              = document.getElementById("music-btn");
  const bgMusic               = document.getElementById("bg-music");

  const solutionPath          = document.getElementById("solution-path");
  const player                = document.getElementById("player");
  const playerTrail           = document.getElementById("player-trail");
  const spinner               = document.getElementById("spinner");
  const mazeSVG               = document.getElementById("maze");
  const instructionsModal     = document.getElementById("instructions-modal");
  const closeModalBtn         = document.getElementById("close-modal-btn");
  const winModal              = document.getElementById("win-modal");

  // Extra modal buttons
  const restartGameBtn        = document.getElementById("restart-game-btn");
  const shareBtn              = document.getElementById("share-btn");

  const mobileControls        = document.querySelector(".mobile-controls");
  const moveUpBtn             = document.getElementById("move-up");
  const moveDownBtn           = document.getElementById("move-down");
  const moveLeftBtn           = document.getElementById("move-left");
  const moveRightBtn          = document.getElementById("move-right");

  const lines                 = document.querySelectorAll(".maze-paths line");
  const timerDisplay          = document.getElementById("timer-display");
  const confettiContainer     = document.getElementById("confetti-container");

  // We'll display final time in the win modal
  const finalTimeSpan         = document.getElementById("final-time");

  // NEW: Best time display
  const bestTimeDisplay       = document.getElementById("best-time-display");

  let timerInterval;
  let startTime        = 0;
  let isTimerRunning   = false;
  let isSolutionVisible = false;
  let isDarkTheme       = false;
  let pathLength        = 0;

  // NEW: Keep track if music is ON or OFF
  let isMusicPlaying   = false;

  // Possibly store bestTime from localStorage
  let bestTime = localStorage.getItem("labyrinthBestTime");
  if (bestTime) {
    bestTimeDisplay.textContent = `Best Time: ${bestTime}s`;
  } else {
    bestTimeDisplay.textContent = `Best Time: --`;
  }

  const circleRadius = parseFloat(player.getAttribute("r")) || 5;
  let keysPressed = {};
  const moveSpeedContinuous = 2;
  const boundary = 482;
  const MAX_TRAIL_POINTS = 500;

  // If a solution path is present, set up dash offsets
  if (solutionPath) {
    pathLength = solutionPath.getTotalLength();
    solutionPath.style.strokeDasharray  = pathLength;
    solutionPath.style.strokeDashoffset = pathLength;
  }

  /*************************************************
   * 2) MOVE iPHONE IMAGE TO THE END OF SOLUTION
   *************************************************/
  function moveIphoneToSolution() {
    if (!solutionPath) return;
    const solutionPoints = solutionPath.getAttribute("points");
    if (!solutionPoints) return;

    const lastPoint = solutionPoints.trim().split(" ").pop();
    const [x, y] = lastPoint.split(",").map(Number);

    const iphone = document.querySelector("image");
    const phoneWidth  = parseInt(iphone.getAttribute("width"), 10);
    const phoneHeight = parseInt(iphone.getAttribute("height"), 10);

    // Center iPhone on that final coordinate
    iphone.setAttribute("x", x - phoneWidth / 2);
    iphone.setAttribute("y", y - phoneHeight / 2);
  }

  /*************************************************
   * 3) TIMER
   *************************************************/
  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    startTime = performance.now();
    timerInterval = requestAnimationFrame(updateTimer);
  }
  function updateTimer() {
    if (!isTimerRunning) return;
    const elapsed = Math.floor((performance.now() - startTime) / 1000);
    timerDisplay.textContent = `Time: ${elapsed}s`;
    timerInterval = requestAnimationFrame(updateTimer);
  }
  function stopTimer() {
    isTimerRunning = false;
    cancelAnimationFrame(timerInterval);
  }
  function resetTimerDisplay() {
    timerDisplay.textContent = "Time: 0s";
  }

  /*************************************************
   * 4) TOGGLE SOLUTION
   *************************************************/
  function toggleSolution() {
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
  }

  /*************************************************
   * 5) RESET MAZE
   *************************************************/
  function resetMaze() {
    if (solutionPath) {
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
  }

  /*************************************************
   * 6) TOGGLE THEME
   *************************************************/
  function toggleTheme() {
    document.body.classList.toggle("dark-theme");
    isDarkTheme = !isDarkTheme;
    themeBtn.innerHTML = isDarkTheme
      ? '<i class="fas fa-sun"></i> Light Theme'
      : '<i class="fas fa-moon"></i> Dark Theme';
  }

  /*************************************************
   * 7) DOWNLOAD MAZE (SVG)
   *************************************************/
  function downloadMaze() {
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
    downloadLink.download = "spotify_labyrinth_ultra.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      spinner.classList.add("hidden");
      downloadBtn.disabled = false;
    }, 1000);
  }

  /*************************************************
   * 8) RANDOM SOLUTION COLOR
   *************************************************/
  function randomColor() {
    if (!solutionPath) return;
    const color = '#' + Math.floor(Math.random() * 16777215).toString(16);
    solutionPath.style.stroke = color;
  }

  /*************************************************
   * 9) COLLISION DETECTION
   *************************************************/
  function lineCircleCollides(x1, y1, x2, y2, cx, cy, r) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLenSq = dx*dx + dy*dy;

    if (lineLenSq === 0) {
      return Math.hypot(cx - x1, cy - y1) <= r;
    }

    const t = ((cx - x1) * dx + (cy - y1) * dy) / lineLenSq;
    const closestX = (t < 0) ? x1 : (t > 1) ? x2 : (x1 + t * dx);
    const closestY = (t < 0) ? y1 : (t > 1) ? y2 : (y1 + t * dy);

    return Math.hypot(closestX - cx, closestY - cy) <= r;
  }

  /*************************************************
   * 10) MOVEMENT AND WALL CHECK
   *************************************************/
  function canMoveTo(newCx, newCy) {
    newCx = Math.max(0, Math.min(boundary, newCx));
    newCy = Math.max(0, Math.min(boundary, newCy));

    for (const line of lines) {
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));

      if (lineCircleCollides(x1, y1, x2, y2, newCx, newCy, circleRadius)) {
        return {
          blocked: true,
          cx: player.getAttribute("cx"),
          cy: player.getAttribute("cy"),
        };
      }
    }

    const iphone = document.querySelector("image");
    const bbox   = iphone.getBBox();
    const margin = 10; // tune if needed

    if (
      (newCx - circleRadius) >= (bbox.x + margin) &&
      (newCx + circleRadius) <= (bbox.x + bbox.width - margin) &&
      (newCy - circleRadius) >= (bbox.y + margin) &&
      (newCy + circleRadius) <= (bbox.y + bbox.height - margin)
    ) {
      return { blocked: false, cx: newCx, cy: newCy, win: true };
    }

    return { blocked: false, cx: newCx, cy: newCy, win: false };
  }

  /*************************************************
   * 11) UPDATE PLAYER TRAIL
   *************************************************/
  function updateTrail(x, y) {
    let points = playerTrail.getAttribute("points").split(" ");
    points.push(`${x},${y}`);
    if (points.length > MAX_TRAIL_POINTS) {
      points.shift();
    }
    playerTrail.setAttribute("points", points.join(" "));
  }

  /*************************************************
   * 12) MAIN GAME LOOP: MOVE PLAYER
   *************************************************/
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

        if (result.win) {
          stopTimer();
          const finalTime = parseInt(timerDisplay.textContent.replace(/[^\d]/g, ''), 10);
          finalTimeSpan.textContent = isNaN(finalTime) ? '???' : finalTime;

          // NEW: if finalTime < bestTime => store in localStorage
          if (!bestTime || (finalTime < parseInt(bestTime))) {
            bestTime = finalTime;
            localStorage.setItem("labyrinthBestTime", bestTime);
            bestTimeDisplay.textContent = `Best Time: ${bestTime}s`;
          }

          showWinModal();
        }
      }
    }
    requestAnimationFrame(updatePlayerPosition);
  }
  requestAnimationFrame(updatePlayerPosition);

  // Keyboard events
  function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (["w","a","s","d"].includes(key)) {
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
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // Mobile controls
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

  /*************************************************
   * 13) SHOW WIN MODAL
   *************************************************/
  function showWinModal() {
    const winModal = document.getElementById("win-modal");
    winModal.classList.add("show");
    winModal.classList.remove("hidden");
    // Optionally, we can launch confetti
    launchConfetti(60);
  }
  function hideWinModal() {
    const winModal = document.getElementById("win-modal");
    winModal.classList.remove("show");
    setTimeout(() => {
      winModal.classList.add("hidden");
    }, 400);
  }

  // “Restart Game” inside modal
  restartGameBtn.addEventListener("click", () => {
    hideWinModal();
    resetMaze();
  });

  // “Share Score” -> copy text
  shareBtn.addEventListener("click", () => {
    const currentTime = timerDisplay.textContent; 
    const shareText = `I just found the iPhone in the Spotify Labyrinth! My time was ${currentTime}. Try it yourself!`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Score copied to clipboard! Share it anywhere you like.");
    });
  });

  /*************************************************
   * 14) CONFETTI
   *************************************************/
  function launchConfetti(count=40) {
    for (let i=0;i<count;i++){
      createConfetti();
    }
  }
  function createConfetti() {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");

    confetti.style.left = Math.random()*100 + "%";
    const hue = Math.floor(Math.random()*360);
    confetti.style.backgroundColor = `hsl(${hue}, 90%, 60%)`;

    const size = Math.random()*10 + 8;
    confetti.style.width = size+"px";
    confetti.style.height= size+"px";

    const delay = Math.random()*0.5;
    confetti.style.animationDelay = delay+"s";

    confettiContainer.appendChild(confetti);
    confetti.addEventListener("animationend", ()=>confetti.remove());
  }

  /*************************************************
   * 15) BUTTONS / EVENTS
   *************************************************/
  toggleInstructionsBtn.addEventListener("click", () => {
    instructionsModal.classList.add("show");
    instructionsModal.classList.remove("hidden");
  });
  closeModalBtn.addEventListener("click", () => {
    instructionsModal.classList.remove("show");
    setTimeout(() => instructionsModal.classList.add("hidden"),400);
  });

  solutionBtn.addEventListener("click", toggleSolution);
  resetBtn.addEventListener("click", resetMaze);
  themeBtn.addEventListener("click", toggleTheme);
  downloadBtn.addEventListener("click", downloadMaze);
  colorBtn.addEventListener("click", randomColor);

  // NEW: Music toggle
  musicBtn.addEventListener("click", ()=> {
    if (!isMusicPlaying) {
      bgMusic.play().then(()=>{
        isMusicPlaying = true;
        musicBtn.innerHTML = '<i class="fas fa-music"></i> Music: ON';
      }).catch(err=>{
        console.log("Music play error: ", err);
        alert("Could not play music automatically, please allow audio or unmute tab!");
      });
    } else {
      bgMusic.pause();
      isMusicPlaying = false;
      musicBtn.innerHTML = '<i class="fas fa-music"></i> Music: OFF';
    }
  });

  // Final init
  player.setAttribute("cx", INITIAL_CX);
  player.setAttribute("cy", INITIAL_CY);
  playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);

  moveIphoneToSolution();
});
