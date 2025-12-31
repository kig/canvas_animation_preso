/*
  Presentation Script Editor for Canvas Animation
  
  Allows editing the animation scripts for Tomte and Goat characters
*/

var PresentationEditor = (function() {
  'use strict';
  
  var editor = {
    presentation: null,
    scriptCommands: [],
    currentCommandIndex: -1,
    
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
     * Setup the editor UI
     */
    setupUI: function() {
      var editorPanel = document.createElement('div');
      editorPanel.id = 'presentation-editor';
      editorPanel.className = 'editor-panel';
      editorPanel.innerHTML = `
        <div class="editor-header">
          <h2>Animation Script Editor</h2>
          <button id="toggle-editor" class="btn">Toggle Editor</button>
        </div>
        <div class="editor-content">
          <div class="editor-section">
            <h3>Script Commands</h3>
            <div class="char-tabs">
              <button id="tab-tomte" class="tab-btn active">Tomte</button>
              <button id="tab-goat" class="tab-btn">Goat</button>
            </div>
            <div id="commands-list" class="commands-list"></div>
            <button id="add-command" class="btn">Add Command</button>
          </div>
          <div class="editor-section">
            <h3>Edit Command</h3>
            <div id="command-editor" class="command-editor">
              <label>
                Command Type:
                <select id="command-type" class="form-control">
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
                </select>
              </label>
              <div id="command-params" class="command-params"></div>
              <button id="save-command" class="btn">Save Command</button>
              <button id="delete-command" class="btn btn-danger">Delete Command</button>
            </div>
          </div>
          <div class="editor-section">
            <h3>Controls</h3>
            <div class="controls">
              <button id="play-presentation" class="btn">Play</button>
              <button id="stop-presentation" class="btn">Stop</button>
              <button id="restart-presentation" class="btn">Restart</button>
              <button id="export-script" class="btn">Export Script</button>
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
          right: -400px;
          width: 400px;
          height: 100%;
          background: rgba(0, 0, 0, 0.95);
          color: #fff;
          padding: 20px;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
          transition: right 0.3s ease;
          z-index: 1000;
          font-family: Arial, sans-serif;
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
          margin-bottom: 30px;
        }
        
        .editor-section h3 {
          color: #fff;
          margin-bottom: 10px;
          font-size: 16px;
        }
        
        .btn {
          background: #4CAF50;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px 5px 5px 0;
          font-size: 14px;
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
          padding: 8px;
          margin: 5px 0 15px 0;
          background: #333;
          border: 1px solid #555;
          color: #fff;
          border-radius: 4px;
        }
        
        .commands-list {
          max-height: 300px;
          overflow-y: auto;
          margin-bottom: 10px;
          background: #222;
          border: 1px solid #444;
          border-radius: 4px;
        }
        
        .command-item {
          padding: 8px 12px;
          margin: 0;
          background: #333;
          border-bottom: 1px solid #444;
          cursor: pointer;
          font-size: 13px;
        }
        
        .command-item:hover {
          background: #444;
        }
        
        .command-item.active {
          background: #4CAF50;
        }
        
        .char-tabs {
          display: flex;
          margin-bottom: 10px;
        }
        
        .tab-btn {
          flex: 1;
          padding: 8px;
          background: #333;
          color: #fff;
          border: 1px solid #555;
          cursor: pointer;
          font-size: 14px;
        }
        
        .tab-btn.active {
          background: #4CAF50;
        }
        
        .tab-btn:hover {
          background: #444;
        }
        
        .controls {
          display: flex;
          flex-wrap: wrap;
        }
        
        label {
          display: block;
          margin-bottom: 10px;
          font-size: 14px;
        }
        
        .command-params {
          margin: 15px 0;
        }
        
        .command-params label {
          margin-bottom: 15px;
        }
      `;
      document.head.appendChild(style);
    },
    
    /**
     * Parse the presentation script
     */
    parseScript: function() {
      // For now, we'll work with a simplified command structure
      // Users can add/edit commands which will modify the playScript function
      this.tomteCommands = [
        { type: 'wait', params: [100] },
        { type: 'isOffscreenRight', params: [] },
        { type: 'plain', params: [] },
        { type: 'walkTo', params: [700, 690] },
        { type: 'say', params: ["Hi, I'm Tomte!"] }
      ];
      
      this.goatCommands = [
        { type: 'wait', params: [100] },
        { type: 'isOffscreenLeft', params: [] },
        { type: 'plain', params: [] },
        { type: 'walkTo', params: [324, 580] },
        { type: 'say', params: ["And I'm Goat!"] }
      ];
      
      this.currentCharacter = 'tomte';
      this.renderCommandsList();
    },
    
    /**
     * Render commands list
     */
    renderCommandsList: function() {
      var commandsList = document.getElementById('commands-list');
      if (!commandsList) return;
      
      var commands = this.currentCharacter === 'tomte' ? this.tomteCommands : this.goatCommands;
      commandsList.innerHTML = '';
      
      commands.forEach(function(cmd, index) {
        var item = document.createElement('div');
        item.className = 'command-item';
        if (index === this.currentCommandIndex) {
          item.className += ' active';
        }
        
        var text = cmd.type;
        if (cmd.params && cmd.params.length > 0) {
          text += '(' + cmd.params.join(', ') + ')';
        }
        item.textContent = (index + 1) + '. ' + text;
        item.dataset.index = index;
        commandsList.appendChild(item);
      }.bind(this));
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
      
      // Character tabs
      var tomteTab = document.getElementById('tab-tomte');
      var goatTab = document.getElementById('tab-goat');
      
      if (tomteTab) {
        tomteTab.addEventListener('click', function() {
          self.currentCharacter = 'tomte';
          this.classList.add('active');
          goatTab.classList.remove('active');
          self.currentCommandIndex = -1;
          self.renderCommandsList();
          self.clearCommandEditor();
        });
      }
      
      if (goatTab) {
        goatTab.addEventListener('click', function() {
          self.currentCharacter = 'goat';
          this.classList.add('active');
          tomteTab.classList.remove('active');
          self.currentCommandIndex = -1;
          self.renderCommandsList();
          self.clearCommandEditor();
        });
      }
      
      // Command selection
      var commandsList = document.getElementById('commands-list');
      if (commandsList) {
        commandsList.addEventListener('click', function(e) {
          if (e.target.classList.contains('command-item')) {
            var index = parseInt(e.target.dataset.index);
            self.selectCommand(index);
          }
        });
      }
      
      // Add command
      var addBtn = document.getElementById('add-command');
      if (addBtn) {
        addBtn.addEventListener('click', function() {
          self.addCommand();
        });
      }
      
      // Save command
      var saveBtn = document.getElementById('save-command');
      if (saveBtn) {
        saveBtn.addEventListener('click', function() {
          self.saveCommand();
        });
      }
      
      // Delete command
      var deleteBtn = document.getElementById('delete-command');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
          self.deleteCommand();
        });
      }
      
      // Command type change
      var typeSelect = document.getElementById('command-type');
      if (typeSelect) {
        typeSelect.addEventListener('change', function() {
          self.updateCommandParams();
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
          // Reload the page to restart
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
      
      var importBtn = document.getElementById('import-script');
      if (importBtn) {
        importBtn.addEventListener('click', function() {
          self.importScript();
        });
      }
    },
    
    /**
     * Select a command
     */
    selectCommand: function(index) {
      this.currentCommandIndex = index;
      this.renderCommandsList();
      this.loadCommandEditor();
    },
    
    /**
     * Load command into editor
     */
    loadCommandEditor: function() {
      var commands = this.currentCharacter === 'tomte' ? this.tomteCommands : this.goatCommands;
      if (this.currentCommandIndex < 0 || this.currentCommandIndex >= commands.length) return;
      
      var cmd = commands[this.currentCommandIndex];
      document.getElementById('command-type').value = cmd.type;
      this.updateCommandParams();
      
      // Fill in parameter values
      var params = document.querySelectorAll('.param-input');
      cmd.params.forEach(function(param, i) {
        if (params[i]) {
          params[i].value = param;
        }
      });
    },
    
    /**
     * Clear command editor
     */
    clearCommandEditor: function() {
      document.getElementById('command-type').value = 'wait';
      this.updateCommandParams();
    },
    
    /**
     * Update command parameters UI based on selected type
     */
    updateCommandParams: function() {
      var type = document.getElementById('command-type').value;
      var paramsDiv = document.getElementById('command-params');
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
     * Add new command
     */
    addCommand: function() {
      var commands = this.currentCharacter === 'tomte' ? this.tomteCommands : this.goatCommands;
      var newCmd = { type: 'wait', params: [1000] };
      commands.push(newCmd);
      this.currentCommandIndex = commands.length - 1;
      this.renderCommandsList();
      this.loadCommandEditor();
    },
    
    /**
     * Save current command
     */
    saveCommand: function() {
      var commands = this.currentCharacter === 'tomte' ? this.tomteCommands : this.goatCommands;
      if (this.currentCommandIndex < 0 || this.currentCommandIndex >= commands.length) return;
      
      var type = document.getElementById('command-type').value;
      var params = [];
      
      var inputs = document.querySelectorAll('.param-input');
      inputs.forEach(function(input) {
        var value = input.type === 'number' ? parseFloat(input.value) || 0 : input.value;
        params.push(value);
      });
      
      commands[this.currentCommandIndex] = { type: type, params: params };
      this.renderCommandsList();
      alert('Command saved! Note: Changes will take effect after restarting the presentation.');
    },
    
    /**
     * Delete current command
     */
    deleteCommand: function() {
      var commands = this.currentCharacter === 'tomte' ? this.tomteCommands : this.goatCommands;
      if (this.currentCommandIndex < 0 || this.currentCommandIndex >= commands.length) return;
      
      if (confirm('Delete this command?')) {
        commands.splice(this.currentCommandIndex, 1);
        this.currentCommandIndex = -1;
        this.renderCommandsList();
        this.clearCommandEditor();
      }
    },
    
    /**
     * Export script to JavaScript
     */
    exportScript: function() {
      var script = '// Tomte Script\n';
      script += 'this.tomte\n';
      this.tomteCommands.forEach(function(cmd) {
        var params = cmd.params.map(function(p) {
          return typeof p === 'string' ? '"' + p + '"' : p;
        }).join(', ');
        script += '  .' + cmd.type + '(' + params + ')\n';
      });
      
      script += '\n// Goat Script\n';
      script += 'this.goat\n';
      this.goatCommands.forEach(function(cmd) {
        var params = cmd.params.map(function(p) {
          return typeof p === 'string' ? '"' + p + '"' : p;
        }).join(', ');
        script += '  .' + cmd.type + '(' + params + ')\n';
      });
      
      var blob = new Blob([script], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'presentation-script.js';
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
              this.tomteCommands = data.tomte || [];
              this.goatCommands = data.goat || [];
              this.renderCommandsList();
              alert('Script imported successfully! Restart the presentation to see changes.');
            } catch (error) {
              alert('Error importing script: ' + error.message);
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
