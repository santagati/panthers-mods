/*
* MemeEditorView
* Manages form capture, model updates, and selection state of the editor form.
*/
MEME.MemeEditorView = Backbone.View.extend({

  initialize: function() {
    this.buildForms();
    this.listenTo(this.model, 'change', this.render);
    this.render();
  },

  // Builds all form options based on model option arrays:
  buildForms: function() {
    var d = this.model.toJSON();

    function buildOptions(opts) {
      return _.reduce(opts, function(memo, opt) {
        return memo += ['<option value="',
                         opt.hasOwnProperty('value') ? opt.value : opt,
                         '"',
                         opt.hasOwnProperty('selected') ? 'selected="selected"' : '',
                         opt.hasOwnProperty('disabled') ? 'disabled="disabled"' : '',
                         '>',
                         opt.hasOwnProperty('text') ? opt.text : opt,
                         '</option>'].join('');
      }, '');
    }

    if (d.textShadowEdit) {
      $('#text-shadow').parent().show();
    }
    
    // Build aspect ratio options:
    if (d.aspectRatioOpts && d.aspectRatioOpts.length) {
      $('#aspect-ratio').append(buildOptions(d.aspectRatioOpts)).show();
    }    

    // Build text alignment options:
    if (d.textAlignOpts && d.textAlignOpts.length) {
      $('#text-align').append(buildOptions(d.textAlignOpts)).show();
    }

    // Build font size options:
    if (d.fontSizeOpts && d.fontSizeOpts.length) {
      $('#font-size').append(buildOptions(d.fontSizeOpts)).show();
    }


    // Build watermark options:
    if (d.watermarkOpts && d.watermarkOpts.length) {
      $('#watermark').append(buildOptions(d.watermarkOpts)).show();
    }
    
	// Build overlay color options:
    if (d.overlayColorOpts && d.overlayColorOpts.length) {
      var overlayOpts = _.reduce(d.overlayColorOpts, function(memo, opt) {
        var color = opt.hasOwnProperty('value') ? opt.value : opt;
        return memo += '<li><label><input class="m-editor__swatch" style="background-color:'+color+'" type="radio" name="overlay" value="'+color+'"></label></li>';
      }, '');

      $('#overlay').show().find('ul').append(overlayOpts);
    }
   
   
   //this.onAspectRatio();
  },

  render: function() {
    var d = this.model.toJSON();
    
    //Image
    this.$('#image-scale').val(d.imageScale);
    this.$('#aspect-ratio').val(d.aspectRatio);
    this.$('#overlay').val(d.overlayColor);
    
    //Text
    this.$('#headline').val(d.headlineText);
    this.$('#bio').val(d.bioText);
    this.$('#credit').val(d.creditText);
    this.$('#font-size').val(d.fontSize);
    this.$('#text-align').val(d.textAlign);
    this.$('#font-family').val(d.fontFamily);
    this.$('#text-shadow').prop('checked', d.textShadow);
    
    //Extra
    this.$('#watermark').val(d.watermarkSrc);
    this.$('#overlay').find('[value="'+d.overlayColor+'"]').prop('checked', true);
    
    /*
    if (this.model.hasBackground()){
      $('#meme-download').removeClass('disabled')
    }
    */
  },
  

  events: {
    'input #headline': 'onHeadline',
    'keydown #headline':'onKeyAction',
	'input #bio': 'onBio',
    'input #credit': 'onCredit',
    'input #image-scale': 'onScale',
    'change #font-size': 'onFontSize',
    'change #font-family': 'onFontFamily',
    'change #watermark': 'onWatermark',
    'change #text-align': 'onTextAlign',
    'change #text-shadow': 'onTextShadow',
    'change [name="overlay"]': 'onOverlayColor',
    
    'dragover #dropzone': 'onZoneOver',
    'drop #dropzone': 'onZoneDrop',
    'dragover canvas': 'onZoneOver',
    'drop canvas': 'onZoneDrop',
        
    'change #aspect-ratio': 'onAspectRatio',
    'change #background': 'onBackground',
    'change #image-upload': 'onFileSelect',
    'click #meme-download': 'onDownload',
    

    
  },

  onCredit: function() {
    this.model.set('creditText', this.$('#credit').val());
  },
  
  onBio: function() {
    this.model.set('bioText', this.$('#bio').val());
  },
  
  onKeyAction: function(e) {
    var code = e.keyCode || e.which;
    if (code == 13) {
      return false;
    }
  },
  
  onDownload: function(e){
    /*
    if (e.currentTarget.className == 'disabled'){
      return;
    }
    */
    var anchor = document.createElement('a');
    anchor.href = this.model.canvas.toDataURL("image/jpeg", .80);
    anchor.target = '_blank';
    anchor.download = this.model.attributes.downloadName + '.jpg';

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);    
  },

  onHeadline: function() {
    this.model.set('headlineText', this.$('#headline').val());
  },

  onFileSelect: function(t) {
        var e = t.target;
        e && this.model.loadBackground(e.files[0]);
  },
  
  onTextAlign: function() {    
    this.model.set('textAlign', this.$('#text-align').val());
  },

  onTextShadow: function() {
    this.model.set('textShadow', this.$('#text-shadow').prop('checked'));
  },

  onFontSize: function() {
    this.model.set('fontSize', this.$('#font-size').val());
  },

  onFontFamily: function() {
    this.model.set('fontFamily', this.$('#font-family').val());
  },

  onWatermark: function() {
    this.model.set('watermarkSrc', this.$('#watermark').val());
    if (localStorage) localStorage.setItem('meme_watermark', this.$('#watermark').val());
  },
  
  onAspectRatio: function() {
    var wh = this.$('#aspect-ratio').val().split('x');
    
    this.model.set({
      aspectRatio: this.$('#aspect-ratio').val(),
      width:wh[0],
      height:wh[1]
    });
    
    this.$('#meme-canvas').attr('class', 'ratio-' + this.$('#aspect-ratio').find(':selected').text().split(' ')[0].toLowerCase());
  },

  onScale: function() {
    this.model.set({imageScale: this.$('#image-scale').val()});
    //this.model.set('imageScale', this.$('#image-scale').val());
  },

  onOverlayColor: function(evt) {
    this.model.set('overlayColor', this.$(evt.target).val());
  },

  getDataTransfer: function(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    return evt.originalEvent.dataTransfer || null;
  },

  onZoneOver: function(evt) {
    var dataTransfer = this.getDataTransfer(evt);
    if (dataTransfer) {
      dataTransfer.dropEffect = 'copy';
      this.$('#dropzone').addClass('pulse');
    }
  },

  onZoneOut: function(evt) {
    this.$('#dropzone').removeClass('pulse');
  },

  onZoneDrop: function(evt) {
    var dataTransfer = this.getDataTransfer(evt);
    if (dataTransfer) {
      this.model.loadBackground(dataTransfer.files[0]);
      this.$('#dropzone').removeClass('pulse');
    }
  }
});