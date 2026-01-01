/*
  Animation Runner Library
  
  Executes animation timelines defined in JSON format
*/

var AnimationRunner = (function() {
  'use strict';
  
  var runner = {
    /**
     * Load and play presentation from JSON
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
     * Create background from definition
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
     * Create character from definition
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
     * Play timeline
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
     * Execute action sequence on character
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
     * Convert timeline to JSON format
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
