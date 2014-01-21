function FloatView(options)
{
  var element = document.createElement('div');

  var label = document.createElement('label');
  label.appendChild(document.createTextNode(options.label));
  element.appendChild(label);

  var range = document.createElement('input');
  range.type = 'range';
  range.min  = parseFloat(options.min);
  range.max  = parseFloat(options.max);
  range.step = parseFloat(options.step);
  if(options.value !== undefined && options.value !== null){
    range.value = options.value;
  }else{
    range.value = (range.min + range.max) * 0.5;
  }
  label.appendChild(range);

  var text = document.createElement('input');
  text.type = 'text';
  text.value = range.value;
  label.appendChild(text);

  var self = this;
  element.addEventListener('change', function(event){
    var value = range.value;
    if(event.target === text){
      value = parseFloat(text.value);
      if(value < range.min){
        value = range.min;
      }else if(value > range.max){
        value = range.max;
      }
    }

    range.value = value;
    text.value = value;
    self.value = value;
  }, false);

  this.element = element;
  this.value   = range.value;
}
