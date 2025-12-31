/*
  Presentation Editor for Canvas Animation
  
  Allows editing and managing canvas animation presentations
*/

var PresentationEditor = (function() {
  'use strict';
  
  var editor = {
    slides: [],
    currentSlide: 0,
    presentation: null,
    
    /**
     * Initialize the editor
     */
    init: function(presentationInstance) {
      this.presentation = presentationInstance;
      this.setupUI();
      this.loadSlides();
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
          <h2>Presentation Editor</h2>
          <button id="toggle-editor" class="btn">Toggle Editor</button>
        </div>
        <div class="editor-content">
          <div class="editor-section">
            <h3>Slides</h3>
            <div id="slides-list" class="slides-list"></div>
            <button id="add-slide" class="btn">Add Slide</button>
          </div>
          <div class="editor-section">
            <h3>Current Slide</h3>
            <div id="slide-properties" class="slide-properties">
              <label>
                Slide Title:
                <input type="text" id="slide-title" class="form-control" />
              </label>
              <label>
                Duration (ms):
                <input type="number" id="slide-duration" class="form-control" value="1000" />
              </label>
              <label>
                Animation Type:
                <select id="animation-type" class="form-control">
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
              </label>
              <button id="save-slide" class="btn">Save Slide</button>
              <button id="delete-slide" class="btn btn-danger">Delete Slide</button>
            </div>
          </div>
          <div class="editor-section">
            <h3>Controls</h3>
            <div class="controls">
              <button id="prev-slide" class="btn">Previous</button>
              <button id="next-slide" class="btn">Next</button>
              <button id="play-presentation" class="btn">Play</button>
              <button id="stop-presentation" class="btn">Stop</button>
              <button id="export-json" class="btn">Export JSON</button>
              <button id="import-json" class="btn">Import JSON</button>
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
          right: -350px;
          width: 350px;
          height: 100%;
          background: rgba(0, 0, 0, 0.9);
          color: #fff;
          padding: 20px;
          box-shadow: -2px 0 10px rgba(0, 0, 0, 0.5);
          overflow-y: auto;
          transition: right 0.3s ease;
          z-index: 1000;
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
        
        .slides-list {
          max-height: 200px;
          overflow-y: auto;
          margin-bottom: 10px;
        }
        
        .slide-item {
          padding: 10px;
          margin: 5px 0;
          background: #333;
          border-radius: 4px;
          cursor: pointer;
          border: 2px solid transparent;
        }
        
        .slide-item:hover {
          background: #444;
        }
        
        .slide-item.active {
          border-color: #4CAF50;
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
      `;
      document.head.appendChild(style);
    },
    
    /**
     * Load slides from presentation
     */
    loadSlides: function() {
      // Initialize with a default slide if none exist
      if (this.slides.length === 0) {
        this.slides.push({
          id: Date.now(),
          title: 'Welcome Slide',
          duration: 3000,
          animationType: 'fade',
          content: 'Welcome to the presentation'
        });
      }
      this.renderSlidesList();
    },
    
    /**
     * Render the slides list
     */
    renderSlidesList: function() {
      var slidesList = document.getElementById('slides-list');
      if (!slidesList) return;
      
      slidesList.innerHTML = '';
      this.slides.forEach(function(slide, index) {
        var slideItem = document.createElement('div');
        slideItem.className = 'slide-item';
        if (index === this.currentSlide) {
          slideItem.className += ' active';
        }
        slideItem.textContent = (index + 1) + '. ' + slide.title;
        slideItem.dataset.index = index;
        slidesList.appendChild(slideItem);
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
      
      // Add slide
      var addSlideBtn = document.getElementById('add-slide');
      if (addSlideBtn) {
        addSlideBtn.addEventListener('click', function() {
          self.addSlide();
        });
      }
      
      // Save slide
      var saveSlideBtn = document.getElementById('save-slide');
      if (saveSlideBtn) {
        saveSlideBtn.addEventListener('click', function() {
          self.saveCurrentSlide();
        });
      }
      
      // Delete slide
      var deleteSlideBtn = document.getElementById('delete-slide');
      if (deleteSlideBtn) {
        deleteSlideBtn.addEventListener('click', function() {
          self.deleteCurrentSlide();
        });
      }
      
      // Navigation
      var prevBtn = document.getElementById('prev-slide');
      if (prevBtn) {
        prevBtn.addEventListener('click', function() {
          self.previousSlide();
        });
      }
      
      var nextBtn = document.getElementById('next-slide');
      if (nextBtn) {
        nextBtn.addEventListener('click', function() {
          self.nextSlide();
        });
      }
      
      // Play/Stop
      var playBtn = document.getElementById('play-presentation');
      if (playBtn) {
        playBtn.addEventListener('click', function() {
          self.playPresentation();
        });
      }
      
      var stopBtn = document.getElementById('stop-presentation');
      if (stopBtn) {
        stopBtn.addEventListener('click', function() {
          self.stopPresentation();
        });
      }
      
      // Export/Import
      var exportBtn = document.getElementById('export-json');
      if (exportBtn) {
        exportBtn.addEventListener('click', function() {
          self.exportToJSON();
        });
      }
      
      var importBtn = document.getElementById('import-json');
      if (importBtn) {
        importBtn.addEventListener('click', function() {
          self.importFromJSON();
        });
      }
      
      // Slide selection
      var slidesList = document.getElementById('slides-list');
      if (slidesList) {
        slidesList.addEventListener('click', function(e) {
          if (e.target.classList.contains('slide-item')) {
            var index = parseInt(e.target.dataset.index);
            self.selectSlide(index);
          }
        });
      }
    },
    
    /**
     * Add a new slide
     */
    addSlide: function() {
      var newSlide = {
        id: Date.now(),
        title: 'New Slide ' + (this.slides.length + 1),
        duration: 3000,
        animationType: 'fade',
        content: ''
      };
      this.slides.push(newSlide);
      this.currentSlide = this.slides.length - 1;
      this.renderSlidesList();
      this.loadSlideProperties();
    },
    
    /**
     * Save current slide properties
     */
    saveCurrentSlide: function() {
      if (this.currentSlide >= 0 && this.currentSlide < this.slides.length) {
        var slide = this.slides[this.currentSlide];
        slide.title = document.getElementById('slide-title').value;
        slide.duration = parseInt(document.getElementById('slide-duration').value);
        slide.animationType = document.getElementById('animation-type').value;
        this.renderSlidesList();
        alert('Slide saved!');
      }
    },
    
    /**
     * Delete current slide
     */
    deleteCurrentSlide: function() {
      if (this.slides.length > 1 && confirm('Delete this slide?')) {
        this.slides.splice(this.currentSlide, 1);
        this.currentSlide = Math.max(0, this.currentSlide - 1);
        this.renderSlidesList();
        this.loadSlideProperties();
      }
    },
    
    /**
     * Select a slide
     */
    selectSlide: function(index) {
      this.currentSlide = index;
      this.renderSlidesList();
      this.loadSlideProperties();
    },
    
    /**
     * Load slide properties into form
     */
    loadSlideProperties: function() {
      if (this.currentSlide >= 0 && this.currentSlide < this.slides.length) {
        var slide = this.slides[this.currentSlide];
        document.getElementById('slide-title').value = slide.title;
        document.getElementById('slide-duration').value = slide.duration;
        document.getElementById('animation-type').value = slide.animationType;
      }
    },
    
    /**
     * Go to previous slide
     */
    previousSlide: function() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
        this.renderSlidesList();
        this.loadSlideProperties();
      }
    },
    
    /**
     * Go to next slide
     */
    nextSlide: function() {
      if (this.currentSlide < this.slides.length - 1) {
        this.currentSlide++;
        this.renderSlidesList();
        this.loadSlideProperties();
      }
    },
    
    /**
     * Play presentation
     */
    playPresentation: function() {
      if (this.presentation && this.presentation.canvas) {
        this.presentation.canvas.play();
        alert('Presentation playing');
      }
    },
    
    /**
     * Stop presentation
     */
    stopPresentation: function() {
      if (this.presentation && this.presentation.canvas) {
        this.presentation.canvas.stop();
        alert('Presentation stopped');
      }
    },
    
    /**
     * Export slides to JSON
     */
    exportToJSON: function() {
      var json = JSON.stringify(this.slides, null, 2);
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'presentation-slides.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    
    /**
     * Import slides from JSON
     */
    importFromJSON: function() {
      var input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (file) {
          var reader = new FileReader();
          reader.onload = function(event) {
            try {
              var slides = JSON.parse(event.target.result);
              this.slides = slides;
              this.currentSlide = 0;
              this.renderSlidesList();
              this.loadSlideProperties();
              alert('Slides imported successfully!');
            } catch (error) {
              alert('Error importing slides: ' + error.message);
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
