
var options;
 

function doDefaultStuff(e){
    
}

var clickHandler = doDefaultStuff


function doClick(e){
    clickHandler(e)
}
$.overrideListener = function(callback){ 
    clickHandler = callback
}


var defaults = {
    width: 100,
    height: 30,
    backgroundColor: 'transparent',
    borderRadius:15,
    borderWidth:1,
    borderColor:"black" 
  };


  Object.keys(defaults).forEach(function(key){
    Object.defineProperty($, key, {
      get: function(){ return options[key]; },
      set: function(value){ options[key] = value; }
    });
  }); 


  if (arguments[0]){
    createView(arguments[0]);
  }

  function createView(_args){
    options = _.defaults(_args, defaults);
    
    ["width", "height", "left", "right", "top", "bottom", "zIndex", "backgroundColor", "accessibilityLabel"].forEach(function(prop){
      _.has(options, prop) && ($.button[prop] = options[prop]);
    });
   
    if (_.has(options, "margin")){
      $.button.width += options.margin;
      $.button.height += options.margin;
    }
 
     if (_.has(options, "height")){ 
        $.button.height = options.height
      }
 
     if (_.has(options, "width")){ 
        $.button.width = options.width
      }
 
     if (_.has(options, "borderRadius")){ 
        $.button.borderRadius = options.borderRadius
      }

 
     if (_.has(options, "borderWidth")){ 
        $.button.borderWidth = options.borderWidth
      }
 
     if (_.has(options, "borderColor")){ 
        $.button.borderColor = options.borderColor
      }
 
     if (_.has(options, "font")){ 
        $.button.font = options.font
      }
 
    if (_.has(options, "backgroundColor")){
        $.button.backgroundColor = options.backgroundColor; 
    }

    if (_.has(options, "accessibilityLabel")){
      $.button.accessibilityLabel = options.accessibilityLabel; 
    }
 
    if (_.has(options, "text")){
        $.button_inner.text = options.text; 
    }

    if (_.has(options, "textColor")){
      $.button_inner.color = options.textColor; 
    }

    if (_.has(options, "doClick")){
        clickHandler = options.doClick;
    }

    if (_.has(options, "opacity")){
      $.button.opacity = options.opacity;
    }
 
    return $.button;
  };

 function setText(text){
    $.button_inner.text = text;
}
 function setBackgroundColor(color){
    $.button.backgroundColor =  color;
}

function getText(){
    return  $.button_inner.text;
}

function hide(){
    $.button.hide();
}
function show(){
    $.button.show();
}

function setOpacity(opacity){
  $.button.opacity = opacity;
}

function setAccessibilityLabel(accessibilityLabel){
  $.button.accessibilityLabel = accessibilityLabel;
}

function enableTouch(enable){
  $.button.touchEnabled = enable;
}
 
exports.createView = createView; 
exports.setText = setText;
exports.getText = getText;  
exports.hide = hide;
exports.show = show;
exports.setBackgroundColor = setBackgroundColor;
exports.setAccessibilityLabel = setAccessibilityLabel;
exports.setOpacity = setOpacity;
exports.enableTouch = enableTouch;
exports.onClick = function(e){
    clickHandler = e;
} 