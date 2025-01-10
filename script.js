document.addEventListener("DOMContentLoaded", () => {
    const solutionBtn = document.getElementById("solution-btn");
    const resetBtn = document.getElementById("reset-btn");
    const toggleInstructionsBtn = document.getElementById("toggle-instructions-btn");
    const themeBtn = document.getElementById("theme-btn");
    const downloadBtn = document.getElementById("download-btn");
    const solutionPath = document.getElementById("solution-path");
    const instructions = document.querySelector(".instructions");
    const spinner = document.getElementById("spinner");
    const mazeSVG = document.getElementById("maze");

    console.log("Script loaded.");

    // Check if solution path exists
    if (!solutionPath) {
        console.error("Element 'solution-path' not found!");
        return;
    }

    // Calculate the length of the solution path
    const pathLength = solutionPath.getTotalLength();
    console.log(`Solution path length: ${pathLength}`);

    // Set stroke-dasharray and stroke-dashoffset to hide the path
    solutionPath.style.strokeDasharray = pathLength;
    solutionPath.style.strokeDashoffset = pathLength;

    // Flag to track solution visibility
    let isSolutionVisible = false;

    // Flag to track current theme
    let isDarkTheme = false;

    // Function to reveal the solution
    const revealSolution = () => {
        console.log("Revealing solution.");
        solutionBtn.disabled = true;
        resetBtn.disabled = true;
        themeBtn.disabled = true;
        downloadBtn.disabled = true;

        // Reveal the solution path
        solutionPath.style.strokeDashoffset = "0";
        solutionBtn.innerHTML = '<i class="fas fa-pause-circle"></i> Hide Solution';

        isSolutionVisible = true;

        // Re-enable buttons after 2 seconds
        setTimeout(() => {
            solutionBtn.disabled = false;
            resetBtn.disabled = false;
            themeBtn.disabled = false;
            downloadBtn.disabled = false;
            console.log("Buttons re-enabled after revealing solution.");
        }, 2000);
    };

    // Function to toggle the solution
    const toggleSolution = () => {
        console.log("Solution toggle button clicked.");
        solutionBtn.disabled = true;

        if (!isSolutionVisible) {
            // Reveal the solution
            solutionPath.style.strokeDashoffset = "0";
            solutionBtn.innerHTML = '<i class="fas fa-pause-circle"></i> Hide Solution';
            console.log("Solution revealed.");
        } else {
            // Hide the solution
            solutionPath.style.strokeDashoffset = pathLength;
            solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';
            console.log("Solution hidden.");
        }

        // Toggle the visibility flag
        isSolutionVisible = !isSolutionVisible;

        // Re-enable the button after 2 seconds
        setTimeout(() => {
            solutionBtn.disabled = false;
            console.log("Solution toggle button re-enabled.");
        }, 2000);
    };

    // Function to reset the maze
    const resetMaze = () => {
        console.log("Reset button clicked.");
        solutionPath.style.strokeDashoffset = pathLength;
        isSolutionVisible = false;
        solutionBtn.innerHTML = '<i class="fas fa-play-circle"></i> Show Solution';
        console.log("Maze reset to initial state.");
    };

    // Function to toggle instructions visibility
    const toggleInstructions = () => {
        console.log("Toggle instructions button clicked.");
        if (instructions.style.opacity === "0" || instructions.style.opacity === "") {
            instructions.style.opacity = "1";
            toggleInstructionsBtn.innerHTML = '<i class="fas fa-info-circle"></i> Hide Instructions';
            console.log("Instructions shown.");
        } else {
            instructions.style.opacity = "0";
            toggleInstructionsBtn.innerHTML = '<i class="fas fa-info-circle"></i> Show Instructions';
            console.log("Instructions hidden.");
        }
    };

    // Function to toggle theme
    const toggleTheme = () => {
        console.log("Theme toggle button clicked.");
        document.body.classList.toggle("dark-theme");
        isDarkTheme = !isDarkTheme;

        if (isDarkTheme) {
            themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Theme';
            console.log("Switched to dark theme.");
        } else {
            themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Theme';
            console.log("Switched to light theme.");
        }
    };

    // Function to download the maze as SVG
    const downloadMaze = () => {
        console.log("Download button clicked.");
        spinner.classList.remove("hidden");
        downloadBtn.disabled = true;

        // Serialize SVG
        const serializer = new XMLSerializer();
        let source = serializer.serializeToString(mazeSVG);

        // Add namespaces if missing
        if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
            source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        }
        if (!source.match(/^<svg[^>]+"http:\/\/www\.w3\.org\/1999\/xlink"/)) {
            source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
        }

        // Add XML declaration
        source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

        // Convert SVG to Blob
        const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(svgBlob);

        // Create download link and trigger download
        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = "spotify_labyrinth.svg";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Revoke the object URL
        URL.revokeObjectURL(url);

        console.log("Maze downloaded as SVG.");

        // Hide spinner and re-enable button after 1 second
        setTimeout(() => {
            spinner.classList.add("hidden");
            downloadBtn.disabled = false;
            console.log("Download button re-enabled and spinner hidden.");
        }, 1000);
    };

    // Event Listeners for buttons
    solutionBtn.addEventListener("click", toggleSolution);
    resetBtn.addEventListener("click", resetMaze);
    toggleInstructionsBtn.addEventListener("click", toggleInstructions);
    themeBtn.addEventListener("click", toggleTheme);
    downloadBtn.addEventListener("click", downloadMaze);
});
