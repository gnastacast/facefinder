// Placeholders for socketIO
  function search() {}
  function stop_search() {}
  function get_user_data(token) {}
  function send_credit_score(score) {}

// Utility functions
  // Hashing function
  String.prototype.hashToFloat = function() {
    var hash = 0, i, chr, float;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
      chr   = this.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
    }
    float = Math.sin(hash) * 10000;
    return float - Math.floor(float);
    return hash;
  };

  function clearDiv(id){
    var elem = document.getElementById(id);
      while(elem.childElementCount > 0){
        elem.removeChild(elem.firstChild); 
      }
  }

  function RNG(seed) {
    // LCG using GCC's constants
    this.m = 0x80000000; // 2**31;
    this.a = 1103515245;
    this.c = 12345;

    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
  }
  RNG.prototype.nextInt = function() {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
  }
  RNG.prototype.nextFloat = function() {
    // returns in range [0,1]
    return this.nextInt() / (this.m - 1);
  }
  RNG.prototype.nextRange = function(start, end) {
    // returns in range [start, end): including start, excluding end
    // can't modulu nextInt because of weak randomness in lower bits
    var rangeSize = end - start;
    var randomUnder1 = this.nextInt() / this.m;
    return start + Math.floor(randomUnder1 * rangeSize);
  }
  RNG.prototype.choice = function(array) {
    return array[this.nextRange(0, array.length)];
  }

  function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }


  function red_to_green(amount) {
    var green  = hexToRgb('#d2d75a');
    var yellow = hexToRgb('#fec65f');
    var red    = hexToRgb('#e46560');
    ratio = amount * 2;
    if (ratio <= 0)
      return 'rgb(' + red.r + ',' + red.g + ',' + red.b + ')'
    else if (ratio <= 1) {
      return 'rgb(' + (red.r * (1-ratio) + yellow.r * ratio) + ',' +
                      (red.g * (1-ratio) + yellow.g * ratio) + ',' +
                      (red.b * (1-ratio) + yellow.b * ratio) + ')'
    }
    else if (ratio <= 2) {
      return 'rgb(' + (yellow.r * (2-ratio) + green.r * (ratio - 1)) + ',' +
                      (yellow.g * (2-ratio) + green.g * (ratio - 1)) + ',' +
                      (yellow.b * (2-ratio) + green.b * (ratio - 1)) + ')'
    } else {
      return 'rgb(' + green.r + ',' + green.g + ',' + green.b + ')'
    }
  }

// UI STUFF
  function reset_1() {
    document.getElementById('user-video').style.marginLeft = "0px";
    document.getElementById('user-video').style.width = "0px";
    document.getElementById('begin').classList.add('pink');
    document.getElementById('begin').classList.remove('blue');
    document.getElementById('begin').children[0].children[0].innerHTML='Allow Aura to use my likeness';
    document.getElementById('begin').onclick = begin
  }

  function reset_2() {
    settime(globe,1)();
    var children = document.getElementById('search-list').children;
    for (var i = 0; i < children.length; i++) {
      children[i].classList.remove("shown");
      children[i].style.transition = "none";
    } 
  }

  function reset_3() {
    // set_credit_score(300,0);
  }



  var best_score = 0;
  var credit_score_payment = 0.0;
  var credit_score_travel = 0.0;
  var credit_score_social = 0.0;
  function set_credit_score(score, idx) {
    credit_scores = document.getElementsByClassName('credit_score');
    credit_scores[idx].style.setProperty('--score', score);
    var score_ratio = (score - 300) / 550;
    var description = "";
    if(score_ratio >= 140.0 / 180.0) {
      credit_scores[idx].style.setProperty('--text', '"Excellent"')
      document.getElementsByClassName('credit_score_description')[idx].textContent="Based on this score you are able to travel freely, you and your children may attend private schools, and you are able to apply for loans.";
    } else if(score_ratio >= 70.0 / 180.0) {
      credit_scores[idx].style.setProperty('--text', '"Average"');
      document.getElementsByClassName('credit_score_description')[idx].textContent="Based on this score your travel may be restricted to authorized trips, you and your family can attend certain private schools, and you are able to apply for small loans.";
    } else {
      credit_scores[idx].style.setProperty('--text', '"Poor"');
      document.getElementsByClassName('credit_score_description')[idx].textContent="Based on this score travel is restricted to authorized trips within the country, you and your family may only attend schools with dedicated re-socialization programs, and cannot be loaned money.";
    }

  }

  function goto_0() {
    var transition = document.getElementById('landing_container').style.transition;
    document.getElementById('landing_container').style.transition = "none";
    document.getElementById('landing_container').style.marginTop="0vh";
    document.getElementById('landing_container').style.transition = transition;
    document.getElementById('logo').style.opacity = "1";
    document.getElementById('logo').style.display = "block";
    reset_3();
    reset_2();
    reset_1();
    stop_search();
  }

  function hide_logo() {
    document.getElementById('logo').style.opacity = "0";
    window.setTimeout(function() {
      document.getElementById('logo').style.display = "none";
    }, 1000);
  }

  function goto_1() {
    document.getElementById('landing_container').style.marginTop="0vh";
    hide_logo();
    reset_3();
    reset_2();
    reset_1();
    stop_search();
  }

  function goto_2() {
    document.getElementById('landing_container').style.marginTop="-100vh";
    hide_logo();
    var children = document.getElementById('search-list').children;
    settime(globe, children.length)()
    for (var i = 0; i < children.length; i++) {
      children[i].classList.add("shown");
      children[i].style.transition = "all .25s ease-in";
      children[i].style.transitionDelay = 1+i*2 +"s";
      if (i == children.length-1)
        break;
      window.setTimeout(settime(globe, i+1), (1+i*2) * 1000);
    }
    stop_search();
    // window.setTimeout(goto_3, children.length * 2500 );
  }

  function goto_3() {
    var credit_score = Math.round((credit_score_payment + credit_score_travel + credit_score_social) / 3.0 * 550) + 300;
    window.setTimeout(set_credit_score, 750, credit_score, 0);
    set_credit_score(credit_score, 1);
    document.getElementById('landing_container').style.marginTop="-200vh";
    hide_logo();
    reset_1();
    reset_3();
    stop_search();
    document.getElementsByClassName('explanation_overlay')[0].style.opacity = 1;
    document.getElementsByClassName('explanation_overlay')[0].style.display = "block";
    document.getElementsByClassName('explanation_overlay')[1].style.opacity = 1;
    document.getElementsByClassName('explanation_overlay')[1].style.display = "block";
  }

  function goto_4() {
    document.getElementById('landing_container').style.marginTop="-300vh";
    search();
    hide_logo();
    reset_1();
    reset_2();
    reset_3();
  }


  function goto_5() {
    document.getElementById('landing_container').style.marginTop="-400vh";
    stop_search();
    hide_logo();
    reset_1();
    reset_2();
    reset_3();
  }

  function hide_explanation(id) {
    document.getElementsByClassName('explanation_overlay')[id].style.opacity = 0;
    window.setTimeout(function() {
      document.getElementsByClassName('explanation_overlay')[id].style.display = "none";
    }, 1000);
  }

  function begin() {
    document.getElementById('user-video').style.marginLeft = "60px";
    document.getElementById('user-video').style.display = "inline-block";
    document.getElementById('user-video').style.width = "600px";
    document.getElementById('begin').classList.remove('pink');
    document.getElementById('begin').classList.add('blue');
    document.getElementById('begin').children[0].children[0].innerHTML='Search global database';
    document.getElementById('begin').onclick = goto_2
  }

  function close_factor_overlay(id){
    document.getElementsByClassName('factor overlay')[id].style.opacity = 0;
    window.setTimeout(function() {
      document.getElementsByClassName('factor overlay')[id].style.display = "none";
    }, 500);
  }

  function show_factor_overlay(id){
    document.getElementsByClassName('factor overlay')[id].style.display = "block";
    window.setTimeout(function() {
      document.getElementsByClassName('factor overlay')[id].style.opacity = 1;
    }, 50);
  }

  function fillPaymentList(payments){
    clearDiv('payment_list')
    var totalAmount = 0;
    var averageScore = 0;
    // console.log(payments);
    var name = "";
    var preposition = "";
    var elem = document.getElementById('payment_list');
    for(var i=0; i < payments.length; i++) {
      if(payments[i].from != "me")
      {
        name = payments[i].from;
        preposition = "to";
      }
      else if(payments[i].to != "me")
      {
        name = payments[i].to;
        preposition = "from";
      }
      var paymentItem = document.createElement('li');
      var paymentDot = document.createElement('span');
      paymentDot.classList.add('credit-score-dot');
      averageScore += name.hashToFloat();
      totalAmount += payments[i].amount;
      var hash = Math.round(name.hashToFloat() * 2.999 - 0.5);
      paymentDot.classList.add(['red','yellow','green'][hash]);
      paymentItem.appendChild(paymentDot);
      var text = "$" + payments[i].amount + " " + preposition + " " + name;
      paymentItem.appendChild(document.createTextNode(text));
      elem.appendChild(paymentItem);
    }
    var scoreColor = ['red','yellow','green'][Math.round(averageScore / payments.length  * 2.999 - 0.5)];
    document.getElementsByClassName('payment_total')[0].textContent = "$" + Math.round(totalAmount);
    document.getElementsByClassName('payment_total')[0].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    document.getElementsByClassName('payment_total')[1].textContent = "$" + Math.round(totalAmount);
    document.getElementsByClassName('payment_total')[1].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    credit_score_payment = averageScore / payments.length;
    return averageScore / payments.length;
  }

  var random_names = ['Liam','Noah','William','James','Logan','Benjamin','Mason','Elijah','Oliver','Jacob','Lucas','Michael','Alexander','Ethan','Daniel','Matthew','Aiden','Henry','Joseph','Jackson','Samuel','Sebastian','David','Carter','Wyatt','Jayden','John','Owen','Dylan','Luke','Gabriel','Anthony','Isaac','Grayson','Jack','Julian','Levi','Christopher','Joshua','Andrew','Lincoln','Mateo','Ryan','Jaxon','Nathan','Aaron','Isaiah','Thomas','Charles','Caleb','Josiah','Christian','Hunter','Eli','Jonathan','Connor','Landon','Adrian','Asher','Cameron','Leo','Theodore','Jeremiah','Hudson','Robert','Easton','Nolan','Nicholas','Ezra','Colton','Angel','Brayden','Jordan','Dominic','Austin','Ian','Adam','Elias','Jaxson','Greyson','Jose','Ezekiel','Carson','Evan','Maverick','Bryson','Jace','Cooper','Xavier','Parker','Roman','Jason','Santiago','Chase','Sawyer','Gavin','Leonardo','Kayden','Ayden','Jameson'];

  var random_last_names = ['Hamilton', 'Barr', 'Shepard', 'Hatfield', 'Mcmahon', 'Rich', 'Cox', 'Faulkner', 'Payne', 'Miller', 'Choi', 'Bender', 'Black', 'Rose', 'Ross', 'Hayes', 'Lowe', 'Deleon', 'Humphrey', 'Shah', 'Sanchez', 'Blanchard', 'Andrade', 'Gilmore', 'Haney', 'David', 'Ray', 'Estes', 'Gilbert', 'Landry', 'Harvey', 'Hooper', 'Mccarty', 'Ellis', 'Rowe', 'Dickson', 'Moyer', 'Holder', 'Cantrell', 'House', 'Sellers', 'Hoffman', 'Orozco', 'Wagner', 'Hahn', 'Jensen', 'Mcintyre', 'Phelps', 'Morton', 'Carr', 'Key', 'Little', 'Hall', 'Blackburn', 'Caldwell', 'Burns', 'Bishop', 'Cooke', 'Savage', 'Blake', 'Pope', 'Nash', 'Walter', 'Kirk', 'Braun', 'Harrell', 'Santiago', 'Knight', 'Huff', 'Mejia', 'Glenn', 'Burnett', 'Harding', 'Trujillo', 'Conner', 'Graves', 'Parks', 'Maynard', 'Pugh', 'Brandt', 'Gonzales', 'Harmon', 'Mcguire', 'Kaufman', 'Dennis', 'York', 'Bray', 'Castro', 'Bartlett', 'Khan', 'Singh', 'Mckinney', 'Moon', 'Suarez', 'Le', 'Sherman', 'Williams', 'Joyce', 'Obrien', 'Spencer', 'Rollins', 'Walls', 'Gonzalez', 'Townsend', 'French', 'Clay', 'Hester', 'Wilkinson', 'Willis', 'Hunt', 'Brown', 'Campos', 'Ferrell', 'Weaver', 'Dillon', 'Lucero', 'Spears', 'Stephenson', 'Baxter', 'Lambert', 'Barajas', 'Gates', 'Vega', 'Bowman', 'Clements', 'Rivas', 'Bradley', 'Mendez', 'Sanders', 'Stokes', 'Ibarra', 'Russo', 'Vargas', 'Lozano', 'Bean', 'Sampson', 'Haynes', 'Richmond', 'Holden', 'Rubio', 'Hopkins', 'Nicholson', 'Cervantes', 'Lynch', 'Gross', 'Stark', 'Morris', 'Greene', 'Rosario', 'Cisneros', 'Williamson', 'Benjamin', 'Woodard', 'Love', 'Schneider', 'Avery', 'Frost', 'Gomez', 'West', 'Morrison', 'Heath', 'Whitney', 'Woodward', 'Cortez', 'Travis', 'Guzman', 'Terrell', 'Valdez', 'Davies', 'Hoover', 'Sandoval', 'Finley', 'Walsh', 'Cooper', 'Clayton', 'Fields', 'Duke', 'Atkins', 'Briggs', 'Beard', 'Douglas', 'Mcmillan', 'Goodman', 'Price', 'Howe', 'Arroyo', 'Robles', 'Gutierrez', 'Levine', 'Cordova', 'Powers', 'Harper', 'Acosta', 'Dyer', 'Chaney', 'Gillespie', 'Mullins', 'Mcpherson', 'Winters', 'Stone']

  function fake_data(name, type, text_options, bias_min, bias_max) {
    clearDiv(type + '_list')
    var total_score = 0;
    var rng = new RNG(Math.round((type + name).hashToFloat() * 10000));
    var n_elements = rng.nextInt() % 50 + 10;
    var elem = document.getElementById(type + '_list');
    var bias = 2 * rng.nextFloat();
    if(bias < 1) 
    {
      bias = bias * (1-bias_min) + bias_min;
    } else {
      bias = (bias - 1) * (bias_max - 1) + 1;
    }
    console.log(bias);
    for(var i=0; i<n_elements; i++)
    {
      var listElem = document.createElement('li');
      var scoreDot = document.createElement('span');
      scoreDot.classList.add('credit-score-dot');
      var score = Math.pow(rng.nextFloat(), bias);
      total_score += score;
      scoreDot.classList.add(['red','yellow','green'][Math.floor(score * 3)]);
      listElem.appendChild(scoreDot);
      var text = document.createElement('p');
      text.appendChild(document.createTextNode(text_options[Math.floor(score * text_options.length)]));
      var nameText = document.createElement('span');
      nameText.appendChild(document.createTextNode(rng.choice(random_names) + ' ' + rng.choice(random_last_names)));
      nameText.classList.add('blurry-text');
      text.appendChild(nameText)
      listElem.appendChild(text);
      elem.appendChild(listElem);
    }
    return [total_score, n_elements];
  }

  function fakePayments(name) {
    var text_options = ['Payment from ', 'Payment to ', 'Purchase from ', 'Payment from ', 'Payment to ', 'Purchase from ', 'Payment from ', 'Payment to ', 'Purchase from '];
    var retval = fake_data(name, 'payment', text_options, 0.2, 4);
    var averageScore = retval[0] / retval[1];
    console.log(retval);
    var scoreColor = ['red','yellow','green'][Math.floor(averageScore * 3)];
    document.getElementsByClassName('payment_total')[0].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    document.getElementsByClassName('payment_total')[0].textContent = ['Poor','Average', 'Excellent'][Math.floor(averageScore * 3)];
    document.getElementsByClassName('payment_total')[1].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    document.getElementsByClassName('payment_total')[1].textContent = ['Poor','Average', 'Excellent'][Math.floor(averageScore * 3)];
    credit_score_payment = averageScore;
    console.log("Faking credit_score_payment");
    return averageScore
  }

  function fakeFlights(name) {
    var text_options = ['Unauthorized travel to ', 'Authorized travel to '];
    var retval = fake_data(name, 'travel', text_options, 0.2, 4);
    var averageScore = retval[0] / retval[1];
    var scoreColor = ['red','yellow','green'][Math.floor(averageScore * 3)];
    document.getElementsByClassName('travel_total')[0].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    document.getElementsByClassName('travel_total')[0].textContent = ['Poor','Average', 'Excellent'][Math.floor(averageScore * 3)];
    document.getElementsByClassName('travel_total')[1].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    document.getElementsByClassName('travel_total')[1].textContent = ['Poor','Average', 'Excellent'][Math.floor(averageScore * 3)];
    credit_score_travel = averageScore;
    console.log("Faking credit_score_travel");
    return averageScore
  }

  function fakeSocial(name) {
    credit_score_social = 0.5;
    document.getElementsByClassName('social_total')[0].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-red)');
    document.getElementsByClassName('social_total')[0].textContent = 'Poor';
    document.getElementsByClassName('social_total')[1].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-red)');
    document.getElementsByClassName('social_total')[1].textContent = 'Poor';
    console.log("Faking credit_score_social");
  }

  function fillFlights(flights){

  }

  function fillSocialNetworks(networks){
    clearDiv('social_network_list')
    var total_score = 0;
    networks.unshift('aura')
    var n_elements = networks.length;
    var elem = document.getElementById('social_network_list');
    for(var i=0; i<n_elements; i++)
    {
      var listElem = document.createElement('li');
      var scoreDot = document.createElement('span');
      scoreDot.classList.add('credit-score-dot');
      total_score += 1;
      scoreDot.classList.add('green');
      listElem.appendChild(scoreDot);
      var text = document.createElement('p');
      var name = networks[i].charAt(0).toUpperCase() + networks[i].slice(1);
      text.appendChild(document.createTextNode(name));
      listElem.appendChild(text);
      elem.appendChild(listElem);
    }
    if (total_score > 4) total_score = 4;
    credit_score_social = total_score / 4.000000000001;
    var scoreColor = ['red','yellow','green'][Math.floor(credit_score_social * 3)];
    document.getElementsByClassName('social_total')[0].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    document.getElementsByClassName('social_total')[0].textContent = ['Poor','Average', 'Excellent'][Math.floor(credit_score_social * 3)];
    document.getElementsByClassName('social_total')[1].parentElement.parentElement.style.setProperty('--bg', 'var(--aura-' + scoreColor + ')');
    document.getElementsByClassName('social_total')[1].textContent = ['Poor','Average', 'Excellent'][Math.floor(credit_score_social * 3)];
    return [total_score, 4];
  }
  var urlCreator = window.URL || window.webkitURL;
  var imageUrl = "";
  var bestImageUrl = "";
// SOCKET STUFF
  $(document).ready(function(){
    //connect to the socket server.
    var socket = io.connect('http://' + document.domain + ':' + location.port + '/test');
    socket.on("image", function(info) {
      if (info.image){
        // Obtain a blob: URL for the image data.
        var arrayBufferView = new Uint8Array( info.buffer );
        var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
        if (imageUrl) {
          window.URL.revokeObjectURL(imageUrl);
        }
        imageUrl = urlCreator.createObjectURL( blob );
        var imgs = document.getElementsByClassName('webcam-img');
        for(var i=0; i < imgs.length; i++){
          imgs[i].src = imageUrl;
        }
      }
    });

    // Fill placeholder functions
    send_credit_score = function send_credit_score(token, score) { socket.emit('set_credit_score', { token: token, score: score }); }; 
    get_user_data = function get_user_data(token) { socket.emit('get_user_data', { token: token }); };
    stop_search = function stop_search() { socket.emit('stop_search', ''); };
    search = function search() { socket.emit('search', ''); };

    socket.on('searchResult', function(msg) {
        document.getElementById('result-img-A').src = msg.A;
        document.getElementById('result-img-B').src = msg.B;
        document.getElementById('result-img-C').src = msg.C;
        document.getElementById('result-img-D').src = msg.D;
        document.getElementById('result-img-A').style.opacity = 1.0;
        document.getElementById('result-img-B').style.opacity = 0.7;
        document.getElementById('result-img-C').style.opacity = 0.4;
        document.getElementById('result-img-D').style.opacity = 0.2;
        document.getElementById('result-img-A').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Acred));
        document.getElementById('result-img-B').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Bcred));
        document.getElementById('result-img-C').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Ccred));
        document.getElementById('result-img-D').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Dcred));

        var average_score = (parseFloat(msg.Acred) + parseFloat(msg.Bcred) * 0.5 + parseFloat(msg.Ccred) * 0.25 + parseFloat(msg.Dcred) * 0.125 ) / 1.875;
        var user_score = Math.round((credit_score_payment + credit_score_travel + credit_score_social) / 3.0 * 550) + 300;

        document.getElementsByClassName('fake credit-score-dot')[0].style.background = red_to_green(average_score);
        document.getElementsByClassName('true credit-score-dot')[0].style.background = red_to_green((user_score - 300) / 500);
        var difference = Math.round((average_score * 500 + 300) - user_score);
        if (difference >= 0) difference = "+" + difference;
        document.getElementsByClassName("fake credit-score-dot")[0].parentElement.parentElement.children[1].textContent = "Perceived credit score (" + difference + ")";



        if(average_score > best_score) {
          best_score = average_score;
          document.getElementById('final-result-img-A').src = msg.A;
          document.getElementById('final-result-img-B').src = msg.B;
          document.getElementById('final-result-img-C').src = msg.C;
          document.getElementById('final-result-img-D').src = msg.D;
          document.getElementById('final-result-img-A').style.opacity = 1.0;
          document.getElementById('final-result-img-B').style.opacity = 0.7;
          document.getElementById('final-result-img-C').style.opacity = 0.4;
          document.getElementById('final-result-img-D').style.opacity = 0.2;
          document.getElementById('final-result-img-A').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Acred));
          document.getElementById('final-result-img-B').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Bcred));
          document.getElementById('final-result-img-C').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Ccred));
          document.getElementById('final-result-img-D').nextSibling.nextSibling.style.backgroundColor = red_to_green(parseFloat(msg.Dcred));

          document.getElementsByClassName('fake credit-score-dot')[1].style.background = red_to_green(average_score);
          document.getElementsByClassName('true credit-score-dot')[1].style.background = red_to_green((user_score - 300) / 500);
          difference = Math.round((average_score * 500 + 300) - user_score);
          if (difference >= 0) difference = "+" + difference;
          document.getElementsByClassName("fake credit-score-dot")[1].parentElement.parentElement.children[1].textContent = "Perceived credit score (" + difference + ")";
          var arrayBufferView = new Uint8Array( msg.image );
          var blob = new Blob( [ arrayBufferView ], { type: "image/jpeg" } );
          if (bestImageUrl) {
            window.URL.revokeObjectURL(bestImageUrl);
          }
          bestImageUrl = urlCreator.createObjectURL( blob );
          var imgs = document.getElementsByClassName('final-webcam-img');
          for(var i=0; i < imgs.length; i++){
            imgs[i].src = bestImageUrl;
          }
        }
    });

    socket.on('user_data', function(msg) {
      data = JSON.parse(msg.json);
      console.log(data)
      if(!(data.payments === null) && data.payments.length != 0)
      {
        fillPaymentList(data.payments);
      }
      if(!(data.providers === null) && data.providers.length != 0)
      {
        fillSocialNetworks(data.providers)
      }
      console.log(msg);
      send_credit_score(msg.token, Math.round((credit_score_payment + credit_score_travel + credit_score_social) / 3.0 * 550) + 300);
    });

  });

  // PUSHERMAN STUFF
  window.addEventListener('userLogin', (event) => {
      // userLogin triggers when a user has logged in. The event object
      // contains event.detail.tapData which contains information about the user who has
      // just tapped in and event.detail.users contains an object with all currently
      // logged in users.
      const tapData = event.detail.tapData;
      console.log("Handling login for:", tapData.username);
      hide_logo();
      const nameText = document.getElementById('name_text');
      console.log(tapData);
      nameText.textContent = "Hello " + tapData.meta.first_name;
      best_score = 0;
      fakePayments(tapData.username);
      fakeFlights(tapData.username);
      fakeSocial(tapData.username);
      get_user_data(tapData.token);
  })

  window.addEventListener('userLogout', (event) => {
      // userLogout triggers when a user has logged out (ie: tapped twice). The event object
      // contains event.detail.tapData which contains information about the user who has
      // just logged out and event.detail.users contains an object with all currently
      // logged in users.
      const tapData = event.detail.tapData;
      console.log("Handling logout for:", tapData.username);
      goto_0();
      // const block = document.getElementById('login-info');
      // block.textContent = JSON.stringify(tapData, null, 2);
      // hljs.highlightBlock(block);
      // block.classList.add('error');
  })

  function initializeLoginEvent(appName, handleLogout=true, timeout=0) {
      // hostname should be staging.projectamelia.ai for testing
      // and projectamelia.ai for production. Since this page is being
      // hosted on the server, we can just use window.location.hostname to
      // automatically pick the right one
      // const hostname = window.location.hostname;
      const hostname = 'projectamelia.ai';
      const ws = new WebSocket(`wss://${hostname}/pusherman/companions/login/websocket?app=${appName}`);

      let users = {};
      ws.onmessage = (event) => {
          const tapData = JSON.parse(event.data);
          const { username, token } = tapData;
          var tapEvent;
          const eventConfig = {
              detail: {tapData, users, appName},
              bubbles: true,
          };
          // To fix the fact that we don't log out when the finish button is pressed
          var at_beginning = document.getElementById('landing_container').style.marginTop == "0vh" && document.getElementById('logo').style.display == "block";;
          if (!handleLogout || at_beginning) {
              for (var u in users) {
                  delete users[u];
              }
          }
          if (username in users) {
              tapEvent = new CustomEvent('userLogout', eventConfig);
              delete users[username]
          } else {
              tapEvent = new CustomEvent('userLogin', eventConfig);
              users[username] = tapData;
          }
          window.dispatchEvent(tapEvent);
      };

      ws.onclose = (event) => {
          timeout = Math.min((timeout + 1000) * 2, 30000);
          console.log("Trying to reconnect to login websocket in:", timeout);
          setTimeout(
              () => {
                  console.log("Attempting reconnect to login websocket");
                  initializeLoginEvent(appName, handleLogout, timeout);
              },
              timeout
          )
      }

      ws.onopen = async (event) => {
          timeout = 0;
          const eventConfig = {
              detail: {users, appName},
              bubbles: true,
          };
      };
  }

  initializeLoginEvent('social_calculator');