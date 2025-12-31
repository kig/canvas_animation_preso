# Canvas Animation Presentation

An HTML5 Canvas-based presentation framework with an interactive editor.

## Structure

```
.
├── src/                    # JavaScript source files
│   ├── cake.js            # Canvas Animation Kit core library
│   ├── support.js         # Support utilities and helpers
│   ├── presentation.js    # Main presentation script (Tomte & Goat animation)
│   └── editor.js          # Animation script editor
├── index.html             # Original presentation
├── editor.html            # Presentation with editor interface
├── goat_sprite/           # Character sprite assets
├── tomte_sprite/          # Character sprite assets
└── *.jpg                  # Background images
```

## Features

### Presentation Framework (CAKE)
- Canvas-based animation system
- Scene graph management
- Timeline and keyframe animation
- Character animation (paper doll style)
- Transformation support (translate, rotate, scale)
- Path and shape drawing

### Presentation Editor
- Visual animation script management
- Edit Tomte and Goat character animations
- Command-based scripting interface:
  - Movement commands (walkTo, run, stop)
  - Expression commands (smile, angry, surprised, etc.)
  - Speech commands (say)
  - Timing commands (wait)
  - Head position commands (lookLeft, lookRight, etc.)
  - Action commands (wave, takeOutMagicWand, etc.)
- Separate tabs for Tomte and Goat characters
- Add/edit/delete animation commands
- Play/pause/restart controls
- Export animation script to JavaScript
- Import/export scripts as JSON
- Side panel interface

## Usage

### Viewing the Original Presentation
Open `index.html` in a modern web browser that supports HTML5 Canvas.

### Using the Editor
1. Open `editor.html` in your web browser
2. The original Tomte and Goat animation will play with the editor panel on the right
3. Use the "Toggle Editor" button to show/hide the panel
4. Switch between "Tomte" and "Goat" tabs to edit each character's script
5. Select commands from the list to edit them
6. Add new commands with the "Add Command" button
7. Export your animation script as JavaScript or JSON

### Editor Controls

**Script Management:**
- Click on commands in the list to edit them
- "Add Command" - Create a new animation command
- "Save Command" - Save current command properties
- "Delete Command" - Remove the selected command

**Character Tabs:**
- "Tomte" - Edit Tomte's animation script
- "Goat" - Edit Goat's animation script

**Playback:**
- "Play" - Start the presentation
- "Stop" - Pause the presentation
- "Restart" - Reload and restart from beginning

**Import/Export:**
- "Export Script" - Download animation script as JavaScript
- "Import Script" - Load animation commands from JSON file

## Browser Compatibility

Requires a modern browser with HTML5 Canvas support:
- Chrome/Chromium
- Firefox
- Safari
- Edge

## License

MIT License - See source files for details.

## Credits

Original CAKE framework by Ilmari Heikkinen
