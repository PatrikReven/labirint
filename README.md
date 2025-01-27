# Spotify Labyrinth

Welcome to **Spotify Labyrinth**, an interactive maze game that combines entertainment and challenge! Navigate through the maze using your skills and strategy while enjoying immersive visuals and sound effects. This README explains how to set up and play the game.

---

## Features
- 🎥 **Background Video and Music**: Adds a dynamic and engaging atmosphere.
- ⏱️ **Timer**: Track your time to complete the maze and beat your best record.
- 🕹️ **Interactive Maze**: Solve the maze with keyboard or on-screen controls.
- 🎨 **Customizable Themes and Colors**: Switch between light/dark themes and randomize solution path colors.
- 📥 **Downloadable Maze**: Save the maze as an SVG for future challenges.
- 🎵 **Background Music Toggle**: Play or stop the music with a single click.
- 🏆 **Win Modal**: Celebrate your success with a winning animation and best time tracking.
- 📖 **Instructions Modal**: Step-by-step guidance for new players.
- 📊 **Name Input**: Personalize your experience with your player name.
- 📱 **Mobile-Friendly Controls**: Play seamlessly on any device.

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/spotify-labyrinth.git
cd spotify-labyrinth
```

Make sure all necessary files are present:
- `index.html`
- `styles.css`
- `script.js`
- `slike/` folder containing:
  - `spotify.ico`
  - `video.mp4`
  - `click.mp3`
  - `music.mp3`
  - `iPhone.png`
  - `win.gif`

Open `index.html` in your browser to start the game.

---

## Usage

### Controls
```plaintext
- **Keyboard**:
  - `W` / `Arrow Up`: Move up
  - `A` / `Arrow Left`: Move left
  - `S` / `Arrow Down`: Move down
  - `D` / `Arrow Right`: Move right

- **Mobile**:
  - Use on-screen arrow buttons.
```

### Buttons
```plaintext
- **Solution**: Show/hide the maze solution.
- **Reset Maze**: Reset the current maze.
- **Instructions**: View gameplay instructions.
- **Theme**: Switch between light and dark themes.
- **Download Maze**: Save the maze as an SVG.
- **Random Color**: Change the solution path color.
- **Music Toggle**: Play/stop background music.
```

---

## Structure

### HTML
Defines the layout, including:
- Maze display (`<svg>`)
- Timer
- Modals (instructions, win screen)
- Mobile controls

### CSS
Custom styles for animations, themes, and responsive design.

### JavaScript
Game logic, including:
- Timer functionality
- Maze generation and solution
- Event listeners for user interactions

---

## How to Play

1. Open the game in your browser.
2. Enter your name in the modal.
3. Navigate the green circle (`Player`) through the maze to the finish line.
4. Use the buttons and controls for additional features.
5. Complete the maze in the shortest time to set a new record!

---

## Contributing

Feel free to submit pull requests or report issues to improve the game.

---

## License

This project is licensed under the MIT License.

---

## Credits

- Icons: Font Awesome
- Animations: SweetAlert2
- Fonts: Google Fonts
- Music and sounds: Your resources
- Inspiration: Spotify visuals
