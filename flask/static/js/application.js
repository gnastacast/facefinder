var capture = function() {
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    socket.emit('capture', { data: 'true'});
    document.getElementById('capture').disabled = true;
    document.getElementById('faceSearch').disabled = false;
    document.getElementById('reset').disabled = false;
};
var timeOutFunc;
var faceSearch = function() {
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    socket.emit('search', { data: 'true'});
    document.getElementById('layout').classList.add('show');
    clearTimeout(timeOutFunc);
    timeOutFunc = setTimeout(function() {
        document.getElementById('layout').style.animationPlayState = "paused";
    }, 3000);
};
var reset = function() {
  document.getElementById('capture').disabled = false;
  document.getElementById('faceSearch').disabled = true;
  document.getElementById('reset').disabled = true;
  var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
  socket.emit('reset', { data: 'true'});
};

$(document).ready(function(){
    //connect to the socket server.
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    var numbers_received = [];
    reset()
    socket.on('captureResult', function(msg) {
      document.getElementById('capture').disabled = true;
      document.getElementById('faceSearch').disabled = false;
      document.getElementById('reset').disabled = false;
    });

    function paddy(num, padlen, padchar) {
        var pad_char = typeof padchar !== 'undefined' ? padchar : '0';
        var pad = new Array(1 + padlen).join(pad_char);
        return (pad + num).slice(-pad.length);
    }   

    socket.on('searchResult', function(msg) {
        var pad = "000000";
        var a_file =  '/static/images/' + paddy(Math.floor(msg.A / 1000)*1000, 6, '0') +  '/' + paddy(msg.A, 6, '0') + '.png'; 
        var b_file =  '/static/images/' + paddy(Math.floor(msg.B / 1000)*1000, 6, '0') +  '/' + paddy(msg.B, 6, '0') + '.png'; 
        var c_file =  '/static/images/' + paddy(Math.floor(msg.C / 1000)*1000, 6, '0') +  '/' + paddy(msg.C, 6, '0') + '.png'; 
        var d_file =  '/static/images/' + paddy(Math.floor(msg.D / 1000)*1000, 6, '0') +  '/' + paddy(msg.D, 6, '0') + '.png'; 
        var e_file =  '/static/images/' + paddy(Math.floor(msg.E / 1000)*1000, 6, '0') +  '/' + paddy(msg.E, 6, '0') + '.png';
        var f_file =  '/static/images/' + paddy(Math.floor(msg.F / 1000)*1000, 6, '0') +  '/' + paddy(msg.F, 6, '0') + '.png';
        document.getElementById('result-img-A').src = a_file;
        document.getElementById('result-img-B').src = b_file;
        document.getElementById('result-img-C').src = c_file;
        document.getElementById('result-img-D').src = d_file;
        document.getElementById('result-img-E').src = e_file;
        document.getElementById('result-img-F').src = f_file;
        console.log([a_file, b_file, c_file, d_file, e_file, f_file])
        // document.getElementById('layout').elem.classList.add('show');
    });

    //receive details from server
    socket.on('newnumber', function(msg) {
        console.log("Received number" + msg.number);
        //maintain a list of ten numbers
        if (numbers_received.length >= 10){
            numbers_received.shift()
        }            
        numbers_received.push(msg.number);
        numbers_string = '';
        for (var i = 0; i < numbers_received.length; i++){
            numbers_string = numbers_string + '<p>' + numbers_received[i].toString() + '</p>';
        }
        $('#log').html(numbers_string);
    });

    socket.on("image", function(info) {
        if (info.image){
            // Obtain a blob: URL for the image data.
            var arrayBufferView = new Uint8Array( info.buffer );
            var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL( blob );
            var img = document.getElementById('webcam-img');
            img.src = imageUrl;
        }
    });

    // Obtain a blob: URL for the image data.
    var arrayBufferView = new Uint8Array( this.response );
    var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
    var urlCreator = window.URL || window.webkitURL;
    var imageUrl = urlCreator.createObjectURL( blob );
    var img = document.querySelector( "#photo" );
    img.src = imageUrl;
    img.src = imageUrl;
});