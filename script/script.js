let templateDeck = {
	detail: {
		title: 'New Deck',
		shuffle: [-1, -1, 1, 1, 0],
		showQuestion: true,
	},
	cards: [],
};

class Display {
	constructor(book) {
		this.element = document.querySelector('.display');
	}

	addDeck(object) {
		// console.log('display.addDeck ' + object);
	}
}

class DeckBar {
	constructor(book) {
		this.element = document.querySelector('.deckBar');
		this.ulButton = document.querySelector('#upload');
		this.ulButton.addEventListener('change', this.uploadFiles);
	}

	activateCreateNew() {
		this.newButton = document.querySelector('.newDeck');
		this.newButton.addEventListener('click', () => {
			book.addDeck(templateDeck);
		});
	}

	addDeck(object) {
		this.element.appendChild(object.icon);
		// console.log('deckBar.addDeck ' + object);
	}

	uploadFiles(ulButtonEvent) {
		let files = ulButtonEvent.target.files;

		for (let i = 0; i < files.length; i++) {
			readFile(files[i]);
		}

		ulButtonEvent.target.value = '';

		function readFile(file) {
			let reader = new FileReader();

			reader.readAsText(file);

			reader.onload = function () {
				let output = JSON.parse(reader.result);
				book.addDeck(output);
			};

			reader.onerror = function () {
				console.log(reader.error);
			};
		}
	}

	removeIcon(deckid) {
		// console.log('delete ' + deckid);
		this.element.querySelector(`#deck${deckid}`).remove();
	}

	refresh(deckid) {
		let icon = this.element.querySelector(`#deck${deckid}`);
		icon.firstElementChild.innerText = book.decks[deckid - 1].title;
	}
}

class Navigation {
	constructor(domElement) {
		this.element = document.querySelector(`.${domElement}`);
		this.element.onclick = this.onClick.bind(this);
		this.deckid = 0;
		this.card;
	}

	setDeck(deckid) {
		this.deckid = deckid;
	}

	onClick(event) {
		event.preventDefault();
		const el = event.target;
		// console.log(el);

		[...this.element.querySelectorAll('.button')].forEach((button) => {
			// console.log(button);
			button.classList.remove('toggleShowSelected');
		});

		if (this.deckid != 0) {
			if (el.classList.contains('learnDeckButton')) {
				learnDeck.presentCard(
					this.deckid,
					book.decks[this.deckid - 1].currentCard,
					book.decks[this.deckid - 1].showQuestion
				);
				learnDeck.showSelf();
				viewDeck.hideSelf();
				viewCards.hideSelf();
				el.classList.add('toggleShowSelected');
			} else if (el.classList.contains('viewDeckButton')) {
				learnDeck.hideSelf();
				viewDeck.showSelf();
				viewDeck.refresh(this.deckid);
				viewCards.hideSelf();
				el.classList.add('toggleShowSelected');
			} else if (el.classList.contains('viewCardsButton')) {
				viewCards.viewCard(
					this.deckid,
					book.decks[this.deckid - 1].currentCard
				);
				learnDeck.hideSelf();
				viewDeck.hideSelf();
				viewCards.showSelf();
				el.classList.add('toggleShowSelected');
			}
		}
	}
}

class deckScreen {
	constructor(domElement) {
		this.element = document.querySelector(`.${domElement}`);
		// this.element.onclick = this.onClick;
		this.element.onclick = this.onClick.bind(this);
		this.deckid;
		this.card;
	}

	onClick(event) {
		event.preventDefault();
		const el = event.target;
		// console.log(el);
	}

	showSelf() {
		this.element.classList.remove('hidden');
	}

	hideSelf() {
		this.element.classList.add('hidden');
	}
}

class ViewDeck extends deckScreen {
	constructor(domElement) {
		super(domElement);

		this.viewDeckName = this.element.querySelector('h3');
		this.viewDeckNameInput = this.element.querySelector('.inputDeckName');

		this.viewDeckScoreCounts = this.element.querySelectorAll('.viewCounts');
		this.viewDeckToggleFront = this.element.querySelector('.toggleFront');
		this.viewDeckToggleBack = this.element.querySelector('.toggleBack');

		this.viewDeckShuffleButtons = [];
		for (let i = 1; i <= 5; i++) {
			this.viewDeckShuffleButtons.push([]);
			this.viewDeckShuffleButtons[i - 1].push(
				this.element.querySelector(`.shuffle-1${i}`)
			);
			this.viewDeckShuffleButtons[i - 1].push(
				this.element.querySelector(`.shuffleN${i}`)
			);
			this.viewDeckShuffleButtons[i - 1].push(
				this.element.querySelector(`.shuffle0${i}`)
			);
		}
	}

	refresh(deckid) {
		this.deckid = deckid;
		let deck = book.decks[this.deckid - 1];

		// title
		this.viewDeckName.innerText = deck.title;
		this.viewDeckNameInput.value = this.viewDeckName.innerText;

		// counts by score
		const count = [];
		let countTotal = 0;
		for (let i = 1; i <= 5; i++) {
			const currentCount = deck.cardsWithScore(i).length;
			count.push(currentCount);
			countTotal += currentCount;
		}
		for (let i = 0; i < this.viewDeckScoreCounts.length; i++) {
			this.viewDeckScoreCounts[i].innerText = i + 1 + ': ' + count[i];
		}
		this.viewDeckScoreCounts[this.viewDeckScoreCounts.length - 1].innerText =
			'Total: ' + countTotal;

		// option to show card front or back
		if (deck.showQuestion) {
			this.viewDeckToggleFront.classList.add('toggleShowSelected');
			this.viewDeckToggleBack.classList.remove('toggleShowSelected');
		} else {
			this.viewDeckToggleFront.classList.remove('toggleShowSelected');
			this.viewDeckToggleBack.classList.add('toggleShowSelected');
		}

		// show shuffle button options
		for (let i = 0; i <= 4; i++) {
			for (let j = 0; j <= 2; j++) {
				this.viewDeckShuffleButtons[i][j].classList.remove(
					'toggleShowSelected'
				);
			}
			if (deck.shuffle[i] == -1) {
				this.viewDeckShuffleButtons[i][0].classList.add('toggleShowSelected');
			} else if (deck.shuffle[i] == 0) {
				this.viewDeckShuffleButtons[i][2].classList.add('toggleShowSelected');
			} else {
				this.viewDeckShuffleButtons[i][1].classList.add('toggleShowSelected');
			}
		}
	}

	editDeckName(event) {
		let deck = book.decks[this.deckid - 1];

		// console.log(deck.title);
		if (this.viewDeckName.classList.contains('hidden')) {
			let oldTitle = deck.title;
			this.viewDeckName.classList.remove('hidden');
			this.viewDeckNameInput.classList.add('hidden');
			deck.title = this.viewDeckNameInput.value;
			this.refresh(this.deckid);
			deckBar.refresh(this.deckid);
			storedDecks.deleteDeck(oldTitle);
		} else {
			this.viewDeckName.classList.add('hidden');
			this.viewDeckNameInput.classList.remove('hidden');
			this.viewDeckNameInput.focus();
			this.viewDeckNameInput.selectionStart = this.viewDeckNameInput.selectionEnd = this.viewDeckNameInput.value.length;
		}
	}

	onClick(event) {
		let deck = book.decks[this.deckid - 1];

		// shuffle options updated
		if (event.target.classList.contains('toggleShuffle')) {
			if (event.target.dataset.id == 'edit11') deck.shuffle[0] = -1;
			if (event.target.dataset.id == 'edit12')
				deck.shuffle[0] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit13') deck.shuffle[0] = 0;

			if (event.target.dataset.id == 'edit21') deck.shuffle[1] = -1;
			if (event.target.dataset.id == 'edit22')
				deck.shuffle[1] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit23') deck.shuffle[1] = 0;

			if (event.target.dataset.id == 'edit31') deck.shuffle[2] = -1;
			if (event.target.dataset.id == 'edit32')
				deck.shuffle[2] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit33') deck.shuffle[2] = 0;

			if (event.target.dataset.id == 'edit41') deck.shuffle[3] = -1;
			if (event.target.dataset.id == 'edit42')
				deck.shuffle[3] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit43') deck.shuffle[3] = 0;

			if (event.target.dataset.id == 'edit51') deck.shuffle[4] = -1;
			if (event.target.dataset.id == 'edit52')
				deck.shuffle[4] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit53') deck.shuffle[4] = 0;
		} else if (event.target.classList.contains('toggleDeckShow')) {
			if (event.target.classList.contains('toggleFront')) {
				deck.showQuestion = true;
			} else {
				deck.showQuestion = false;
			}
			this.refresh(this.deckid);
		} else if (event.target.classList.contains('resetButton')) {
			// reset all cards to score 1
			deck.resetCards();
		} else if (event.target.classList.contains('deleteButton')) {
			storedDecks.deleteDeck(deck.title); // delete the deck from storage
			deckBar.removeIcon(this.deckid); // remove the icon
			this.hideSelf(); // hide this screen
			navigation.deckid = 0;
			return 'deleted'; // return is here so that execution breaks and deck isn't stored
		} else if (event.target.classList.contains('editDeckName')) {
			this.editDeckName();
		}

		storedDecks.storeDeck(deck.title, deck.dumpDeck());
		this.refresh(this.deckid);
	}
}

class ViewCards extends deckScreen {
	constructor(domElement) {
		super(domElement);

		// learnDeck div that shows in display
		this.viewCardsFront = this.element.querySelector('.viewCardsFront');
		this.viewCardsBack = this.element.querySelector('.viewCardsBack');

		// buttons for learning, grades then reveal button
		this.viewCardsResponseButtons = [
			...this.element.querySelectorAll('.viewCardsResponseButton'),
		];

		// scroll list showing all cards in deck
		this.viewCardsScrollBox = this.element.querySelector('#viewCardsScrollBox');
	}

	viewCard(deckid, card) {
		this.deckid = deckid;
		this.card = card;

		if (book.decks[deckid - 1].cards.length > 0) {
			// show card front and back
			this.viewCardsFront.value = card.front;
			this.viewCardsBack.value = card.back;

			// highlight the current score
			this.viewCardsResponseButtons.forEach((button) =>
				button.classList.remove('toggleShowSelected')
			);
			this.viewCardsResponseButtons[card.score - 1].classList.add(
				'toggleShowSelected'
			);
		} else {
			this.startNewCard();
		}

		// show list of cards in the deck and highlight the selected card
		this.updateScrollList(this.deckid);
	}

	updateScrollList(deckid) {
		// empty out scroll list
		let firstChild = this.viewCardsScrollBox.firstElementChild;
		while (firstChild) {
			firstChild.remove();
			firstChild = this.viewCardsScrollBox.firstElementChild;
		}

		// populate with current deck
		let currentCardIndex = book.decks[deckid - 1].cards.indexOf(this.card);
		let newCardDiv;
		let delImage;
		let cards = book.decks[deckid - 1].dumpCards();
		for (let i = 0; i < cards.length; i++) {
			// create new list element
			newCardDiv = document.createElement('div');
			newCardDiv.innerText = cards[i].front;
			newCardDiv.dataset.cardid = i;
			newCardDiv.classList.add('scrollCard');
			newCardDiv.classList.add('button');

			// add and format delete image
			delImage = document.createElement('img');
			delImage.setAttribute('src', 'images/delete.png');
			delImage.dataset.cardid = i;
			delImage.style.width = '10px';
			delImage.style.border = '0';
			delImage.align = 'right';
			delImage.style.margin = '5px';
			delImage.classList.add('deleteCard');
			newCardDiv.appendChild(delImage);

			// highlight row item if it is the card currently shown in the viewer
			if (i == currentCardIndex) {
				newCardDiv.classList.add('toggleShowSelected');
			}

			// append the list item
			this.viewCardsScrollBox.appendChild(newCardDiv);
		}
	}

	deleteCard(cardId) {
		book.decks[this.deckid - 1].cards.splice(cardId, 1);
		this.startNewCard();
		storedDecks.storeDeck(
			book.decks[this.deckid - 1].title,
			book.decks[this.deckid - 1].dumpDeck()
		);
	}

	startNewCard() {
		this.card = -1;
		this.updateScrollList(this.deckid);
		this.viewCardsFront.value = '';
		this.viewCardsBack.value = '';
		this.viewCardsFront.focus();
	}

	saveCard(cardId, front, back, score) {
		let currentDeck = book.decks[this.deckid - 1];
		currentDeck.cards[cardId].front = front;
		currentDeck.cards[cardId].back = back;
		currentDeck.cards[cardId].score = score;
		storedDecks.storeDeck(currentDeck.title, currentDeck.dumpDeck());
	}

	onClick(event) {
		event.preventDefault();
		const el = event.target;

		if (el.classList.contains('scrollCard')) {
			this.viewCard(
				this.deckid,
				book.decks[this.deckid - 1].cards[el.dataset.cardid]
			);
		} else if (el.classList.contains('viewCardsNewButton')) {
			this.startNewCard();
		} else if (el.classList.contains('viewCardsResponseButton')) {
			if (this.card == -1) {
				book.decks[this.deckid - 1].addCard(
					this.viewCardsFront.value,
					this.viewCardsBack.value,
					parseInt(el.innerText, 10)
				);
				this.startNewCard();
			} else {
				this.saveCard(
					book.decks[this.deckid - 1].cards.indexOf(this.card),
					this.viewCardsFront.value,
					this.viewCardsBack.value,
					parseInt(el.innerText, 10)
				);
				this.startNewCard();
			}
		} else if (el.classList.contains('deleteCard')) {
			this.deleteCard(el.dataset.cardid);
			this.startNewCard();
		}
	}
}

class LearnDeck extends deckScreen {
	constructor(domElement) {
		super(domElement);

		// learnDeck div that shows in display
		this.learnDeckFront = this.element.querySelector('.learnDeckFront');
		this.learnDeckFrontSecret = this.element.querySelector(
			'.learnDeckFrontSecret'
		);
		this.learnDeckBack = this.element.querySelector('.learnDeckBack');
		this.learnDeckBackSecret = this.element.querySelector(
			'.learnDeckBackSecret'
		);

		// buttons for learning, grades then reveal button
		this.learnDeckResponseButtons = [
			...this.element.querySelectorAll('.learnDeckResponseButton'),
		];
		this.learnDeckResponseGrades = this.element.querySelector(
			'.learnDeckResponseGrades'
		);
		this.learnDeckRevealButton = this.element.querySelector(
			'.learnDeckRevealButton'
		);
	}

	presentCard(deckid, card, showQuestion) {
		this.deckid = deckid;

		if (book.decks[deckid - 1].cards.length > 0) {
			this.card = card;
			this.learnDeckFront.innerHTML = card.front;
			this.learnDeckBack.innerHTML = card.back;

			// present front or back depending on setting
			if (showQuestion) {
				this.learnDeckFront.classList.remove('hidden');
				this.learnDeckFrontSecret.classList.add('hidden');
				this.learnDeckBack.classList.add('hidden');
				this.learnDeckBackSecret.classList.remove('hidden');
			} else {
				this.learnDeckFront.classList.add('hidden');
				this.learnDeckFrontSecret.classList.remove('hidden');
				this.learnDeckBack.classList.remove('hidden');
				this.learnDeckBackSecret.classList.add('hidden');
			}

			// highlight the current score
			this.learnDeckResponseButtons.forEach((button) =>
				button.classList.remove('toggleShowSelected')
			);
			this.learnDeckResponseButtons[card.score - 1].classList.add(
				'toggleShowSelected'
			);

			// hide score buttons but show the reveal button
			this.learnDeckResponseGrades.classList.add('hidden');
			this.learnDeckRevealButton.classList.remove('hidden');
		} else {
			this.learnDeckFront.classList.add('hidden');
			this.learnDeckFrontSecret.classList.remove('hidden');
			this.learnDeckBack.classList.add('hidden');
			this.learnDeckBackSecret.classList.remove('hidden');
		}
	}

	showCard() {
		// show front and back
		this.learnDeckFront.classList.remove('hidden');
		this.learnDeckFrontSecret.classList.add('hidden');
		this.learnDeckBack.classList.remove('hidden');
		this.learnDeckBackSecret.classList.add('hidden');

		// hide reveal button and show grade buttons
		this.learnDeckResponseGrades.classList.remove('hidden');
		this.learnDeckRevealButton.classList.add('hidden');
	}

	onClick(event) {
		event.preventDefault();
		const el = event.target;
		if (el.classList.contains('learnDeckRevealButton')) {
			// if hitting reveal button, show the card q and a and the score buttons
			this.showCard();
		} else if (el.classList.contains('learnDeckResponseButton')) {
			// if hitting a score button, update the card score then show the next card
			book.decks[this.deckid - 1].scoreCurrentCard(parseInt(el.innerText, 10));
			this.presentCard(
				this.deckid,
				book.decks[this.deckid - 1].currentCard,
				book.decks[this.deckid - 1].showQuestion
			);
		} else if (el.classList.contains('learnDeckEdit')) {
			learnDeck.hideSelf();
			viewCards.viewCard(this.deckid, this.card);
			viewCards.showSelf();
		}
		// console.log(el);
	}
}

class Deck {
	constructor(id, newDeck) {
		this.title = newDeck.detail.title;
		this.shuffle = newDeck.detail.shuffle;
		this.showQuestion = newDeck.detail.showQuestion;
		this.cards = newDeck.cards;
		this.currentCard = 0;
		this.id = id;

		// each deck has an icon in the deckBar
		const iconTemplate = document.querySelector('#iconTemplate');
		this.icon = iconTemplate.cloneNode(true);
		// console.log(this.icon);
		this.icon.onclick = this.onClickIcon.bind(this);

		this.icon.classList.remove('hidden');
		this.icon.querySelector('a').innerText = this.title;
		this.icon.dataset.id = this.id;
		this.icon.id = 'deck' + this.id;

		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	// when the icon in the deckbar is clicked
	onClickIcon(event) {
		if (event.target.classList.contains('download')) {
			// handle download if the download icon is hit
			this.downloadFile();
		} else {
			let selectedDeck = 0;

			// or clicked on the icon so handle coloration

			[...deckBar.element.querySelectorAll('.deckIcon')].forEach((icon) => {
				icon.classList.remove('toggleShowSelected');
			});
			[...deckBar.element.querySelectorAll('.deckText')].forEach((icon) => {
				icon.classList.remove('toggleShowSelected');
			});
			const el = event.target;
			el.classList.add('toggleShowSelected');
			if (el.classList.contains('deckText')) {
				el.parentElement.classList.add('toggleShowSelected');
				selectedDeck = el.parentElement.dataset.id;
			} else {
				selectedDeck = el.dataset.id;
			}

			// and what to show here now that the icon is clicked
			this.setNextCard();

			viewDeck.showSelf();
			viewDeck.refresh(this.id);
			learnDeck.hideSelf();
			viewCards.hideSelf();

			navigation.setDeck(this.id);
			navigation.element.querySelector('.viewDeckButton').click();
		}
	}

	downloadFile() {
		function SaveAsFile(t, f, m) {
			try {
				var b = new Blob([t], { type: m });
				saveAs(b, f);
			} catch (e) {
				window.open('data:' + m + ',' + encodeURIComponent(t), '_blank', '');
			}
		}

		SaveAsFile(
			JSON.stringify(this.dumpDeck()),
			this.title + '.json',
			'text/plain;charset=utf-8'
		);
	}

	addCard(front, back, score) {
		const newCard = new Card(front, back, score);
		this.cards.push(newCard);
		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	dumpCards() {
		return this.cards;
	}

	dumpDeck() {
		let deck = {
			detail: {
				title: this.title,
				shuffle: this.shuffle,
				showQuestion: this.showQuestion,
			},
			cards: this.cards,
		};

		return deck;
	}

	resetCards() {
		this.cards.forEach((card) => (card.score = 1));
		storedDecks.storeDeck(this.title, this.dumpCards());
	}

	deleteCard(cardId) {
		this.cards.splice(cardId, 1);
		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	saveCard(cardId, front, back, score) {
		this.cards[cardId].front = front;
		this.cards[cardId].back = back;
		this.cards[cardId].score = score;
		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	cardsWithScore(searchScore) {
		// function to have deck return cards with score
		return this.cards.filter((card) => card.score === searchScore);
	}

	setNextCard() {
		// algorithm here to determine which card to show

		let notFound = true;
		let include = [0, 0, 0, 0, 0];
		let score = [0, 0, 0, 0, 0];
		for (let i = 1; i <= 5; i++) {
			if (
				this.cardsWithScore(i).length > 0 &&
				notFound &&
				this.shuffle[i - 1] == -1
			) {
				this.currentCard = this.cardsWithScore(i)[0];
				notFound = false;
			}
		}

		if (notFound) {
			for (let i = 1; i <= 5; i++) {
				if (this.cardsWithScore(i).length > 0 && this.shuffle[i - 1] > 0) {
					include[i - 1] = this.shuffle[i - 1];
				} else {
					include[i - 1] = 0;
				}
			}
			let randomDraw = Math.random();
			let scoreSum =
				include[0] + include[1] + include[2] + include[3] + include[4];
			let drawScore;

			score[0] = include[0] / scoreSum;
			score[1] = include[1] / scoreSum;
			score[2] = include[2] / scoreSum;
			score[3] = include[3] / scoreSum;
			score[4] = include[4] / scoreSum;

			let runningSum = 0;

			for (let i = 1; i <= 5; i++) {
				if (this.cardsWithScore(i).length != 0) {
					runningSum += score[i - 1];
				}
				if (
					this.cardsWithScore(i).length > 0 &&
					this.shuffle[i - 1] > 0 &&
					notFound &&
					randomDraw < runningSum
				) {
					this.currentCard = this.cardsWithScore(i)[0];
					drawScore = i;
					notFound = false;
				}
			}
		}

		if (notFound && this.cards.length > 0) {
			modal.classList.remove('hidden');
			this.currentCard = this.cards[0];
			return 1;
		}

		return this.currentCard;
	}

	scoreCurrentCard(chosenScore) {
		// update card score
		this.currentCard.score = chosenScore;

		// push card back n deep in its own category
		if (chosenScore == 1) {
			this.pushBackCard(this.currentCard, 5);
		} else if (chosenScore == 2) {
			this.pushBackCard(this.currentCard, 5);
		} else if (chosenScore == 3) {
			this.pushBackCard(this.currentCard, 5);
		} else if (chosenScore == 4) {
			this.pushBackCard(this.currentCard, 5);
		} else {
			this.pushBackCard(this.currentCard, this.cards.length);
		}

		storedDecks.storeDeck(this.title, this.dumpDeck());

		// do another
		this.setNextCard();
	}

	pushBackCard(cardToPush, howFarBack) {
		// reorganize cards in deck by pushing back the required amt in cards of the same score

		let deckSize = this.cards.length;
		let i = 0; // track how many move backs have happened
		let j = this.cards.indexOf(cardToPush);
		let tempCard;

		while (i < howFarBack && j <= deckSize - 2) {
			tempCard = this.cards[j + 1];
			this.cards[j + 1] = cardToPush;
			this.cards[j] = tempCard;
			i++;
			j = this.cards.indexOf(cardToPush);
		}
	}

	onKeyup(event) {
		let keyPressed = event.code;
		let numPressed = keyPressed.charAt(keyPressed.length - 1);

		if (!learnDeck.element.classList.contains('hidden')) {
			if (
				!learnDeck.element
					.querySelector('.learnDeckRevealButton')
					.classList.contains('hidden') &&
				keyPressed == 'Space'
			) {
				learnDeck.element.querySelector('#reveal').click();
			} else if (['1', '2', '3', '4', '5'].includes(numPressed)) {
				if (numPressed === '1') {
					learnDeck.element.querySelector('#res1').click();
				} else if (numPressed === '2') {
					learnDeck.element.querySelector('#res2').click();
				} else if (numPressed === '3') {
					learnDeck.element.querySelector('#res3').click();
				} else if (numPressed === '4') {
					learnDeck.element.querySelector('#res4').click();
				} else if (numPressed === '5') {
					learnDeck.element.querySelector('#res5').click();
				}
			}
		}
		// else if (!viewCards.element.classList.contains('hidden')) {
		// 	console.log('viewcards');
		// 	console.log(keyPressed);

		// 	console.log(numPressed);
		// }
	}
}

class Card {
	constructor(front, back, score) {
		this.front = front;
		this.back = back;
		this.score = score;
	}
}

class Storage {
	constructor(initialDeck) {
		this.directory = [];

		if (localStorage.getItem('directory') === null) {
			this.storeDeck(initialDeck.detail.title, initialDeck);
		} else {
			this.directory = this.getDeck('directory');
		}
	}

	getDirectory() {
		return this.directory;
	}

	storeDeck(key, value) {
		if (!this.directory.includes(key)) {
			this.directory.push(key);
		}

		if (localStorage) {
			localStorage.setItem('directory', JSON.stringify(this.directory));
		} else {
			$.cookies.set('directory', JSON.stringify(this.directory));
		}

		if (localStorage) {
			localStorage.setItem(key, JSON.stringify(value));
		} else {
			$.cookies.set(key, JSON.stringify(value));
		}

		return key;
	}

	getDeck(key) {
		if (localStorage) {
			return JSON.parse(localStorage.getItem(key));
		} else {
			return JSON.parse($.cookies.get(key));
		}
	}

	deleteDeck(key) {
		for (let i = 0; i < this.directory.length; i++) {
			if (key === this.directory[i]) {
				this.directory.splice(i, 1);
				i = this.directory.length + 1;
			}
		}

		if (localStorage) {
			localStorage.setItem('directory', JSON.stringify(this.directory));
		} else {
			$.cookies.set('directory', JSON.stringify(this.directory));
		}

		if (localStorage) {
			localStorage.removeItem(key);
		} else {
			$.cookies.remove(key);
		}
	}
}

class Book {
	constructor(initialDecks) {
		this.decks = [];
		this.counter = 0;

		initialDecks.getDirectory().forEach((dir) => {
			this.addDeck(storedDecks.getDeck(dir));
		});
	}

	addDeck(newDeck) {
		this.counter += 1;
		let tempDeck = new Deck(this.counter, newDeck);
		this.decks.push(tempDeck);

		// add icon to the deckbar
		deckBar.addDeck(tempDeck);
	}

	getDecks() {
		return this.decks;
	}
}

const modal = document.querySelector('#modal');

////////////////////////////////////////////////
//
// modal Functions
//
////////////////////////////////////////////////

modal.addEventListener('click', function (event) {
	event.preventDefault();
	if (event.target.id === 'close') {
		modal.classList.add('hidden');
	}
});

const navigation = new Navigation('navigation');

const deckBar = new DeckBar();
const display = new Display();
const storedDecks = new Storage(uscapitals); // pass default deck in case that this is a new run or cleared mem
const viewDeck = new ViewDeck('viewDeck');
const book = new Book(storedDecks);
const learnDeck = new LearnDeck('learnDeck');
const viewCards = new ViewCards('viewCards');

deckBar.activateCreateNew();

document.querySelector('body').addEventListener('keyup', (event) => {
	book.getDecks().forEach((deck) => {
		if (navigation.deckid == deck.id) {
			deck.onKeyup(event);
		}
	});
});
