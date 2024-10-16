class Game {
  constructor() {
    this.allCards = []; // Will contain all the cards on the field
    this.cardPool = [
      { 1: 'dishonored', 2: './public/img/dishonored logo.jpg' },
      { 1: 'halo', 2: './public/img/halo logo.jpg' },
      { 1: 'l4d', 2: './public/img/l4d logo.jpg' },
      { 1: 'mc', 2: './public/img/mc logo.jpg' },
      { 1: 'osu', 2: './public/img/osu logo.jpg' },
      { 1: 't2', 2: './public/img/t2 logo.jpg' },
      { 1: 'transformice', 2: './public/img/transformice logo.jpg' },
      { 1: 'val', 2: './public/img/val logo.jpg' },
      { 1: 'hf', 2: './public/img/hf logo.jpg' },
      { 1: 'ac', 2: './public/img/ac logo.jpg' },
      { 1: 'p2', 2: './public/img/p2 logo.jpg' },
      { 1: 'got', 2: './public/img/got logo.jpg' }
    ]; // All possible cards that can get placed
    this.flippedCards = []; // Will track the flipped cards
    this.isProcessingFlip = false;
    this.scoreElement = document.getElementById("score"); // Reference to the score element
    this.startCardGame(); // Will start the card game
  }

  shuffleAvoidDupes(array) {
    let shuffledArray; // Will hold the shuffled array
    let hasAdjacentDuplicates = true; // This flag will track if there are dupes next to one another

    // Repeat shuffling until there are no dupes next to one another
    while (hasAdjacentDuplicates) {
        // Shuffle the array using a simple shuffle
        shuffledArray = array.sort(() => Math.random() - 0.5);
        hasAdjacentDuplicates = false; // Assume there are no dupes next to one another
        
        // Check the shuffled array for dupes next to one another
        for (let i = 0; i < shuffledArray.length - 1; i++) {
            if (shuffledArray[i] === shuffledArray[i + 1]) {
                // If two dupes are next to one another, set the flag to true
                hasAdjacentDuplicates = true;
                break; // Break loop and reshuffle
            }
        }
    }
    return shuffledArray; // Return the valid shuffled array with dupes next to one another
  }

  fetchCards() {
    const slicedCards = this.cardPool.slice(0, (this.askCards() / 2)); // Fetches the cards from the card pool
    const shuffledArray = this.shuffleAvoidDupes([...slicedCards, ...slicedCards]); // Shuffles and avoids dupes next to one another
    return shuffledArray; // Returns the array ready for use
  }

  askCards() {
    // Requests how many cards the player wants on the field
    let requestedCards;
    do {requestedCards = Number(prompt("How many cards do you want? (between 8 and 24, including 8 and 24)"))}
    // Only allow numbers that are even and that are between 8 and 24
    while (requestedCards % 2 !== 0 || requestedCards == 0 || requestedCards < 8 || requestedCards > 24);
    return requestedCards; // Return em
  }

  async checkMatch() {
    // Checks if the flipped cards are the same using the name property (which i created)
    if (this.flippedCards[0]['name'] === this.flippedCards[1]['name']) {     

        // Set allowFlip to false for matched cards so it cant be unflipped
        this.flippedCards.forEach(card => card['allowFlip'] = false);

        // Increases the score
        this.scoreElement.innerHTML = Number(this.scoreElement.innerHTML) + 1; 

        // Empty the flipped cards (should i rename it to 'selectedCards'?)
        this.flippedCards = [];
    } 
    else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Unflip the cards
      this.flippedCards.forEach(card => {
          card['card'].classList.toggle("flipped");
          card['allowFlip'] = true;
      });
      // Clear flipped cards after unflipping
      this.flippedCards = [];
    }
    this.isProcessingFlip = false;
  }

  async checkCompleted() {
    // Checks if all the cards are flipped
    if (this.allCards.every(card => card['card'].classList.contains("flipped"))) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before flipping the cards back

      // Flip all cards back
      this.allCards.forEach(c => c['card'].classList.toggle("flipped"));

      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5 sec

      // Make each card 'fall' for a cool and 'dramatic' effect
      for (let index = 0; index < this.allCards.length; index++) {
        const card = this.allCards[index]; // Fetches card from the cards on the field with the index
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for 100ms before making the next card fall
        card['card'].classList.add('fall'); // Adds the fall class which also starts the falling animation
      }

      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before resetting the game

      // Reset everything and start a fresh game
      this.scoreElement.innerHTML = 0;  
      this.allCards = [];
      this.flippedCards = [];
      this.startCardGame();
    }
  }

  async handleCardClick(card) {
    if (this.isProcessingFlip || this.flippedCards.length >= 2) return;

    // Gets the current index of the cards inside allCards
    const index = this.allCards.findIndex(cardobj => cardobj['card'] === card);

    if (!card.classList.contains("flipped") && this.allCards[index]['allowFlip'] === true) {
        // Flip the card if it's not flipped and allowed
        card.classList.toggle('flipped');
        this.flippedCards.push(this.allCards[index]);
        this.allCards[index]['allowFlip'] = false; // Dont allow the player to unflip the card to prevent 'peeking' or cheating
        
        if (this.flippedCards.length === 2) {
          this.isProcessingFlip = true; // Set the flag before processing the flip
          await this.checkMatch();
        }
    }

    // Check for completion of the game
    await this.checkCompleted();
  }

  createCards(cardsList) {
    // Creates an HTML div element for each card in the cards list
    for (let i = 0; i < cardsList.length; i++) {
      let carddiv = this.createCardDiv(i, cardsList);

      // Append the sides to the card div and push them to a reference list
      carddiv[0].appendChild(carddiv[1]);
      carddiv[0].appendChild(carddiv[2]);
      carddiv[2].appendChild(carddiv[4]);
      carddiv[4].appendChild(carddiv[3]);

      // Creates an object with a name to make match checking easier and allowflip to prevent peeking and the card itself
      this.allCards.push({'name': cardsList[i][1], 'allowFlip': true, 'card': carddiv[0]});
    }
  }

  createCardDiv(i, cardsList) {
    // Create card
    let newCard = document.createElement("div");
    newCard.addEventListener('click', () => this.handleCardClick(newCard))
    newCard.classList.add('card')
    document.getElementById("app").appendChild(newCard); // Append to div which is a grid and will contain all cards

    // Create the front and backside and places an image inside the imgcontainer inside the back div
    let frontSide = document.createElement("div");
    frontSide.classList.add('card-front');
    let backSide = document.createElement("div");
    let backImg = document.createElement("img");
    let imgContainer = document.createElement("div");
    backImg.src = cardsList[i][2];
    backImg.classList.add("img")
    backSide.classList.add('card-back');

    return [newCard, frontSide, backSide, backImg, imgContainer];
  }

  clearScreen() {
    // Remove the cards from the grid using a loop
    for (let [key, value] of Object.entries(document.getElementById("app").children)) if (key !== 'length') value.remove();
  }

  startCardGame() {
    // Clears screen and waits 0.5 sec before starting
    this.clearScreen();
    setTimeout(() => this.createCards(this.fetchCards()), 500);
  }
}

// Constructor runs automatically so startCardGame also runs automatically
const main = new Game();
