function make_svg_wobble(n_points, center_x, center_y, radius=1, noise=0, time=0) {
  var svg_string = "M 113.4 38.4 c  23.8 22.2    25 57.1 2.8 80.8 -22.2 23.8 -59.5   25  -83.2  2.8 C 9.2 99.8 7.9 64.9 30.1 41.1 52.3 17.4 89.6 16.2 113.4 38.4 Z";
  var step = 1 / n_points * Math.PI * 2;
  var handle_len = radius / n_points * 0.552 * 4;
  var last_x = 0;
  var last_y = 0;
  for(var i=0; i < n_points + 1; i++){
    var offset = Math.cos(i * step * 3 + 0 + (time +   0)**1*Math.PI*4) * noise / 2 + 
                 Math.sin(i * step * 5 + 2 + (time +   0)**1*Math.PI*2) * noise / 2 - 
                 Math.sin(i * step * 2 + 1 + ((time * 2 - 1)**3 + time + 1)*Math.PI*2/3) * noise / 3;
    var x  = -Math.cos(i * step) * (radius + offset) + center_x;
    var y  =  Math.sin(i * step) * (radius + offset) + center_y;
    var x1 =  Math.sin((i-1) * step) * handle_len + last_x;
    var y1 =  Math.cos((i-1) * step) * handle_len + last_y; 
    var x2 = -Math.sin(i * step) * handle_len + x;
    var y2 = -Math.cos(i * step) * handle_len + y;
    var last_x  = x;
    var last_y  = y;
    if(i==0) {
      svg_string +=   'M ' + x + ' ' + y + ' L';
    } else {
      // svg_string += ', C ' + x1 + ' ' + y1 + ', ' + x2 + ' ' + y2 + ', ' + x + ' ' + y;
      svg_string += ' ' + x + ' ' + y;
    }
  }
  return svg_string + 'Z;';
}

function make_wobble_anim(n_points, center_x, center_y, radius=1, noise=0, steps=50) {
  var anim = ""
  for(var i = 0; i < steps; i++) {
    anim += make_svg_wobble(n_points, center_x, center_y, radius, noise, i/steps) + '\n'; 
  }
  anim += make_svg_wobble(n_points, center_x, center_y, radius, noise, 1); 
  return anim
}