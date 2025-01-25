document.addEventListener("DOMContentLoaded", () => {
  /*************************************************
   * 1) INITIALIZATION
   *************************************************/
  const INITIAL_CX = 234;
  const INITIAL_CY = 10;

  // Gumbi in elementi
  const solutionBtn           = document.getElementById("solution-btn");
  const resetBtn              = document.getElementById("reset-btn");
  const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
  const themeBtn              = document.getElementById("theme-btn");
  const downloadBtn           = document.getElementById("download-btn");
  const colorBtn              = document.getElementById("color-btn");
  const shareBtn              = document.getElementById("share-btn"); // Za share score

  // Glasba in video
  const musicBtn   = document.getElementById("music-btn");
  const bgVideo    = document.getElementById("bg-video");
  const bgMusic    = document.getElementById("bg-music");
  const clickSound = document.getElementById("click-sound");

  // Elementi za animacijo
  const typedTitle = document.getElementById("typed-title"); 

  let isMusicPlaying = false;
  let gameStarted = false; // Inicializacija zastavice za začetek igre

  // Drugi elementi
  const solutionPath      = document.getElementById("solution-path");
  const player            = document.getElementById("player");
  const playerTrail       = document.getElementById("player-trail");
  const spinner           = document.getElementById("spinner");
  const mazeSVG           = document.getElementById("maze");
  const instructionsModal = document.getElementById("instructions-modal");
  const closeModalBtn     = document.getElementById("close-modal-btn");
  const winModal          = document.getElementById("win-modal");
  const restartGameBtn    = document.getElementById("restart-game-btn");
  const shareBtnElement   = document.getElementById("share-btn"); // Pridobitev share gumba
  const mobileControls    = document.querySelector(".mobile-controls");
  const moveUpBtn         = document.getElementById("move-up");
  const moveDownBtn       = document.getElementById("move-down");
  const moveLeftBtn       = document.getElementById("move-left");
  const moveRightBtn      = document.getElementById("move-right");
  const lines             = document.querySelectorAll(".maze-paths line");
  const timerDisplay      = document.getElementById("timer-display");
  const confettiContainer = document.getElementById("confetti-container");
  const finalTimeSpan     = document.getElementById("final-time");
  const bestTimeInfo      = document.getElementById("best-time-info");
  const bestTimeDisplay   = document.getElementById("best-time-display");
  const playerNameDisplay = document.getElementById("player-name-display");

  // ====== Novi elementi za vnos imena ======
  const nameModal          = document.getElementById("name-modal");
  const playerNameInput    = document.getElementById("player-name-input");
  const startGameBtn       = document.getElementById("start-game-btn");
  let playerName          = "Player"; // Privzeto ime

  // Timers / zastavice
  let timerInterval;
  let startTime         = 0;
  let isTimerRunning    = false;
  let isSolutionVisible = false;
  let isDarkTheme       = false;
  let pathLength        = 0;

  // Premikanje
  let keysPressed       = {};
  const circleRadius    = parseFloat(player.getAttribute("r")) || 5;
  const moveSpeed       = 2;
  const boundary        = 482;
  const MAX_TRAIL_POINTS= 500;

  // Najboljši čas
  let bestTime = localStorage.getItem("labyrinthBestTime");
  if (bestTime) {
    bestTimeDisplay.textContent = `Best Time: ${bestTime}s`;
  } else {
    bestTimeDisplay.textContent = `Best Time: --`;
  }

  // Nastavitve rešitvene poti (dashoffset)
  if (solutionPath) {
    pathLength = solutionPath.getTotalLength();
    solutionPath.style.strokeDasharray = pathLength;
    solutionPath.style.strokeDashoffset= pathLength;
  }

  // Preprečevanje kontekstnega menija ob dolgem pritisku
  document.addEventListener("contextmenu",(e)=>{
    e.preventDefault();
  }, { passive:false });

  /*************************************************
   * 2) MUSIC BTN: fade in/out video
   *************************************************/
  musicBtn.addEventListener("click", () => {
    playClickSound();
    if (!isMusicPlaying) {
      // Fade in video
      bgVideo.style.display = "block";
      bgVideo.style.opacity = "0";
      bgVideo.style.transition = "opacity 1s ease";

      document.body.classList.add("video-active"); // Skrij ozadje

      requestAnimationFrame(() => {
        bgVideo.style.opacity = "1";
      });

      // Predvajanje glasbe
      bgMusic.play().then(()=>{
        isMusicPlaying = true;
        musicBtn.innerHTML = '<i class="fas fa-music"></i> Music: ON';
      }).catch(err=>{
        console.log("Music play error:", err);
        alert("Could not play music automatically. Unmute tab or allow audio!");
      });

    } else {
      // Fade out
      bgVideo.style.opacity = "0";
      setTimeout(()=> {
        bgVideo.style.display = "none";
      }, 1000);

      bgMusic.pause();
      isMusicPlaying = false;
      musicBtn.innerHTML = '<i class="fas fa-music"></i> Music: OFF';
      document.body.classList.remove("video-active");
    }
  });

  /*************************************************
   * 3) MOVE iPhone to end of solution
   *************************************************/
  function moveIphoneToSolution() {
    if (!solutionPath) return;
    const solutionPoints = solutionPath.getAttribute("points");
    if (!solutionPoints) return;

    const pointsArray = solutionPoints.trim().split(" ");
    const lastPoint   = pointsArray[pointsArray.length - 1];
    if (!lastPoint) return;

    const [x, y] = lastPoint.split(",").map(Number);
    const iphone = document.querySelector("image");
    if (!iphone) return;

    const phoneWidth  = parseInt(iphone.getAttribute("width"),10);
    const phoneHeight = parseInt(iphone.getAttribute("height"),10);

    iphone.setAttribute("x", x - phoneWidth/2);
    iphone.setAttribute("y", y - phoneHeight/2);
  }

  /*************************************************
   * 4) TIMER
   *************************************************/
  function startTimer() {
    if (isTimerRunning) return;
    isTimerRunning = true;
    startTime = performance.now();
    timerInterval = requestAnimationFrame(updateTimer);
  }
  function updateTimer() {
    if (!isTimerRunning) return;
    const elapsed = Math.floor((performance.now() - startTime)/1000);
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
   * 5) TOGGLE SOLUTION
   *************************************************/
  function toggleSolution() {
    playClickSound();
    if (!solutionPath) return;
    solutionBtn.disabled = true;

    if (!isSolutionVisible) {
      // Prikaži rešitev
      solutionPath.style.strokeDashoffset = "0";
      solutionBtn.innerHTML = '<i class="fas fa-pause-circle"></i> Hide Solution';
      stopTimer();
    } else {
      // Skrij rešitev
      solutionPath.style.strokeDashoffset = pathLength;
      solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';
    }

    isSolutionVisible = !isSolutionVisible;
    setTimeout(()=> (solutionBtn.disabled = false), 2000);
  }

  /*************************************************
   * 6) RESET MAZE
   *************************************************/
  function resetMaze() {
    playClickSound();

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
    gameStarted = false; // Resetiraj zastavico za začetek igre

    const resetMessage = document.createElement("div");
    resetMessage.textContent = "Game has been reset!";
    resetMessage.classList.add("reset-message");
    document.body.appendChild(resetMessage);

    setTimeout(()=>{
      resetMessage.classList.add("fade-out");
      setTimeout(()=> resetMessage.remove(),1000);
    },2000);
    
    // Odstrani prikaz modalnega okna z imenom, če je prikazano
    // nameModal.classList.add("show");
    // nameModal.classList.remove("hidden");
  }

  /*************************************************
   * 7) TOGGLE THEME
   *************************************************/
  function toggleTheme() {
    playClickSound();
    document.body.classList.toggle("dark-theme");
    isDarkTheme = !isDarkTheme;
    themeBtn.innerHTML = isDarkTheme
      ? '<i class="fas fa-sun"></i> Light Theme'
      : '<i class="fas fa-moon"></i> Dark Theme';
  }

  /*************************************************
   * 8) DOWNLOAD MAZE (SVG)
   *************************************************/
  function downloadMaze() {
    playClickSound();
    spinner.classList.remove("hidden");
    downloadBtn.disabled = true;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(mazeSVG);

    // Dodaj xmlns, če manjka
    if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
      source = source.replace(/^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }
    source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

    const svgBlob = new Blob([source], {type:"image/svg+xml;charset=utf-8"});
    const url = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "spotify_labyrinth_ultra.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);

    setTimeout(()=>{
      spinner.classList.add("hidden");
      downloadBtn.disabled = false;
    },1000);
  }

  /*************************************************
   * 9) RANDOM SOLUTION COLOR
   *************************************************/
  function randomColor() {
    playClickSound();
    if (!solutionPath) return;
    const color = '#'+ Math.floor(Math.random()*16777215).toString(16);
    solutionPath.style.stroke = color;
  }

  /*************************************************
   * 10) COLLISION DETECTION
   *************************************************/
  function lineCircleCollides(x1, y1, x2, y2, cx, cy, r){
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lineLenSq = dx*dx + dy*dy;
    if(lineLenSq===0){
      return Math.hypot(cx-x1, cy-y1) <= r;
    }
    const t = ((cx - x1)*dx + (cy - y1)*dy) / lineLenSq;
    const closestX = (t<0) ? x1 : (t>1)? x2 : (x1 + t*dx);
    const closestY = (t<0) ? y1 : (t>1)? y2 : (y1 + t*dy);

    return Math.hypot(closestX - cx, closestY - cy) <= r;
  }

  /*************************************************
   * 11) CAN MOVE?
   *************************************************/
  function canMoveTo(newCx, newCy){
    newCx = Math.max(0, Math.min(boundary, newCx));
    newCy = Math.max(0, Math.min(boundary, newCy));

    for(const line of lines){
      const x1 = parseFloat(line.getAttribute("x1"));
      const y1 = parseFloat(line.getAttribute("y1"));
      const x2 = parseFloat(line.getAttribute("x2"));
      const y2 = parseFloat(line.getAttribute("y2"));
      if(lineCircleCollides(x1,y1,x2,y2,newCx,newCy,circleRadius)) {
        return {blocked:true, cx: player.getAttribute("cx"), cy: player.getAttribute("cy")};
      }
    }

    // Preveri iPhone (pogoj za zmago)
    const iphone = document.querySelector("image");
    if(!iphone) return {blocked:false, cx:newCx, cy:newCy, win:false};
    const bbox = iphone.getBBox();
    const margin=10;

    if(
      (newCx - circleRadius) >= (bbox.x+margin) &&
      (newCx + circleRadius) <= (bbox.x+bbox.width - margin) &&
      (newCy - circleRadius) >= (bbox.y+margin) &&
      (newCy + circleRadius) <= (bbox.y+bbox.height-margin)
    ){
      return {blocked:false, cx:newCx, cy:newCy, win:true};
    }

    return {blocked:false, cx:newCx, cy:newCy, win:false};
  }

  /*************************************************
   * 12) UPDATE TRAIL
   *************************************************/
  function updateTrail(x,y){
    let points = playerTrail.getAttribute("points").split(" ");
    points.push(`${x},${y}`);
    if(points.length>MAX_TRAIL_POINTS){
      points.shift();
    }
    playerTrail.setAttribute("points", points.join(" "));
  }

  /*************************************************
   * 13) GAME LOOP
   *************************************************/
  function updatePlayerPosition(){
    if (!gameStarted) {
      requestAnimationFrame(updatePlayerPosition);
      return;
    }
    
    let cx = parseFloat(player.getAttribute("cx"));
    let cy = parseFloat(player.getAttribute("cy"));
    let moved = false;

    if(keysPressed["w"]){ cy -= moveSpeed; moved=true; }
    if(keysPressed["s"]){ cy += moveSpeed; moved=true; }
    if(keysPressed["a"]){ cx -= moveSpeed; moved=true; }
    if(keysPressed["d"]){ cx += moveSpeed; moved=true; }

    if(moved){
      if(!isTimerRunning) startTimer();
      const result = canMoveTo(cx,cy);
      if(!result.blocked){
        player.setAttribute("cx", result.cx);
        player.setAttribute("cy", result.cy);
        updateTrail(result.cx, result.cy);

        if(result.win){
          stopTimer();
          const finalTime = parseInt(timerDisplay.textContent.replace(/[^\d]/g,''),10);

          // Prikaz končnega in najboljšega časa
          finalTimeSpan.textContent = isNaN(finalTime)? '???' : finalTime;
          if(!bestTime || (finalTime < parseInt(bestTime))){
            bestTime= finalTime;
            localStorage.setItem("labyrinthBestTime", bestTime);
            bestTimeDisplay.textContent= `Best Time: ${bestTime}s`;
          }
          if(bestTimeInfo){
            bestTimeInfo.textContent= bestTime? bestTime: '???';
          }
          showWinModal();
        }
      }
    }
    requestAnimationFrame(updatePlayerPosition);
  }
  requestAnimationFrame(updatePlayerPosition);

  // Tipkovni nadzor
  function handleKeyDown(e){
    const key = e.key.toLowerCase();
    if(["w","a","s","d"].includes(key)){
      keysPressed[key]=true;
    }
  }
  function handleKeyUp(e){
    const key=e.key.toLowerCase();
    if(keysPressed[key]) delete keysPressed[key];
  }
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("keyup", handleKeyUp);

  // ==================== MOBILE CONTROLS ====================
  function pressKey(key){ keysPressed[key] = true; }
  function releaseKey(key){ if(keysPressed[key]) delete keysPressed[key]; }

  function pointerDownHandler(e,key){
    e.preventDefault();
    pressKey(key);
  }
  function pointerUpHandler(e,key){
    e.preventDefault();
    releaseKey(key);
  }
  function pointerCancelHandler(e,key){
    e.preventDefault();
    releaseKey(key);
  }
  function pointerLeaveHandler(e,key){
    e.preventDefault();
    releaseKey(key);
  }

  // Move UP (W)
  moveUpBtn.addEventListener("pointerdown", (e)=> pointerDownHandler(e,"w"));
  moveUpBtn.addEventListener("pointerup",   (e)=> pointerUpHandler(e,"w"));
  moveUpBtn.addEventListener("pointercancel",(e)=> pointerCancelHandler(e,"w"));
  moveUpBtn.addEventListener("pointerout",  (e)=> pointerLeaveHandler(e,"w"));
  moveUpBtn.addEventListener("pointerleave",(e)=> pointerLeaveHandler(e,"w"));

  // Move DOWN (S)
  moveDownBtn.addEventListener("pointerdown",(e)=> pointerDownHandler(e,"s"));
  moveDownBtn.addEventListener("pointerup",  (e)=> pointerUpHandler(e,"s"));
  moveDownBtn.addEventListener("pointercancel",(e)=> pointerCancelHandler(e,"s"));
  moveDownBtn.addEventListener("pointerout",  (e)=> pointerLeaveHandler(e,"s"));
  moveDownBtn.addEventListener("pointerleave",(e)=> pointerLeaveHandler(e,"s"));

  // Move LEFT (A)
  moveLeftBtn.addEventListener("pointerdown",(e)=> pointerDownHandler(e,"a"));
  moveLeftBtn.addEventListener("pointerup",  (e)=> pointerUpHandler(e,"a"));
  moveLeftBtn.addEventListener("pointercancel",(e)=> pointerCancelHandler(e,"a"));
  moveLeftBtn.addEventListener("pointerout",  (e)=> pointerLeaveHandler(e,"a"));
  moveLeftBtn.addEventListener("pointerleave",(e)=> pointerLeaveHandler(e,"a"));

  // Move RIGHT (D)
  moveRightBtn.addEventListener("pointerdown",(e)=> pointerDownHandler(e,"d"));
  moveRightBtn.addEventListener("pointerup",  (e)=> pointerUpHandler(e,"d"));
  moveRightBtn.addEventListener("pointercancel",(e)=> pointerCancelHandler(e,"d"));
  moveRightBtn.addEventListener("pointerout",  (e)=> pointerLeaveHandler(e,"d"));
  moveRightBtn.addEventListener("pointerleave",(e)=> pointerLeaveHandler(e,"d"));

  /*************************************************
   * 14) WIN MODAL
   *************************************************/
  function showWinModal(){
    winModal.classList.add("show");
    winModal.classList.remove("hidden");
    // Prikaz imena igralca v win modalu
    if(playerNameDisplay){
      playerNameDisplay.textContent = playerName;
    }
    // Zagon konfeti
    launchConfetti(100);
    
    // Dodaj sparkle efekte
    addSparkleEffect();
    
    // Predvajanje zvoka zmage, če je na voljo
    const winSound = document.getElementById("win-sound");
    if(winSound){
      winSound.play().catch(()=>{});
    }
  }
  function hideWinModal(){
    winModal.classList.remove("show");
    setTimeout(()=> winModal.classList.add("hidden"),400);
  }
  restartGameBtn.addEventListener("click", ()=>{
    playClickSound();
    hideWinModal();
    resetMaze();
  });

  /*************************************************
   * 15) CONFETTI
   *************************************************/
  function launchConfetti(count=100){
    for(let i=0; i<count; i++){
      createConfetti();
    }
  }
  function createConfetti(){
    const confetti= document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.left = Math.random()*100 + "%";
    confetti.style.top = "-10px";
    const hue = Math.floor(Math.random()*360);
    confetti.style.backgroundColor = `hsl(${hue},90%,60%)`;
    const shapeRound= (Math.random()<0.5);
    confetti.style.borderRadius = shapeRound ? "50%" : "0%";
    confetti.style.width = `${Math.random()*10 + 5}px`;
    confetti.style.height = `${Math.random()*10 + 5}px`;
    confetti.style.animationDuration = `${Math.random()*3 + 2}s`;
    document.getElementById("confetti-container").appendChild(confetti);
    confetti.addEventListener("animationend", ()=> confetti.remove());
  }

  /*************************************************
   * 16) HELPER: PLAY CLICK SOUND
   *************************************************/
  function playClickSound(){
    if(clickSound){
      clickSound.currentTime=0;
      clickSound.play().catch(()=>{});
    }
  }

  /*************************************************
   * 17) UI BUTTONS (Instructions button, etc.)
   *************************************************/
  toggleInstructionsBtn.addEventListener("click", () => {
    playClickSound();

    // Reset typedTitle animacije
    if (typedTitle) {
      typedTitle.style.width = "0";
      typedTitle.textContent = "INSTRUCTIONS";

      // Ponastavi animacijo za ponovno predvajanje
      typedTitle.style.animation = "none";
      typedTitle.offsetWidth; // prisili ponoven layout
      typedTitle.style.animation = 
        "typing 3s steps(40, end) forwards, blinkCursor 1s infinite step-end alternate";
    }

    instructionsModal.classList.add("show");
    instructionsModal.classList.remove("hidden");
  });

  closeModalBtn.addEventListener("click", () => {
    playClickSound();
    instructionsModal.classList.remove("show");
    setTimeout(() => instructionsModal.classList.add("hidden"),400);
  });

  solutionBtn.addEventListener("click", toggleSolution);
  resetBtn.addEventListener("click", resetMaze);
  themeBtn.addEventListener("click", toggleTheme);
  downloadBtn.addEventListener("click", downloadMaze);
  colorBtn.addEventListener("click", randomColor);
  // shareBtnElement.addEventListener("click", shareScore); // Odstranjen stari poslušalec

  /*************************************************
   * 18) NAME INPUT MODAL FUNCTIONALITY
   *************************************************/
  // Prikaz modalnega okna za vnos imena ob nalaganju
  nameModal.classList.add("show");
  nameModal.classList.remove("hidden");

  // Gumb za začetek igre
  startGameBtn.addEventListener("click", () => {
    const name = playerNameInput.value.trim();
    if(name === ""){
      Swal.fire({
        title: 'Invalid Name',
        text: 'Please enter your name to start the game.',
        icon: 'warning',
        confirmButtonText: 'OK',
        zIndex: 10002
      });
      return;
    }
    playerName = name;
    gameStarted = true; // Igra se začne tukaj
    nameModal.classList.remove("show");
    setTimeout(() => nameModal.classList.add("hidden"), 400);
    playClickSound();
  });

  /*************************************************
   * 19) ADDITIONAL EFFECTS: SPARKLE
   *************************************************/
  function addSparkleEffect() {
    const winModalContent = document.querySelector('.win-modal-content');
    
    // Ustvari nekaj sparkle efektov
    for(let i=0; i<10; i++){
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle');
      sparkle.style.top = `${Math.random() * 100}%`;
      sparkle.style.left = `${Math.random() * 100}%`;
      sparkle.style.animationDelay = `${Math.random() * 2}s`;
      winModalContent.appendChild(sparkle);
      
      // Odstrani sparkle po končani animaciji
      sparkle.addEventListener('animationiteration', () => {
        sparkle.remove();
      });
    }
  }

  /*************************************************
   * 20) SHARE SCORE WITH SWEETALERT2
   *************************************************/
  function shareScore(){
    console.log("shareScore called"); // Za preverjanje
    playClickSound();
    
    // Skrij win modal
    winModal.classList.remove("show");
    setTimeout(() => winModal.classList.add("hidden"), 400);
    
    // Priprava besedila za deljenje
    const currentTime = timerDisplay.textContent;
    const shareText = `${playerName} just completed the Spotify Labyrinth in ${currentTime}. Try it yourself! patrikreven.github.io/labirint/`;

    // Poskus kopiranja besedila v odložišče
    navigator.clipboard.writeText(shareText).then(() => {
      // Prikaz SweetAlert2 modala po uspešni kopiranju
      Swal.fire({
        title: 'Score Shared!',
        html: `
          <p>Your score has been copied to the clipboard.</p>
          <p><strong>Try it yourself:</strong></p>
          <a href="https://patrikreven.github.io/labirint/" target="_blank" rel="noopener noreferrer">patrikreven.github.io/labirint/</a>
        `,
        icon: 'success',
        confirmButtonText: 'OK',
        zIndex: 10002 // Višji kot win modalov (9999)
      });
    }).catch(() => {
      // Prikaz SweetAlert2 modala v primeru napake
      Swal.fire({
        title: 'Oops...',
        text: 'Failed to copy score. Please try manually.',
        icon: 'error',
        confirmButtonText: 'OK',
        zIndex: 10002
      });
    });
  }

  /*************************************************
   * 21) INIT
   *************************************************/
  player.setAttribute("cx", INITIAL_CX);
  player.setAttribute("cy", INITIAL_CY);
  playerTrail.setAttribute("points", `${INITIAL_CX},${INITIAL_CY}`);
  moveIphoneToSolution();

  // Priključi funkcijo shareScore na gumb "Share Score"
  shareBtnElement.addEventListener("click", shareScore);
});
