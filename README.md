# Canvas Animation Presentation

A declarative animation framework for creating canvas-based presentations with character animations.

## Overview

This project provides tools for creating, editing, and playing canvas animation presentations featuring animated characters (Tomte and Goat). It includes a complete ecosystem with JSON-based presentation format, visual timeline editor, and comprehensive property-based testing.

## Quick Start

```bash
# View the original presentation (hardcoded animations)
open index.html

# View JSON-driven presentation (optimal architecture)
open index-json.html

# Use the timeline editor
open editor.html

# Play JSON presentations
open player.html

# Run tests
open tests.html
```

## Project Structure

```
canvas_animation_preso/
├── src/                       # JavaScript source files
│   ├── cake.js               # Canvas Animation Kit (CAKE) framework
│   ├── support.js            # Support utilities
│   ├── presentation.js       # Character classes and presentation logic
│   ├── animation-runner.js   # JSON presentation execution library
│   ├── editor.js             # Timeline editor implementation
│   └── editor-enhanced.js    # Enhanced editor with undo/redo & live preview ✨ NEW
├── index.html                # Original presentation (hardcoded)
├── index-json.html           # JSON-driven presentation (optimal) ✨
├── editor.html               # Visual timeline editor
├── editor-enhanced.html      # Enhanced editor interface ✨ NEW
├── player.html               # JSON presentation player
├── tests.html                # Property-based test suite
├── presentation.json         # Example JSON presentation
├── *_sprite/                 # Character sprite assets
└── *.jpg                     # Background images
```

## Features

### JSON Presentation Format

Define presentations declaratively:

```json
{
  "title": "My Presentation",
  "settings": {
    "width": 1024,
    "height": 768,
    "frameDuration": 30
  },
  "background": {
    "type": "image",
    "src": "trees2.jpg"
  },
  "characters": [
    {
      "name": "tomte",
      "type": "Tomte",
      "position": { "x": 0, "y": 0 }
    }
  ],
  "timeline": {
    "tomte": [
      { "method": "wait", "params": [100] },
      { "method": "walkTo", "params": [700, 690] },
      { "method": "say", "params": ["Hello!"] }
    ]
  }
}
```

### Timeline Editor

Visual two-column editor for creating character animation sequences:

- **Two-column layout** - Edit Tomte and Goat actions side-by-side
- **Sync points** - Coordinate actions between characters
- **Custom actions** - Write your own JavaScript functions
- **JSON export/import** - Save and load presentations
- **Live editing** - Click rows to modify actions

### Enhanced Timeline Editor ✨ NEW

Advanced editor with undo/redo and live preview capabilities:

- **Undo/Redo System** - Command pattern implementation with 50-level history
  - `Ctrl+Z` to undo
  - `Ctrl+Y` or `Ctrl+Shift+Z` to redo
  - Visual indicators showing undo/redo stack size
  - All operations supported: add row, delete row, edit action, add sync point

- **Live Preview Canvas** - Real-time character animation preview
  - Integrated 512x384 preview canvas
  - Instant visual feedback as you edit
  - Separate from main presentation

- **Timeline Seeking** - Scrub through timeline with visual seeker
  - Slider control to jump to any row
  - Shows current position (e.g., "Position: 5 / 12")
  - Click timeline rows to seek
  - Characters update to reflect state at that position

- **Playback Controls** - Play/pause timeline preview
  - "Play Preview" button to animate through timeline
  - Automatic advancement every 500ms
  - "Pause Preview" to stop
  - "Reset Preview" to jump back to start

- **Keyboard Shortcuts**
  - `Space` - Play/Pause preview
  - `←` / `→` - Navigate previous/next row
  - `Ctrl+Z` - Undo
  - `Ctrl+Y` - Redo

**Usage:**
```bash
open editor-enhanced.html
```

The enhanced editor provides a professional editing experience with full undo/redo support and real-time visual feedback, making it easy to create and refine complex character animations.

### Animation Runner

Framework-agnostic library for executing JSON presentations:

```javascript
// Load and play a presentation
AnimationRunner.loadPresentation(jsonData, canvasElement);
```

### Property-Based Testing

Comprehensive test suite with 16,000 test runs:

- QuickCheck-style random generation
- 16 property tests covering all invariants
- 11,274 unique test cases
- Visual test statistics

## Usage Examples

### Creating a Presentation

1. Open `editor.html`
2. Add rows for character actions
3. Configure action types and parameters
4. Add sync points for coordination
5. Export as JSON

### Loading JSON Presentations

**Optimal architecture** (`index-json.html`):

```html
<script src="src/cake.js"></script>
<script src="src/support.js"></script>
<script src="src/presentation.js"></script>
<script src="src/animation-runner.js"></script>
<script>
  fetch('presentation.json')
    .then(r => r.json())
    .then(data => AnimationRunner.loadPresentation(data, canvas));
</script>
```

**Player with URL parameter:**

```bash
# player.html?presentation=my-presentation.json
```

**Direct JavaScript:**

```javascript
// Load and play
fetch('presentation.json')
  .then(r => r.json())
  .then(data => AnimationRunner.loadPresentation(data, canvas));
```

### Custom Actions

Define custom character behaviors:

```javascript
// In editor or JSON
{
  "customActions": {
    "spin": "function() { this.animate('rotation', 0, Math.PI*2, 1000); }"
  }
}
```

## Animation API

Available action methods for characters:

**Movement:**
- `walkTo(x, y)` - Walk to coordinates
- `startRunning()` - Begin running
- `stop()` - Stop moving
- `isOffscreenLeft()` / `isOffscreenRight()` - Position off-screen

**Expressions:**
- `plain()` - Neutral expression
- `smile()` - Smile
- `angry()` - Angry expression
- `surprised()` - Surprised expression
- `bored()` - Bored expression

**Speech:**
- `say(text, syncPoint?)` - Display speech bubble

**Timing:**
- `wait(ms)` - Pause for duration
- `waitFor(syncPoint)` - Wait for sync point

**Head:**
- `lookLeft()` / `lookRight()` / `lookFront()` - Turn head
- `headUpLeft()` / `headDownLeft()` / `headLevel()` - Tilt head

**Actions:**
- `wave()` - Wave gesture
- `takeOutMagicWand()` / `putAwayMagicWand()` - Magic wand actions

## Testing

Run the property-based test suite:

```bash
open tests.html
```

Tests validate:
- Timeline order preservation
- Sync point coordination
- JSON roundtrip integrity
- Action source generation
- Character sprite paths
- Background configuration
- State consistency

## Browser Support

Requires HTML5 Canvas support:
- Chrome/Chromium ✓
- Firefox ✓
- Safari ✓
- Edge ✓

## Architecture

**CAKE Framework** (`src/cake.js`) - Core canvas animation engine

**Presentation Layer** (`src/presentation.js`) - Character classes and animation logic

**Animation Runner** (`src/animation-runner.js`) - JSON presentation execution

**Editor** (`src/editor.js`) - Visual timeline editing interface

## Performance

- Optimized for 30fps animation
- Lazy sprite loading (planned)
- Debounced editor inputs (planned)
- Optional test execution (16,000 runs can be heavy)

## License

Original canvas animation framework.

## Contributing

This is a demonstration project showcasing:
- Declarative animation workflows
- Property-based testing methodologies
- Visual timeline editors
- JSON-driven presentations
