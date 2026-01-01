/*
  Presentation Script Editor for Canvas Animation
  
  Unified two-column timeline editor with sync points and custom action support
*/

var PresentationEditor = (function() {
  'use strict';
  
  var editor = {
    presentation: null,
    timeline: [],
    currentRowIndex: -1,
    customActions: {},
    
    /**
     * Initialize the editor
     */
    init: function(presentationInstance) {
      this.presentation = presentationInstance;
      this.setupUI();
      this.parseScript();
      this.bindEvents();
    },
    
    /**
     * Setup the editor UI with two-column timeline
     */
    setupUI: function() {
      var editorPanel = document.createElement('div');
      editorPanel.id = 'presentation-editor';
      editorPanel.className = 'editor-panel';
      editorPanel.innerHTML = `
        <div class="editor-header">
          <h2>Animation Timeline Editor</h2>
          <button id="toggle-editor" class="btn">Toggle Editor</button>
        </div>
        <div class="editor-content">
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
        </div>
      `;
      
      document.body.appendChild(editorPanel);
      this.addEditorStyles();
    },
    
    /**
     * Add CSS styles for the editor
     */
    addEditorStyles: function() {
      var style = document.createElement('style');
      style.textContent = `
        .editor-panel {
          position: fixed;
          top: 0;
          right: -500px;
          width: 500px;
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
          font-size: 18px;
        }
        
        .editor-section {
          margin-bottom: 25px;
        }
        
        .editor-section h3 {
          color: #fff;
          margin-bottom: 10px;
          font-size: 15px;
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
        
        .btn:hover {
          background: #45a049;
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
        
        .timeline-controls {
          display: flex;
          gap: 5px;
        }
        
        .controls {
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
      `;
      document.head.appendChild(style);
    },
    
    /**
     * Parse the presentation script into timeline format
     */
    parseScript: function() {
      // Initialize with example timeline - unified two-column structure
      this.timeline = [
        { type: 'row', tomte: { type: 'wait', params: [100] }, goat: { type: 'wait', params: [100] } },
        { type: 'row', tomte: { type: 'isOffscreenRight', params: [] }, goat: { type: 'isOffscreenLeft', params: [] } },
        { type: 'row', tomte: { type: 'plain', params: [] }, goat: { type: 'plain', params: [] } },
        { type: 'row', tomte: { type: 'walkTo', params: [700, 690] }, goat: { type: 'walkTo', params: [324, 580] } },
        { type: 'row', tomte: { type: 'say', params: ["Hi, I'm Tomte!"] }, goat: { type: 'say', params: ["And I'm Goat!"] } },
        { type: 'sync', label: 'goat2', tomte: { type: 'waitFor', params: ['goat2'] }, goat: null }
      ];
      
      this.renderTimeline();
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
      
      // Timeline row selection
      var timelineRows = document.getElementById('timeline-rows');
      if (timelineRows) {
        timelineRows.addEventListener('click', function(e) {
          var row = e.target.closest('.timeline-row');
          if (row) {
            var index = parseInt(row.dataset.index);
            self.selectRow(index);
          }
        });
      }
      
      // Add row
      var addRowBtn = document.getElementById('add-row');
      if (addRowBtn) {
        addRowBtn.addEventListener('click', function() {
          self.addRow();
        });
      }
      
      // Add sync point
      var addSyncBtn = document.getElementById('add-sync');
      if (addSyncBtn) {
        addSyncBtn.addEventListener('click', function() {
          self.addSyncPoint();
        });
      }
      
      // Save action
      var saveActionBtn = document.getElementById('save-action');
      if (saveActionBtn) {
        saveActionBtn.addEventListener('click', function() {
          self.saveAction();
        });
      }
      
      // Delete action
      var deleteActionBtn = document.getElementById('delete-action');
      if (deleteActionBtn) {
        deleteActionBtn.addEventListener('click', function() {
          self.deleteAction();
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
      
      // Custom action delete (delegated event)
      var customActionsList = document.getElementById('custom-actions-list');
      if (customActionsList) {
        customActionsList.addEventListener('click', function(e) {
          if (e.target.classList.contains('delete-custom-action')) {
            var name = e.target.dataset.name;
            self.deleteCustomAction(name);
          }
        });
      }
      
      // Play/Stop/Restart
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
     * Select a timeline row
     */
    selectRow: function(index) {
      this.currentRowIndex = index;
      this.renderTimeline();
      this.loadActionEditor();
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
        // Default to tomte if it has an action
        if (row.tomte) {
          document.getElementById('action-column').value = 'tomte';
          document.getElementById('action-type').value = row.tomte.type;
        } else if (row.goat) {
          document.getElementById('action-column').value = 'goat';
          document.getElementById('action-type').value = row.goat.type;
        }
      }
      
      this.updateActionParams();
      
      // Fill in parameter values
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
      var column = document.getElementById('action-column').value;
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
     * Add new row
     */
    addRow: function() {
      var newRow = { 
        type: 'row', 
        tomte: { type: 'wait', params: [1000] }, 
        goat: { type: 'wait', params: [1000] } 
      };
      this.timeline.push(newRow);
      this.currentRowIndex = this.timeline.length - 1;
      this.renderTimeline();
      this.loadActionEditor();
    },
    
    /**
     * Add sync point
     */
    addSyncPoint: function() {
      var label = prompt('Enter sync point label:', 'sync' + Date.now());
      if (label) {
        var newRow = { 
          type: 'sync', 
          label: label,
          tomte: { type: 'waitFor', params: [label] },
          goat: null
        };
        this.timeline.push(newRow);
        this.currentRowIndex = this.timeline.length - 1;
        this.renderTimeline();
        this.loadActionEditor();
      }
    },
    
    /**
     * Save current action
     */
    saveAction: function() {
      if (this.currentRowIndex < 0 || this.currentRowIndex >= this.timeline.length) return;
      
      var row = this.timeline[this.currentRowIndex];
      var column = document.getElementById('action-column').value;
      var type = document.getElementById('action-type').value;
      var params = [];
      
      var inputs = document.querySelectorAll('.param-input');
      inputs.forEach(function(input) {
        var value = input.type === 'number' ? parseFloat(input.value) || 0 : input.value;
        params.push(value);
      });
      
      if (column === 'sync') {
        row.type = 'sync';
        row.label = params[0] || 'unnamed';
        row.tomte = { type: 'waitFor', params: params };
        row.goat = null;
      } else {
        if (row.type === 'sync') {
          row.type = 'row';
        }
        row[column] = { type: type, params: params };
      }
      
      this.renderTimeline();
      alert('Action saved! Restart presentation to see changes.');
    },
    
    /**
     * Delete current action
     */
    deleteAction: function() {
      if (this.currentRowIndex < 0 || this.currentRowIndex >= this.timeline.length) return;
      
      if (confirm('Delete this row?')) {
        this.timeline.splice(this.currentRowIndex, 1);
        this.currentRowIndex = -1;
        this.renderTimeline();
      }
    },
    
    /**
     * Save custom action
     */
    saveCustomAction: function() {
      var name = document.getElementById('custom-action-name').value.trim();
      var code = document.getElementById('custom-action-code').value.trim();
      
      if (!name) {
        alert('Please enter an action name');
        return;
      }
      
      if (!code) {
        alert('Please enter action code');
        return;
      }
      
      try {
        // Validate that it's a function
        var fn = eval('(' + code + ')');
        if (typeof fn !== 'function') {
          throw new Error('Code must be a function');
        }
        
        this.customActions[name] = code;
        document.getElementById('custom-action-name').value = '';
        document.getElementById('custom-action-code').value = '';
        this.renderCustomActions();
        alert('Custom action "' + name + '" saved!');
      } catch (e) {
        alert('Invalid function code: ' + e.message);
      }
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
     * Export to JSON presentation format
     */
    exportJSON: function() {
      var presentation = {
        title: "Canvas Animation Presentation",
        settings: {
          frameDuration: 30,
          fixedTimestep: true,
          clear: true,
          playOnlyWhenFocused: false,
          width: 1024,
          height: 768
        },
        background: {
          type: "image",
          src: "trees2.jpg",
          zIndex: -1,
          visible: false
        },
        characters: [
          {
            name: "tomte",
            type: "Tomte",
            position: { x: 0, y: 0 }
          },
          {
            name: "goat",
            type: "Goat",
            position: { x: 0, y: 0 }
          }
        ],
        timeline: {},
        customActions: this.customActions
      };
      
      // Convert timeline to JSON format
      var tomteActions = [];
      var goatActions = [];
      
      this.timeline.forEach(function(row) {
        if (row.type === 'sync') {
          if (row.tomte) {
            tomteActions.push({
              method: row.tomte.type,
              params: row.tomte.params
            });
          }
        } else {
          if (row.tomte) {
            tomteActions.push({
              method: row.tomte.type,
              params: row.tomte.params
            });
          }
          if (row.goat) {
            goatActions.push({
              method: row.goat.type,
              params: row.goat.params
            });
          }
        }
      });
      
      presentation.timeline.tomte = tomteActions;
      presentation.timeline.goat = goatActions;
      
      var json = JSON.stringify(presentation, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'presentation.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    /**
     * Export script to JavaScript
     */
    exportScript: function() {
      var script = '// Custom Actions\n';
      for (var name in this.customActions) {
        script += 'var ' + name + ' = ' + this.customActions[name] + ';\n';
      }
      script += '\n// Presentation Script\n';
      script += '// Two-column timeline with sync points\n\n';
      
      var tomteScript = 'this.tomte\n';
      var goatScript = 'this.goat\n';
      
      this.timeline.forEach(function(row, index) {
        if (row.type === 'sync') {
          script += '\n// SYNC POINT: ' + row.label + '\n';
          if (row.tomte) {
            var params = row.tomte.params.map(function(p) {
              return typeof p === 'string' ? '"' + p + '"' : p;
            }).join(', ');
            tomteScript += '  .' + row.tomte.type + '(' + params + ')\n';
          }
        } else {
          if (row.tomte) {
            var params = row.tomte.params.map(function(p) {
              return typeof p === 'string' ? '"' + p + '"' : p;
            }).join(', ');
            tomteScript += '  .' + row.tomte.type + '(' + params + ')\n';
          }
          if (row.goat) {
            var params = row.goat.params.map(function(p) {
              return typeof p === 'string' ? '"' + p + '"' : p;
            }).join(', ');
            goatScript += '  .' + row.goat.type + '(' + params + ')\n';
          }
        }
      });
      
      script += tomteScript + '\n\n' + goatScript;
      
      var blob = new Blob([script], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'presentation-timeline.js';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    /**
     * Import script from JSON
     */
    importScript: function() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function(event) {
            try {
              var data = JSON.parse(event.target.result);
              this.timeline = data.timeline || [];
              this.customActions = data.customActions || {};
              this.renderTimeline();
              this.renderCustomActions();
              alert('Timeline imported successfully! Restart to see changes.');
            } catch (error) {
              alert('Error importing timeline: ' + error.message);
            }
          }.bind(this);
          reader.readAsText(file);
        }
      }.bind(this));
      input.click();
    }
  };
  
  return editor;
})();
