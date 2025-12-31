# Canvas Animation Presentation

An HTML5 Canvas-based presentation framework with an interactive editor.

## Structure

```
.
├── src/                    # JavaScript source files
│   ├── cake.js            # Canvas Animation Kit core library
│   ├── support.js         # Support utilities and helpers
│   └── editor.js          # Presentation editor
├── index.html             # Original presentation demo
├── editor.html            # Presentation editor interface
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
- Visual slide management
- Add/remove/edit slides
- Configure slide properties:
  - Title
  - Duration
  - Animation type (fade, slide, zoom)
- Navigation controls
- Play/pause presentation
- Export/import slides as JSON
- Side panel interface

## Usage

### Viewing the Original Presentation
Open `index.html` in a modern web browser that supports HTML5 Canvas.

### Using the Editor
1. Open `editor.html` in your web browser
2. The editor panel will appear on the right side
3. Use the "Toggle Editor" button to show/hide the panel
4. Create and manage slides using the interface
5. Export your presentation configuration as JSON

### Editor Controls

**Slide Management:**
- Click on slides in the list to select them
- "Add Slide" - Create a new slide
- "Save Slide" - Save current slide properties
- "Delete Slide" - Remove the current slide

**Navigation:**
- "Previous" - Go to the previous slide
- "Next" - Go to the next slide

**Playback:**
- "Play" - Start the presentation
- "Stop" - Pause the presentation

**Import/Export:**
- "Export JSON" - Download slides configuration
- "Import JSON" - Load slides from a JSON file

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
