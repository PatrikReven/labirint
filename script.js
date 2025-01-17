document.addEventListener("DOMContentLoaded", () => {
    const solutionBtn = document.getElementById("solution-btn");
    const resetBtn = document.getElementById("reset-btn");
    const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
    const themeBtn = document.getElementById("theme-btn");
    const downloadBtn = document.getElementById("download-btn");
    const colorBtn = document.getElementById("color-btn");
  
    const solutionPath = document.getElementById("solution-path");

  if (solutionPath) {
    // Calculate its length once
    const pathLength = solutionPath.getTotalLength();

    // Immediately set dasharray/dashoffset so the path is hidden
    solutionPath.style.strokeDasharray = pathLength;
    solutionPath.style.strokeDashoffset = pathLength;
  }
    const spinner = document.getElementById("spinner");
    const mazeSVG = document.getElementById("maze");
    const player = document.getElementById("player"); 
    const instructionsModal = document.getElementById("instructions-modal");
    const closeModalBtn = document.getElementById("close-modal-btn");
  
    // Gather all labyrinth lines for collision checks
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
  
      // Move circle to top-left (2,2)
      player.setAttribute("cx", 2);
      player.setAttribute("cy", 2);
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
    /**
     * Checks if circle at (cx, cy) with radius r 
     * intersects the line segment (x1, y1) -> (x2, y2).
     * Returns true if collision, false otherwise.
     */
    function lineCircleCollides(x1, y1, x2, y2, cx, cy, r) {
      // Line length squared
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lineLenSq = dx*dx + dy*dy;
  
      // If line is a point (unlikely here, but just in case)
      if (lineLenSq === 0) {
        // distance from the circle center to this point
        const dist = Math.hypot(cx - x1, cy - y1);
        return dist <= r;
      }
  
      // Project circle center onto the line 
      // param "t" is from 0..1 if the projection is within the segment
      const t = ((cx - x1)*dx + (cy - y1)*dy) / lineLenSq;
  
      // Closest point on the line
      let closestX, closestY;
      if (t < 0) {
        // before segment start
        closestX = x1;
        closestY = y1;
      } else if (t > 1) {
        // after segment end
        closestX = x2;
        closestY = y2;
      } else {
        // on the segment
        closestX = x1 + t * dx;
        closestY = y1 + t * dy;
      }
  
      // Distance from circle center to that closest point
      const distX = closestX - cx;
      const distY = closestY - cy;
      const distSq = distX*distX + distY*distY;
  
      return distSq <= r*r;
    }
  
    // ========== PLAYER MOVEMENT (W, A, S, D) WITH COLLISION ==========
    const moveSpeed = 3;
    const boundary = 482;
  
    /**
     * Attempt to move circle from (cx, cy) to (newCx, newCy).
     * If collides with any line, movement is blocked.
     */
    function canMoveTo(newCx, newCy) {
      // 1) quick boundary clamp
      if (newCx < 0) newCx = 0;
      if (newCy < 0) newCy = 0;
      if (newCx > boundary) newCx = boundary;
      if (newCy > boundary) newCy = boundary;
  
      // 2) check collision with each line
      for (const line of lines) {
        const x1 = parseFloat(line.getAttribute("x1"));
        const y1 = parseFloat(line.getAttribute("y1"));
        const x2 = parseFloat(line.getAttribute("x2"));
        const y2 = parseFloat(line.getAttribute("y2"));
  
        const collides = lineCircleCollides(
          x1, y1, x2, y2,
          newCx, newCy,
          circleRadius
        );
        if (collides) {
          // collision -> block movement
          return { blocked: true, cx: 0, cy: 0 };
        }
      }
  
      // no collision, return safe position
      return { blocked: false, cx: newCx, cy: newCy };
    }
  
    // Check if we reached near (470,470)
    function checkWin(cx, cy) {
      if (cx >= 470 && cy >= 470) {
        stopTimer();
        alert("You Win! Congrats on reaching the bottom-right corner!");
      }
    }
  
    // Keydown for W, A, S, D
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
        default: return; // not WASD
      }
  
      // Start timer if not running
      if (!isTimerRunning) {
        startTimer();
      }
  
      // Attempt to move
      const result = canMoveTo(newCx, newCy);
      if (!result.blocked) {
        // apply the new coords
        player.setAttribute("cx", result.cx);
        player.setAttribute("cy", result.cy);
        // check for "finish" area
        checkWin(result.cx, result.cy);
      } 
      // else { blocked, do nothing }
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
  