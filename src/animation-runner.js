/*
  Animation Runner Library
  
  Framework-agnostic library for executing animation timelines defined in JSON format.
  Loads presentations, creates characters, and executes action sequences.
  
  @example
  var data = {
    settings: { frameDuration: 30 },
    characters: [{ name: 'tomte', type: 'Tomte', position: {x: 0, y: 0} }],
    timeline: { tomte: [{ method: 'walkTo', params: [100, 100] }] }
  };
  AnimationRunner.loadPresentation(data, document.getElementById('canvas'));
*/

var AnimationRunner = (function() {
  'use strict';
  
  var runner = {
    /**
     * Load and play presentation from JSON
     * @param {Object|string} json - Presentation JSON object or string
     * @param {HTMLCanvasElement} canvasElement - Canvas element to render to
     * @returns {Object} Presentation instance with canvas, root, characters, and presentation data
     */
    loadPresentation: function(json, canvasElement) {
      var presentation = typeof json === 'string' ? JSON.parse(json) : json;
      
      // Create canvas animation
      var canvas = new Canvas(canvasElement);
      canvas.frameDuration = presentation.settings.frameDuration || 30;
      canvas.fixedTimestep = presentation.settings.fixedTimestep !== false;
      canvas.clear = presentation.settings.clear !== false;
      canvas.playOnlyWhenFocused = presentation.settings.playOnlyWhenFocused || false;
      
      var root = new CanvasNode();
      canvas.append(root);
      
      // Add background
      if (presentation.background) {
        var bg = this.createBackground(presentation.background);
        root.append(bg);
      }
      
      // Create characters
      var characters = {};
      if (presentation.characters) {
        for (var i = 0; i < presentation.characters.length; i++) {
          var charDef = presentation.characters[i];
          var char = this.createCharacter(charDef);
          characters[charDef.name] = char;
          root.append(char);
        }
      }
      
      // Play timeline
      if (presentation.timeline) {
        this.playTimeline(presentation.timeline, characters);
      }
      
      return {
        canvas: canvas,
        root: root,
        characters: characters,
        presentation: presentation
      };
    },
    
    /**
     * Create background node from definition
     * @param {Object} bgDef - Background definition {type, src|fill, zIndex, visible}
     * @returns {CanvasNode|null} Background node or null if invalid
     */
    createBackground: function(bgDef) {
      if (bgDef.type === 'image') {
        var bg = ImageNode.load(bgDef.src);
        bg.zIndex = bgDef.zIndex || -1;
        bg.visible = bgDef.visible !== false;
        return bg;
      } else if (bgDef.type === 'rectangle') {
        var bg = new Rectangle(bgDef.width, bgDef.height, {
          fill: bgDef.fill || [0,0,0,0.5]
        });
        bg.zIndex = bgDef.zIndex || -1;
        bg.visible = bgDef.visible !== false;
        return bg;
      }
      return null;
    },
    
    /**
     * Create character instance from definition
     * @param {Object} charDef - Character definition {name, type, position}
     * @returns {CanvasNode} Character node instance
     */
    createCharacter: function(charDef) {
      // This assumes character classes like Tomte and Goat exist
      if (window[charDef.type]) {
        var char = new window[charDef.type]();
        if (charDef.position) {
          char.x = charDef.position.x;
          char.y = charDef.position.y;
        }
        return char;
      }
      return new CanvasNode();
    },
    
    /**
     * Execute timeline actions for all characters
     * @param {Object} timeline - Timeline object with character names as keys
     * @param {Object} characters - Character instances keyed by name
     */
    playTimeline: function(timeline, characters) {
      // Execute actions for each character
      for (var charName in timeline) {
        if (characters[charName]) {
          var actions = timeline[charName];
          this.executeActions(characters[charName], actions);
        }
      }
    },
    
    /**
     * Execute action sequence on a character using fluent API chaining
     * @param {Object} character - Character instance with action methods
     * @param {Array} actions - Array of action objects {method, params}
     * @returns {Object} Final chain result
     */
    executeActions: function(character, actions) {
      var chain = character;
      
      for (var i = 0; i < actions.length; i++) {
        var action = actions[i];
        var method = action.method;
        var params = action.params || [];
        
        if (typeof chain[method] === 'function') {
          // Call method with params
          chain = chain[method].apply(chain, params);
        }
      }
      
      return chain;
    },
    
    /**
     * Convert editor timeline format to JSON presentation format
     * @param {Array} timeline - Editor timeline (two-column row format)
     * @param {Object} customActions - Custom action definitions {name: code}
     * @returns {Object} JSON presentation timeline and custom actions
     */
    timelineToJSON: function(timeline, customActions) {
      var result = {
        timeline: {},
        customActions: customActions || {}
      };
      
      // Process timeline rows
      for (var i = 0; i < timeline.length; i++) {
        var row = timeline[i];
        
        if (row.type === 'row') {
          // Add actions for each character
          if (row.tomte) {
            if (!result.timeline.tomte) result.timeline.tomte = [];
            result.timeline.tomte.push({
              method: row.tomte.type,
              params: row.tomte.params
            });
          }
          if (row.goat) {
            if (!result.timeline.goat) result.timeline.goat = [];
            result.timeline.goat.push({
              method: row.goat.type,
              params: row.goat.params
            });
          }
        } else if (row.type === 'sync') {
          // Add sync point
          if (row.tomte) {
            if (!result.timeline.tomte) result.timeline.tomte = [];
            result.timeline.tomte.push({
              method: row.tomte.type,
              params: row.tomte.params
            });
          }
        }
      }
      
      return result;
    }
  };
  
  return runner;
})();
