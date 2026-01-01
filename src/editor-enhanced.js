/*
  Enhanced Presentation Script Editor with Undo/Redo and Live Preview
  
  Features:
  - Command pattern for undo/redo
  - Live preview integration with animation-runner
  - Timeline seeking/scrubbing
  - Real-time character updates
*/

var PresentationEditorEnhanced = (function() {
  'use strict';
  
  var editor = {
    presentation: null,
    timeline: [],
    currentRowIndex: -1,
    customActions: {},
    
    // Undo/Redo stacks
    undoStack: [],
    redoStack: [],
    maxUndoStackSize: 50,
    
    // Live preview state
    previewCanvas: null,
    previewRoot: null,
    previewCharacters: {},
    previewInstance: null,
    isPreviewPlaying: false,
    currentTimelinePosition: 0,
    
    /**
     * Initialize the enhanced editor
     */
    init: function(presentationInstance) {
      this.presentation = presentationInstance;
      this.setupUI();
      this.parseScript();
      this.bindEvents();
      this.initializePreview();
    },
    
    /**
     * Execute a command (for undo/redo)
     * @param {Object} command - Command object with execute() and undo() methods
     */
    executeCommand: function(command) {
      command.execute();
      this.undoStack.push(command);
      
      // Limit stack size
      if (this.undoStack.length > this.maxUndoStackSize) {
        this.undoStack.shift();
      }
      
      // Clear redo stack on new command
      this.redoStack = [];
      
      this.updateUndoRedoButtons();
      this.updatePreview();
    },
    
    /**
     * Undo last command
     */
    undo: function() {
      if (this.undoStack.length === 0) return;
      
      var command = this.undoStack.pop();
      command.undo();
      this.redoStack.push(command);
      
      this.renderTimeline();
      this.updateUndoRedoButtons();
      this.updatePreview();
    },
    
    /**
     * Redo last undone command
     */
    redo: function() {
      if (this.redoStack.length === 0) return;
      
      var command = this.redoStack.pop();
      command.execute();
      this.undoStack.push(command);
      
      this.renderTimeline();
      this.updateUndoRedoButtons();
      this.updatePreview();
    },
    
    /**
     * Update undo/redo button states
     */
    updateUndoRedoButtons: function() {
      var undoBtn = document.getElementById('undo-btn');
      var redoBtn = document.getElementById('redo-btn');
      
      if (undoBtn) {
        undoBtn.disabled = this.undoStack.length === 0;
        undoBtn.textContent = 'Undo (' + this.undoStack.length + ')';
      }
      if (redoBtn) {
        redoBtn.disabled = this.redoStack.length === 0;
        redoBtn.textContent = 'Redo (' + this.redoStack.length + ')';
      }
    },
    
    /**
     * Initialize live preview canvas
     */
    initializePreview: function() {
      var previewCanvasEl = document.getElementById('preview-canvas');
      if (!previewCanvasEl) return;
      
      try {
        this.previewCanvas = new Canvas(previewCanvasEl);
        this.previewCanvas.frameDuration = 30;
        this.previewCanvas.fixedTimestep = true;
        this.previewCanvas.clear = true;
        this.previewCanvas.playOnlyWhenFocused = false;
        
        this.previewRoot = new CanvasNode();
        this.previewCanvas.append(this.previewRoot);
        
        // Add background
        var bg = new CanvasNode();
        bg.zIndex = -1;
        bg.image = E.img('trees2.jpg');
        bg.size = [1024, 768];
        bg.position = [0, 0];
        this.previewRoot.append(bg);
        
        // Create preview characters
        this.previewCharacters.tomte = new Tomte();
        this.previewCharacters.goat = new Goat();
        
        this.previewRoot.append(this.previewCharacters.tomte);
        this.previewRoot.append(this.previewCharacters.goat);
        
        console.log('Live preview initialized');
      } catch (e) {
        console.warn('Failed to initialize preview:', e.message);
      }
    },
    
    /**
     * Update preview with current timeline
     */
    updatePreview: function() {
      if (!this.previewCharacters.tomte || !this.previewCharacters.goat) return;
      
      // Reset characters
      this.previewCharacters.tomte.reset();
      this.previewCharacters.goat.reset();
      
      // Execute timeline up to current position
      this.executeTimelineToPosition(this.currentTimelinePosition);
      
      this.updateTimelineSeeker();
    },
    
    /**
     * Execute timeline actions up to a specific position
     * @param {number} position - Row index to execute up to
     */
    executeTimelineToPosition: function(position) {
      if (!this.previewCharacters.tomte || !this.previewCharacters.goat) return;
      
      for (var i = 0; i <= position && i < this.timeline.length; i++) {
        var row = this.timeline[i];
        
        if (row.type === 'row') {
          // Execute actions for each character
          if (row.tomte) {
            this.executeAction(this.previewCharacters.tomte, row.tomte);
          }
          if (row.goat) {
            this.executeAction(this.previewCharacters.goat, row.goat);
          }
        }
        // Skip sync points for preview (they're timing-related)
      }
    },
    
    /**
     * Execute a single action on a character
     * @param {Object} character - Character object
     * @param {Object} action - Action object with type and params
     */
    executeAction: function(character, action) {
      if (!character || !action) return;
      
      var method = character[action.type];
      if (typeof method === 'function') {
        try {
          method.apply(character, action.params || []);
        } catch (e) {
          console.warn('Failed to execute action ' + action.type + ':', e.message);
        }
      }
    },
    
    /**
     * Seek to a specific timeline position
     * @param {number} position - Row index to seek to
     */
    seekTo: function(position) {
      if (position < 0 || position >= this.timeline.length) return;
      
      this.currentTimelinePosition = position;
      this.currentRowIndex = position;
      this.updatePreview();
      this.renderTimeline();
      this.loadActionEditor();
    },
    
    /**
     * Play timeline from current position
     */
    playTimeline: function() {
      if (this.isPreviewPlaying) return;
      
      this.isPreviewPlaying = true;
      var self = this;
      
      var playInterval = setInterval(function() {
        if (!self.isPreviewPlaying || self.currentTimelinePosition >= self.timeline.length - 1) {
          clearInterval(playInterval);
          self.isPreviewPlaying = false;
          self.updatePlayPauseButton();
          return;
        }
        
        self.seekTo(self.currentTimelinePosition + 1);
      }, 500); // Advance every 500ms for preview
      
      this.updatePlayPauseButton();
    },
    
    /**
     * Pause timeline playback
     */
    pauseTimeline: function() {
      this.isPreviewPlaying = false;
      this.updatePlayPauseButton();
    },
    
    /**
     * Update play/pause button state
     */
    updatePlayPauseButton: function() {
      var playBtn = document.getElementById('preview-play');
      if (playBtn) {
        playBtn.textContent = this.isPreviewPlaying ? 'Pause Preview' : 'Play Preview';
      }
    },
    
    /**
     * Update timeline seeker UI
     */
    updateTimelineSeeker: function() {
      var seeker = document.getElementById('timeline-seeker');
      if (seeker && this.timeline.length > 0) {
        seeker.max = this.timeline.length - 1;
        seeker.value = this.currentTimelinePosition;
      }
      
      var positionLabel = document.getElementById('timeline-position');
      if (positionLabel) {
        positionLabel.textContent = 'Position: ' + this.currentTimelinePosition + ' / ' + (this.timeline.length - 1);
      }
    },
    
    /**
     * Setup the enhanced editor UI
     */
    setupUI: function() {
      var editorPanel = document.createElement('div');
      editorPanel.id = 'presentation-editor';
      editorPanel.className = 'editor-panel';
      editorPanel.innerHTML = `
        <div class="editor-header">
          <h2>Enhanced Animation Timeline Editor</h2>
          <button id="toggle-editor" class="btn">Toggle Editor</button>
        </div>
        <div class="editor-content">
          <div class="editor-section">
            <h3>Live Preview</h3>
            <div class="preview-container">
              <canvas id="preview-canvas" width="512" height="384"></canvas>
            </div>
            <div class="preview-controls">
              <button id="preview-play" class="btn">Play Preview</button>
              <button id="preview-reset" class="btn">Reset Preview</button>
            </div>
            <div class="timeline-seeker-container">
              <label>
                <span id="timeline-position">Position: 0 / 0</span>
                <input type="range" id="timeline-seeker" class="timeline-slider" min="0" max="0" value="0" />
              </label>
            </div>
          </div>
          <div class="editor-section">
            <h3>Undo/Redo</h3>
            <div class="undo-redo-controls">
              <button id="undo-btn" class="btn" disabled>Undo (0)</button>
              <button id="redo-btn" class="btn" disabled>Redo (0)</button>
            </div>
          </div>
          <div class="editor-section">
            <h3>Timeline (Two-Column View)</h3>
            <div class="timeline-container">
              <div class="timeline-header">
                <div class="timeline-col">Tomte</div>
                <div class="timeline-col">Goat</div>
              </div>
              <div id="timeline-rows" class="timeline-rows"></div>
            </div>
            <div class="timeline-controls">
              <button id="add-row" class="btn">Add Row</button>
              <button id="add-sync" class="btn">Add Sync Point</button>
            </div>
          </div>
          <div class="editor-section">
            <h3>Edit Action</h3>
            <div id="action-editor" class="action-editor">
              <label>
                Column:
                <select id="action-column" class="form-control">
                  <option value="tomte">Tomte</option>
                  <option value="goat">Goat</option>
                  <option value="sync">Sync Point</option>
                </select>
              </label>
              <label>
                Action Type:
                <select id="action-type" class="form-control">
                  <optgroup label="Movement">
                    <option value="walkTo">Walk To</option>
                    <option value="isOffscreenLeft">Start Offscreen Left</option>
                    <option value="isOffscreenRight">Start Offscreen Right</option>
                    <option value="startRunningLeft">Start Running Left</option>
                    <option value="startRunningRight">Start Running Right</option>
                    <option value="stop">Stop</option>
                  </optgroup>
                  <optgroup label="Expressions">
                    <option value="plain">Plain</option>
                    <option value="smile">Smile</option>
                    <option value="angry">Angry</option>
                    <option value="surprised">Surprised</option>
                    <option value="bored">Bored</option>
                  </optgroup>
                  <optgroup label="Speech">
                    <option value="say">Say</option>
                  </optgroup>
                  <optgroup label="Timing">
                    <option value="wait">Wait</option>
                    <option value="waitFor">Wait For (Sync)</option>
                  </optgroup>
                  <optgroup label="Head">
                    <option value="lookLeft">Look Left</option>
                    <option value="lookRight">Look Right</option>
                    <option value="lookFront">Look Front</option>
                    <option value="headUpLeft">Head Up Left</option>
                    <option value="headDownLeft">Head Down Left</option>
                    <option value="headLevel">Head Level</option>
                  </optgroup>
                  <optgroup label="Actions">
                    <option value="wave">Wave</option>
                    <option value="takeOutMagicWand">Take Out Magic Wand</option>
                    <option value="putAwayMagicWand">Put Away Magic Wand</option>
                  </optgroup>
                  <optgroup label="Custom">
                    <option value="custom">Custom Action</option>
                  </optgroup>
                </select>
              </label>
              <div id="action-params" class="action-params"></div>
              <button id="save-action" class="btn">Save Action</button>
              <button id="delete-action" class="btn btn-danger">Delete Action</button>
            </div>
          </div>
          <div class="editor-section">
            <h3>Custom Actions</h3>
            <div class="custom-actions-section">
              <label>
                Action Name:
                <input type="text" id="custom-action-name" class="form-control" placeholder="myCustomAction" />
              </label>
              <label>
                Action Code:
                <textarea id="custom-action-code" class="form-control code-editor" rows="5" placeholder="function() { /* your code */ }"></textarea>
              </label>
              <button id="save-custom-action" class="btn">Save Custom Action</button>
              <div id="custom-actions-list" class="custom-actions-list"></div>
            </div>
          </div>
          <div class="editor-section">
            <h3>Controls</h3>
            <div class="controls">
              <button id="play-presentation" class="btn">Play</button>
              <button id="stop-presentation" class="btn">Stop</button>
              <button id="restart-presentation" class="btn">Restart</button>
              <button id="export-script" class="btn">Export Script</button>
              <button id="export-json" class="btn">Export JSON</button>
              <button id="import-script" class="btn">Import Script</button>
            </div>
          </div>
          <div class="editor-section">
            <h3>Keyboard Shortcuts</h3>
            <div class="shortcuts-info">
              <p><kbd>Ctrl+Z</kbd> - Undo</p>
              <p><kbd>Ctrl+Y</kbd> or <kbd>Ctrl+Shift+Z</kbd> - Redo</p>
              <p><kbd>Space</kbd> - Play/Pause Preview</p>
              <p><kbd>←</kbd> / <kbd>→</kbd> - Previous/Next Row</p>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(editorPanel);
      this.addEditorStyles();
    },
    
    /**
     * Add CSS styles for the enhanced editor
     */
    addEditorStyles: function() {
      var style = document.createElement('style');
      style.textContent = `
        .editor-panel {
          position: fixed;
          top: 0;
          right: -550px;
          width: 550px;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          color: #fff;
          padding: 20px;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
          transition: right 0.3s ease;
          z-index: 1000;
          font-family: Arial, sans-serif;
          font-size: 13px;
        }
        
        .editor-panel.open {
          right: 0;
        }
        
        .editor-header {
          margin-bottom: 20px;
          border-bottom: 1px solid #444;
          padding-bottom: 10px;
        }
        
        .editor-header h2 {
          margin: 0 0 10px 0;
          color: #fff;
          font-size: 16px;
          letter-spacing: normal;
        }
        
        .editor-section {
          margin-bottom: 25px;
        }
        
        .editor-section h3 {
          color: #fff;
          margin-bottom: 10px;
          font-size: 14px;
          margin-left: 0;
        }
        
        .preview-container {
          background: #000;
          border: 2px solid #444;
          border-radius: 4px;
          margin-bottom: 10px;
          overflow: hidden;
        }
        
        #preview-canvas {
          display: block;
          width: 100%;
          height: auto;
        }
        
        .preview-controls, .undo-redo-controls {
          display: flex;
          gap: 5px;
          margin-bottom: 10px;
        }
        
        .timeline-seeker-container {
          margin: 10px 0;
        }
        
        .timeline-slider {
          width: 100%;
          height: 6px;
          margin-top: 8px;
          background: #333;
          outline: none;
          cursor: pointer;
        }
        
        .timeline-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #4CAF50;
          cursor: pointer;
          border-radius: 50%;
        }
        
        .timeline-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #4CAF50;
          cursor: pointer;
          border-radius: 50%;
          border: none;
        }
        
        .btn {
          background: #4CAF50;
          color: white;
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 4px 4px 4px 0;
          font-size: 13px;
        }
        
        .btn:hover:not(:disabled) {
          background: #45a049;
        }
        
        .btn:disabled {
          background: #666;
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .btn-danger {
          background: #f44336;
        }
        
        .btn-danger:hover {
          background: #da190b;
        }
        
        .form-control {
          width: 100%;
          padding: 6px;
          margin: 5px 0 12px 0;
          background: #333;
          border: 1px solid #555;
          color: #fff;
          border-radius: 4px;
          font-size: 13px;
        }
        
        .code-editor {
          font-family: 'Courier New', monospace;
          font-size: 12px;
        }
        
        .timeline-container {
          background: #222;
          border: 1px solid #444;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        
        .timeline-header {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #555;
          font-weight: bold;
          text-align: center;
        }
        
        .timeline-col {
          padding: 8px;
          background: #333;
        }
        
        .timeline-rows {
          max-height: 300px;
          overflow-y: auto;
        }
        
        .timeline-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1px;
          background: #444;
          border-bottom: 1px solid #444;
          cursor: pointer;
        }
        
        .timeline-row:hover {
          background: #555;
        }
        
        .timeline-row.active {
          background: #4CAF50;
        }
        
        .timeline-row.sync-row {
          grid-template-columns: 1fr;
          background: #5555ff;
        }
        
        .timeline-cell {
          padding: 6px 8px;
          background: #333;
          min-height: 30px;
          font-size: 12px;
        }
        
        .timeline-cell.sync-cell {
          background: #4444dd;
          text-align: center;
          font-weight: bold;
        }
        
        .timeline-cell.empty {
          opacity: 0.5;
        }
        
        .timeline-controls, .controls {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        
        label {
          display: block;
          margin-bottom: 10px;
          font-size: 13px;
        }
        
        .action-params {
          margin: 12px 0;
        }
        
        .action-params label {
          margin-bottom: 12px;
        }
        
        .custom-actions-list {
          margin-top: 10px;
          max-height: 150px;
          overflow-y: auto;
        }
        
        .custom-action-item {
          padding: 6px;
          background: #333;
          margin: 3px 0;
          border-radius: 3px;
          font-size: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .custom-action-item .btn {
          padding: 3px 8px;
          font-size: 11px;
          margin: 0;
        }
        
        .shortcuts-info {
          font-size: 12px;
          color: #aaa;
        }
        
        .shortcuts-info p {
          margin: 5px 0;
        }
        
        kbd {
          background: #333;
          border: 1px solid #555;
          border-radius: 3px;
          padding: 2px 6px;
          font-family: monospace;
          font-size: 11px;
        }
      `;
      document.head.appendChild(style);
    },
    
    /**
     * Parse the presentation script into timeline format
     */
    parseScript: function() {
      // Initialize with example timeline
      this.timeline = [
        { type: 'row', tomte: { type: 'wait', params: [100] }, goat: { type: 'wait', params: [100] } },
        { type: 'row', tomte: { type: 'isOffscreenRight', params: [] }, goat: { type: 'isOffscreenLeft', params: [] } },
        { type: 'row', tomte: { type: 'plain', params: [] }, goat: { type: 'plain', params: [] } },
        { type: 'row', tomte: { type: 'walkTo', params: [700, 690] }, goat: { type: 'walkTo', params: [324, 580] } },
        { type: 'row', tomte: { type: 'say', params: ["Hi, I'm Tomte!"] }, goat: { type: 'say', params: ["And I'm Goat!"] } },
        { type: 'sync', label: 'goat2', tomte: { type: 'waitFor', params: ['goat2'] }, goat: null }
      ];
      
      this.renderTimeline();
      this.updateTimelineSeeker();
    },
    
    /**
     * Render the timeline view
     */
    renderTimeline: function() {
      var timelineRows = document.getElementById('timeline-rows');
      if (!timelineRows) return;
      
      timelineRows.innerHTML = '';
      
      this.timeline.forEach(function(row, index) {
        var rowDiv = document.createElement('div');
        
        if (row.type === 'sync') {
          rowDiv.className = 'timeline-row sync-row';
          if (index === this.currentRowIndex) {
            rowDiv.className += ' active';
          }
          var syncCell = document.createElement('div');
          syncCell.className = 'timeline-cell sync-cell';
          syncCell.textContent = '⚡ SYNC: ' + (row.label || 'unnamed');
          rowDiv.appendChild(syncCell);
        } else {
          rowDiv.className = 'timeline-row';
          if (index === this.currentRowIndex) {
            rowDiv.className += ' active';
          }
          
          // Tomte column
          var tomteCell = document.createElement('div');
          tomteCell.className = 'timeline-cell';
          if (row.tomte) {
            var text = row.tomte.type;
            if (row.tomte.params && row.tomte.params.length > 0) {
              text += '(' + row.tomte.params.join(', ') + ')';
            }
            tomteCell.textContent = text;
          } else {
            tomteCell.className += ' empty';
            tomteCell.textContent = '—';
          }
          rowDiv.appendChild(tomteCell);
          
          // Goat column
          var goatCell = document.createElement('div');
          goatCell.className = 'timeline-cell';
          if (row.goat) {
            var text = row.goat.type;
            if (row.goat.params && row.goat.params.length > 0) {
              text += '(' + row.goat.params.join(', ') + ')';
            }
            goatCell.textContent = text;
          } else {
            goatCell.className += ' empty';
            goatCell.textContent = '—';
          }
          rowDiv.appendChild(goatCell);
        }
        
        rowDiv.dataset.index = index;
        timelineRows.appendChild(rowDiv);
      }.bind(this));
      
      this.renderCustomActions();
    },
    
    /**
     * Render custom actions list
     */
    renderCustomActions: function() {
      var list = document.getElementById('custom-actions-list');
      if (!list) return;
      
      list.innerHTML = '';
      
      for (var name in this.customActions) {
        var item = document.createElement('div');
        item.className = 'custom-action-item';
        item.innerHTML = `
          <span>${name}</span>
          <button class="btn btn-danger delete-custom-action" data-name="${name}">Delete</button>
        `;
        list.appendChild(item);
      }
    },
    
    /**
     * Bind event handlers
     */
    bindEvents: function() {
      var self = this;
      
      // Toggle editor
      var toggleBtn = document.getElementById('toggle-editor');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
          var panel = document.getElementById('presentation-editor');
          panel.classList.toggle('open');
        });
      }
      
      // Undo/Redo buttons
      var undoBtn = document.getElementById('undo-btn');
      if (undoBtn) {
        undoBtn.addEventListener('click', function() {
          self.undo();
        });
      }
      
      var redoBtn = document.getElementById('redo-btn');
      if (redoBtn) {
        redoBtn.addEventListener('click', function() {
          self.redo();
        });
      }
      
      // Keyboard shortcuts
      document.addEventListener('keydown', function(e) {
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          self.undo();
        }
        // Ctrl+Y or Ctrl+Shift+Z for redo
        if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
          e.preventDefault();
          self.redo();
        }
        // Space for play/pause
        if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          if (self.isPreviewPlaying) {
            self.pauseTimeline();
          } else {
            self.playTimeline();
          }
        }
        // Left/Right arrows for navigation
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (self.currentTimelinePosition > 0) {
            self.seekTo(self.currentTimelinePosition - 1);
          }
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (self.currentTimelinePosition < self.timeline.length - 1) {
            self.seekTo(self.currentTimelinePosition + 1);
          }
        }
      });
      
      // Preview controls
      var previewPlayBtn = document.getElementById('preview-play');
      if (previewPlayBtn) {
        previewPlayBtn.addEventListener('click', function() {
          if (self.isPreviewPlaying) {
            self.pauseTimeline();
          } else {
            self.playTimeline();
          }
        });
      }
      
      var previewResetBtn = document.getElementById('preview-reset');
      if (previewResetBtn) {
        previewResetBtn.addEventListener('click', function() {
          self.pauseTimeline();
          self.seekTo(0);
        });
      }
      
      // Timeline seeker
      var seeker = document.getElementById('timeline-seeker');
      if (seeker) {
        seeker.addEventListener('input', function() {
          self.seekTo(parseInt(this.value));
        });
      }
      
      // Timeline row selection
      var timelineRows = document.getElementById('timeline-rows');
      if (timelineRows) {
        timelineRows.addEventListener('click', function(e) {
          var row = e.target.closest('.timeline-row');
          if (row) {
            var index = parseInt(row.dataset.index);
            self.seekTo(index);
          }
        });
      }
      
      // Add row with undo/redo
      var addRowBtn = document.getElementById('add-row');
      if (addRowBtn) {
        addRowBtn.addEventListener('click', function() {
          self.addRowCommand();
        });
      }
      
      // Add sync point with undo/redo
      var addSyncBtn = document.getElementById('add-sync');
      if (addSyncBtn) {
        addSyncBtn.addEventListener('click', function() {
          self.addSyncPointCommand();
        });
      }
      
      // Save action with undo/redo
      var saveActionBtn = document.getElementById('save-action');
      if (saveActionBtn) {
        saveActionBtn.addEventListener('click', function() {
          self.saveActionCommand();
        });
      }
      
      // Delete action with undo/redo
      var deleteActionBtn = document.getElementById('delete-action');
      if (deleteActionBtn) {
        deleteActionBtn.addEventListener('click', function() {
          self.deleteActionCommand();
        });
      }
      
      // Action type change
      var actionTypeSelect = document.getElementById('action-type');
      if (actionTypeSelect) {
        actionTypeSelect.addEventListener('change', function() {
          self.updateActionParams();
        });
      }
      
      // Column change
      var columnSelect = document.getElementById('action-column');
      if (columnSelect) {
        columnSelect.addEventListener('change', function() {
          self.updateActionParams();
        });
      }
      
      // Custom action save
      var saveCustomBtn = document.getElementById('save-custom-action');
      if (saveCustomBtn) {
        saveCustomBtn.addEventListener('click', function() {
          self.saveCustomAction();
        });
      }
      
      // Custom action delete
      var customActionsList = document.getElementById('custom-actions-list');
      if (customActionsList) {
        customActionsList.addEventListener('click', function(e) {
          if (e.target.classList.contains('delete-custom-action')) {
            var name = e.target.dataset.name;
            self.deleteCustomAction(name);
          }
        });
      }
      
      // Play/Stop/Restart original presentation
      var playBtn = document.getElementById('play-presentation');
      if (playBtn) {
        playBtn.addEventListener('click', function() {
          if (self.presentation && self.presentation.canvas) {
            self.presentation.canvas.play();
          }
        });
      }
      
      var stopBtn = document.getElementById('stop-presentation');
      if (stopBtn) {
        stopBtn.addEventListener('click', function() {
          if (self.presentation && self.presentation.canvas) {
            self.presentation.canvas.stop();
          }
        });
      }
      
      var restartBtn = document.getElementById('restart-presentation');
      if (restartBtn) {
        restartBtn.addEventListener('click', function() {
          window.location.reload();
        });
      }
      
      // Export/Import
      var exportBtn = document.getElementById('export-script');
      if (exportBtn) {
        exportBtn.addEventListener('click', function() {
          self.exportScript();
        });
      }
      
      var exportJsonBtn = document.getElementById('export-json');
      if (exportJsonBtn) {
        exportJsonBtn.addEventListener('click', function() {
          self.exportJSON();
        });
      }
      
      var importBtn = document.getElementById('import-script');
      if (importBtn) {
        importBtn.addEventListener('click', function() {
          self.importScript();
        });
      }
    },
    
    /**
     * Command: Add Row
     */
    addRowCommand: function() {
      var self = this;
      var newRow = { 
        type: 'row', 
        tomte: { type: 'wait', params: [1000] }, 
        goat: { type: 'wait', params: [1000] } 
      };
      
      var command = {
        execute: function() {
          self.timeline.push(newRow);
          self.currentRowIndex = self.timeline.length - 1;
          self.renderTimeline();
          self.loadActionEditor();
        },
        undo: function() {
          self.timeline.pop();
          self.currentRowIndex = Math.max(0, self.timeline.length - 1);
          self.renderTimeline();
          self.loadActionEditor();
        }
      };
      
      this.executeCommand(command);
    },
    
    /**
     * Command: Add Sync Point
     */
    addSyncPointCommand: function() {
      var self = this;
      var label = prompt('Enter sync point label:', 'sync' + Date.now());
      if (!label) return;
      
      var newSync = {
        type: 'sync',
        label: label,
        tomte: { type: 'waitFor', params: [label] },
        goat: null
      };
      
      var command = {
        execute: function() {
          self.timeline.push(newSync);
          self.currentRowIndex = self.timeline.length - 1;
          self.renderTimeline();
          self.loadActionEditor();
        },
        undo: function() {
          self.timeline.pop();
          self.currentRowIndex = Math.max(0, self.timeline.length - 1);
          self.renderTimeline();
          self.loadActionEditor();
        }
      };
      
      this.executeCommand(command);
    },
    
    /**
     * Command: Save Action
     */
    saveActionCommand: function() {
      if (this.currentRowIndex < 0 || this.currentRowIndex >= this.timeline.length) return;
      
      var self = this;
      var column = document.getElementById('action-column').value;
      var type = document.getElementById('action-type').value;
      var params = [];
      
      document.querySelectorAll('.param-input').forEach(function(input) {
        var val = input.type === 'number' ? parseFloat(input.value) : input.value;
        params.push(val);
      });
      
      var newAction = { type: type, params: params };
      var oldRow = JSON.parse(JSON.stringify(this.timeline[this.currentRowIndex]));
      var rowIndex = this.currentRowIndex;
      
      var command = {
        execute: function() {
          if (column === 'tomte') {
            self.timeline[rowIndex].tomte = newAction;
          } else if (column === 'goat') {
            self.timeline[rowIndex].goat = newAction;
          }
          self.renderTimeline();
        },
        undo: function() {
          self.timeline[rowIndex] = oldRow;
          self.renderTimeline();
        }
      };
      
      this.executeCommand(command);
    },
    
    /**
     * Command: Delete Action
     */
    deleteActionCommand: function() {
      if (this.currentRowIndex < 0 || this.currentRowIndex >= this.timeline.length) return;
      
      var self = this;
      var rowIndex = this.currentRowIndex;
      var deletedRow = JSON.parse(JSON.stringify(this.timeline[rowIndex]));
      
      var command = {
        execute: function() {
          self.timeline.splice(rowIndex, 1);
          self.currentRowIndex = Math.max(0, Math.min(rowIndex, self.timeline.length - 1));
          self.renderTimeline();
          self.loadActionEditor();
        },
        undo: function() {
          self.timeline.splice(rowIndex, 0, deletedRow);
          self.currentRowIndex = rowIndex;
          self.renderTimeline();
          self.loadActionEditor();
        }
      };
      
      this.executeCommand(command);
    },
    
    /**
     * Load action into editor
     */
    loadActionEditor: function() {
      if (this.currentRowIndex < 0 || this.currentRowIndex >= this.timeline.length) return;
      
      var row = this.timeline[this.currentRowIndex];
      
      if (row.type === 'sync') {
        document.getElementById('action-column').value = 'sync';
        document.getElementById('action-type').value = 'waitFor';
      } else {
        if (row.tomte) {
          document.getElementById('action-column').value = 'tomte';
          document.getElementById('action-type').value = row.tomte.type;
        } else if (row.goat) {
          document.getElementById('action-column').value = 'goat';
          document.getElementById('action-type').value = row.goat.type;
        }
      }
      
      this.updateActionParams();
      
      var column = document.getElementById('action-column').value;
      var action = row.type === 'sync' ? row.tomte : row[column];
      
      if (action && action.params) {
        var params = document.querySelectorAll('.param-input');
        action.params.forEach(function(param, i) {
          if (params[i]) {
            params[i].value = param;
          }
        });
      }
    },
    
    /**
     * Update action parameters UI
     */
    updateActionParams: function() {
      var type = document.getElementById('action-type').value;
      var paramsDiv = document.getElementById('action-params');
      paramsDiv.innerHTML = '';
      
      var paramConfig = {
        'walkTo': [
          { name: 'x', type: 'number', label: 'X Position' },
          { name: 'y', type: 'number', label: 'Y Position' }
        ],
        'say': [
          { name: 'text', type: 'text', label: 'Text to Say' }
        ],
        'wait': [
          { name: 'duration', type: 'number', label: 'Duration (ms)' }
        ],
        'waitFor': [
          { name: 'label', type: 'text', label: 'Sync Point Label' }
        ],
        'custom': [
          { name: 'actionName', type: 'text', label: 'Custom Action Name' }
        ]
      };
      
      var params = paramConfig[type] || [];
      params.forEach(function(param) {
        var label = document.createElement('label');
        label.textContent = param.label + ':';
        var input = document.createElement('input');
        input.type = param.type;
        input.className = 'form-control param-input';
        input.dataset.paramName = param.name;
        label.appendChild(input);
        paramsDiv.appendChild(label);
      });
    },
    
    /**
     * Save custom action
     */
    saveCustomAction: function() {
      var name = document.getElementById('custom-action-name').value;
      var code = document.getElementById('custom-action-code').value;
      
      if (!name || !code) {
        alert('Please provide both name and code for the custom action.');
        return;
      }
      
      this.customActions[name] = code;
      this.renderCustomActions();
      
      document.getElementById('custom-action-name').value = '';
      document.getElementById('custom-action-code').value = '';
    },
    
    /**
     * Delete custom action
     */
    deleteCustomAction: function(name) {
      if (confirm('Delete custom action "' + name + '"?')) {
        delete this.customActions[name];
        this.renderCustomActions();
      }
    },
    
    /**
     * Export script
     */
    exportScript: function() {
      var script = this.generateScript();
      var blob = new Blob([script], { type: 'text/javascript' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'presentation-script.js';
      a.click();
      URL.revokeObjectURL(url);
    },
    
    /**
     * Generate JavaScript script from timeline
     */
    generateScript: function() {
      var script = '// Generated Presentation Script\n\n';
      
      // Add custom actions
      for (var name in this.customActions) {
        script += 'var ' + name + ' = ' + this.customActions[name] + ';\n';
      }
      script += '\n';
      
      // Generate timeline execution
      script += '// Tomte timeline\nthis.tomte\n';
      this.timeline.forEach(function(row) {
        if (row.type === 'row' && row.tomte) {
          var params = row.tomte.params.map(function(p) {
            return typeof p === 'string' ? '"' + p + '"' : p;
          }).join(', ');
          script += '  .' + row.tomte.type + '(' + params + ')\n';
        }
      });
      
      script += ';\n\n// Goat timeline\nthis.goat\n';
      this.timeline.forEach(function(row) {
        if (row.type === 'row' && row.goat) {
          var params = row.goat.params.map(function(p) {
            return typeof p === 'string' ? '"' + p + '"' : p;
          }).join(', ');
          script += '  .' + row.goat.type + '(' + params + ')\n';
        }
      });
      script += ';\n';
      
      return script;
    },
    
    /**
     * Export JSON
     */
    exportJSON: function() {
      var json = {
        title: 'Canvas Animation Presentation',
        settings: {
          frameDuration: 30,
          fixedTimestep: true,
          width: 1024,
          height: 768
        },
        background: {
          type: 'image',
          src: 'trees2.jpg',
          zIndex: -1
        },
        characters: [
          {
            name: 'tomte',
            type: 'Tomte',
            position: { x: 0, y: 0 }
          },
          {
            name: 'goat',
            type: 'Goat',
            position: { x: 0, y: 0 }
          }
        ],
        timeline: this.timelineToJSON(),
        customActions: this.customActions
      };
      
      var blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'presentation.json';
      a.click();
      URL.revokeObjectURL(url);
    },
    
    /**
     * Convert timeline to JSON format
     */
    timelineToJSON: function() {
      var json = {
        tomte: [],
        goat: []
      };
      
      this.timeline.forEach(function(row) {
        if (row.type === 'row') {
          if (row.tomte) {
            json.tomte.push({
              method: row.tomte.type,
              params: row.tomte.params || []
            });
          }
          if (row.goat) {
            json.goat.push({
              method: row.goat.type,
              params: row.goat.params || []
            });
          }
        }
      });
      
      return json;
    },
    
    /**
     * Import script (simplified - user can paste JSON)
     */
    importScript: function() {
      var json = prompt('Paste JSON timeline:');
      if (!json) return;
      
      try {
        var data = JSON.parse(json);
        if (data.timeline) {
          // Convert JSON timeline to editor format
          this.timeline = [];
          var maxLength = Math.max(
            data.timeline.tomte ? data.timeline.tomte.length : 0,
            data.timeline.goat ? data.timeline.goat.length : 0
          );
          
          for (var i = 0; i < maxLength; i++) {
            var row = { type: 'row', tomte: null, goat: null };
            
            if (data.timeline.tomte && data.timeline.tomte[i]) {
              row.tomte = {
                type: data.timeline.tomte[i].method,
                params: data.timeline.tomte[i].params || []
              };
            }
            
            if (data.timeline.goat && data.timeline.goat[i]) {
              row.goat = {
                type: data.timeline.goat[i].method,
                params: data.timeline.goat[i].params || []
              };
            }
            
            this.timeline.push(row);
          }
          
          if (data.customActions) {
            this.customActions = data.customActions;
          }
          
          this.renderTimeline();
          this.updatePreview();
        }
      } catch (e) {
        alert('Invalid JSON: ' + e.message);
      }
    }
  };
  
  return editor;
})();
