document.addEventListener("DOMContentLoaded", () => {
    const solutionBtn = document.getElementById("solution-btn");
    const solutionPath = document.getElementById("solution-path");

    // Ensure the solution path exists
    if (!solutionPath) {
        console.error("Solution path element not found!");
        return;
    }

    // Calculate the total length of the solution path
    const pathLength = solutionPath.getTotalLength();

    // Set up the stroke-dasharray and stroke-dashoffset to hide the path initially
    solutionPath.style.strokeDasharray = pathLength;
    solutionPath.style.strokeDashoffset = pathLength;

    // Flag to track the visibility state of the solution path
    let isSolutionVisible = false;

    solutionBtn.addEventListener("click", () => {
        // Disable the button to prevent multiple clicks during animation
        solutionBtn.disabled = true;

        if (!isSolutionVisible) {
            // Reveal the solution path
            solutionPath.style.strokeDashoffset = "0";
            solutionBtn.textContent = "Hide Solution";
        } else {
            // Hide the solution path
            solutionPath.style.strokeDashoffset = pathLength;
            solutionBtn.textContent = "Show Solution";
        }

        // Toggle the visibility flag
        isSolutionVisible = !isSolutionVisible;

        // Re-enable the button after the transition duration (2s)
        setTimeout(() => {
            solutionBtn.disabled = false;
        }, 2000); // Match this to your CSS transition duration
    });
});
