


var bj = {
  hdstand : null, 
  hdpoints : null, 
  hdhand : null, 
  hpstand : null, 
  hppoints : null, 
  hphand : null,  
  hpcon : null, 
  winss : 0,
  losess : 0,
  drawss : 0,

  deck : [], 
  dealer : [], 
  player : [], 
  dpoints : 0, 
  ppoints : 0, 
  safety : 17, // Computer will stand on or past this point
  dstand : false, 
  pstand : false, 
  turn : 0, 

  init : function () {
    bj.hdstand = document.getElementById("deal-stand");
    bj.hdpoints = document.getElementById("deal-points");
    bj.hdhand = document.getElementById("deal-cards");
    bj.hpstand = document.getElementById("play-stand");
    bj.hppoints = document.getElementById("play-points");
    bj.hphand = document.getElementById("play-cards");
    bj.hpcon = document.getElementById("play-control");
    bj.tracker = document.getElementById("tracker");

    document.getElementById("playc-start").addEventListener("click", bj.start);
    document.getElementById("playc-hit").addEventListener("click", bj.hit);
    document.getElementById("playc-stand").addEventListener("click", bj.stand);
  },

  // (START NEW GAME
  start : function () {
    bj.deck = [];  bj.dealer = [];  bj.player = [];
    bj.dpoints = 0;  bj.ppoints = 0; bj.wins = 0;
    bj.dstand = false;  bj.pstand = false;
    bj.hdpoints.innerHTML = "?"; bj.hppoints.innerHTML = 0;
    bj.hdhand.innerHTML = ""; bj.hphand.innerHTML = "";
    bj.hdstand.classList.remove("stood");
    bj.hpstand.classList.remove("stood");
    bj.hpcon.classList.add("started");

    for (let i=0; i<4; i++) { for (let j=1; j<14; j++) {
      bj.deck.push({s : i, n : j});
    }}
    for (let i=bj.deck.length - 1; i>0; i--) {
      let j = Math.floor(Math.random() * i);
      let temp = bj.deck[i];
      bj.deck[i] = bj.deck[j];
      bj.deck[j] = temp;
    }

    bj.turn = 0; bj.draw(); bj.turn = 1; bj.draw(); 
    bj.turn = 0; bj.draw(); bj.turn = 1; bj.draw(); 

    bj.turn = 0; bj.points();
    bj.turn = 1; bj.points();
    var winner = bj.check(); 
    if (winner==null) { bj.turn = 0; }
    
  },


  dsymbols : ["&hearts;", "&diams;", "&clubs;", "&spades;"], 
  dnum : { 1 : "A", 11 : "J", 12 : "Q", 13 : "K" }, 
  draw : function () {
    //  TAKE LAST CARD FROM DECK + CREATE HTML
    var card = bj.deck.pop(),
        cardh = document.createElement("div"),
        cardv = (bj.dnum[card.n] ? bj.dnum[card.n] : card.n) + bj.dsymbols[card.s];
    cardh.className = "bj-card";
    cardh.innerHTML = cardv ;

    // DEALER'S CARD

    if (bj.turn) {
      if (bj.dealer.length==0) {
        cardh.id = "deal-first";
        cardh.innerHTML = `<div class="back">?</div><div class="front">${cardv}</div>`;
      }
      bj.dealer.push(card);
      bj.hdhand.appendChild(cardh);
    }

    // PLAYER'S CARD
    else {
      bj.player.push(card);
      bj.hphand.appendChild(cardh);
    }
  },
  
  // CALCULATE AND UPDATE POINTS
  points : function () {

    var aces = 0, points = 0;
    for (let i of (bj.turn ? bj.dealer : bj.player)) {
      if (i.n == 1) { aces++; }
      else if (i.n>=11 && i.n<=13) { points += 10; }
      else { points += i.n; }
    }
    
    // CALCULATIONS FOR ACES
    if (aces!=0) {
      var minmax = [];
      for (let elevens=0; elevens<=aces; elevens++) {
        let calc = points + (elevens * 11) + (aces-elevens * 1);
        minmax.push(calc);
      }
      points = minmax[0];
      for (let i of minmax) {
        if (i > points && i <= 21) { points = i; }
      }
    }
    
    if (bj.turn) { bj.dpoints = points; }
    else {
      bj.ppoints = points;
      bj.hppoints.innerHTML = points;
    }
  },

  check : function () {
    // WINNER - 0 FOR PLAYER, 1 FOR DEALER, 2 FOR A TIE
    var winner = null, message = "";
    
    //BLACKJACK - WIN ON FIRST ROUND
    if (bj.player.length==2 && bj.dealer.length==2) {
      // TIE
      if (bj.ppoints==21 && bj.dpoints==21) {
        winner = 2; message = "It's a tie with Blackjacks";
        bj.drawss+=1;
      }
      // PLAYER WINS
      if (winner==null && bj.ppoints==21) {
        winner = 0; message = "Player wins with a Blackjack!";
        bj.winss+=1;
      }
      // DEALER WINS
      if (winner==null && bj.dpoints==21) {
        winner = 1; message = "Dealer wins with a Blackjack!";
        bj.losess+=1;
      }
    }
    
    if (winner == null) {
      // PLAYER GONE BUST
      if (bj.ppoints>21) {
        winner = 1; message = "Player has gone bust - Dealer wins!";
        bj.losess+=1;
      }
      // DEALER GONE BUST
      if (bj.dpoints>21) {
        winner = 0; message = "Dealer has gone bust - Player wins!";
        bj.winss+=1;
      }
    }
    
    if (winner == null && bj.dstand && bj.pstand) {
      // DEALER HAS MORE POINTS
      if (bj.dpoints > bj.ppoints) {
        winner = 1; message = "Dealer wins with " + bj.dpoints + " points!";
        bj.losess+=1;
      }
      // PLAYER HAS MORE POINTS
      else if (bj.dpoints < bj.ppoints) {
        winner = 0; message = "Player wins with " + bj.ppoints + " points!";
        bj.winss+=1;
      }
      // TIE
      else {
        winner = 2; message = "It's a tie.";
        bj.drawss+=1;
      }
    }

    if (winner != null) {
      bj.hdpoints.innerHTML = bj.dpoints;
      document.getElementById("deal-first").classList.add("show");

      bj.hpcon.classList.remove("started");

      alert(message);
    }
    return winner;
  },
  

  hit : function () {

    bj.draw(); bj.points();

    if (bj.turn==0 && bj.ppoints==21 && !bj.pstand) {
      bj.pstand = true; bj.hpstand.classList.add("stood");
    }
    if (bj.turn==1 && bj.dpoints==21 && !bj.dstand) {
      bj.dstand = true; bj.hdstand.classList.add("stood");
    }

    var winner = bj.check();
    bj.track();
    if (winner==null) { bj.next(); }
  },

  stand : function () {

    if (bj.turn) {
      bj.dstand = true; bj.hdstand.classList.add("stood");
    } else {
      bj.pstand = true; bj.hpstand.classList.add("stood");
    }


    var winner = (bj.pstand && bj.dstand) ? bj.check() : null ;
    bj.track();
    if (winner==null) { bj.next(); }
  },


  next : function () {

    bj.turn = bj.turn==0 ? 1 : 0 ;


    if (bj.turn==1) { 
      if (bj.dstand) { bj.turn = 0; } 
      else { bj.ai(); }
    }
    

    else {
      if (bj.pstand) { bj.turn = 1; bj.ai(); }
    }
  },

  ai : function () { if (bj.turn) {
    if (bj.dpoints >= bj.safety) { bj.stand(); }

    else { bj.hit(); }
  }},
   track : function () {
    bj.tracker.innerHTML = "<p>Wins: " + bj.winss + " Draws: " + bj.drawss + " Loses: " + bj.losess + "</p>";

},
};

window.addEventListener("DOMContentLoaded", bj.init);