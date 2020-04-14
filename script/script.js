class DeckDisplay {
	constructor(book) {
		this.element = document.querySelector('.deckDisplay');
	}

	hideAll() {
		let object = this.element.firstElementChild;

		while (object) {
			object.classList.add('hidden');
			object = object.nextElementSibling;
		}
	}

	addDeck(object) {
		this.element.appendChild(object.test);
		this.element.appendChild(object.view);
		this.element.appendChild(object.edit);
		this.element.appendChild(object.alter);
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
}

class Deck {
	constructor(id, newDeck) {
		this.title = newDeck.detail.title;
		this.shuffle = newDeck.detail.shuffle;
		this.showQuestion = newDeck.detail.showQuestion;
		this.cards = newDeck.cards;
		this.currentCard = 0;

		// icon that shows in deckBar
		const iconTemplate = document.querySelector('#iconTemplate');
		this.icon = iconTemplate.cloneNode(true);
		this.icon.onclick = this.onClickIcon.bind(this);

		const newImage = document.createElement('img');
		this.icon.classList.remove('hidden');
		this.icon.querySelector('a').innerText = this.title;
		this.icon.dataset.id = id;
		this.icon.id = 'deck' + id;

		// view div that shows in deckDisplay
		const viewTemplate = document.querySelector('#viewTemplate');
		this.view = viewTemplate.cloneNode(true);
		this.view.onclick = this.onClickView.bind(this);
		this.view.id = 'view' + id;
		this.view.querySelector('h3').innerText = this.title;
		this.viewToggleFront = this.view.querySelector('.toggleFront');
		this.viewToggleBack = this.view.querySelector('.toggleBack');

		// test div that shows in deckDisplay
		const testTemplate = document.querySelector('#testTemplate');
		this.test = testTemplate.cloneNode(true);
		this.test.onclick = this.onClickTest.bind(this);
		this.test.id = 'test' + id;
		this.testFront = this.test.querySelector('.testCardFront');
		this.testFrontSecret = this.test.querySelector('.testCardSecretFront');
		this.testBack = this.test.querySelector('.testCardBack');
		this.testBackSecret = this.test.querySelector('.testCardSecretBack');

		// edit div that lets you reset scores or adjusting scoring preferences
		const editTemplate = document.querySelector('#editTemplate');
		this.edit = editTemplate.cloneNode(true);
		this.edit.onclick = this.onClickEdit.bind(this);
		this.edit.id = 'edit' + id;

		this.idn = this.edit.querySelector('.inputDeckName');
		this.dn = this.edit.querySelector('.deckName');

		this.dn.innerText = this.title;
		this.idn.value = this.title;
		this.editShuffleButtons = [];
		for (let i = 1; i <= 5; i++) {
			this.editShuffleButtons.push([]);
			this.editShuffleButtons[i - 1].push(
				this.edit.querySelector(`.shuffle-1${i}`)
			);
			this.editShuffleButtons[i - 1].push(
				this.edit.querySelector(`.shuffleN${i}`)
			);
			this.editShuffleButtons[i - 1].push(
				this.edit.querySelector(`.shuffle0${i}`)
			);
		}
		this.refreshViewStats();
		this.refreshEdit();

		// alter div that lets you edit or add cards
		const alterTemplate = document.querySelector('#alterTemplate');
		this.alter = alterTemplate.cloneNode(true);
		this.alter.onclick = this.onClickAlter.bind(this);
		this.alter.id = 'alter' + id;
		this.alterScrollBox = this.alter.querySelector('#scrollbox');
		this.alterCardDetail = this.alter.querySelector('.alterCard');
		this.alterFront = this.alter.querySelector('.alterCardFront');
		this.alterBack = this.alter.querySelector('.alterCardBack');
		this.refreshAlter();

		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	refreshIcon() {
		this.icon.querySelector('a').innerText = this.title;
	}

	refreshAlter() {
		let firstChild = this.alterScrollBox.firstElementChild;
		while (firstChild) {
			firstChild.remove();
			firstChild = this.alterScrollBox.firstElementChild;
		}

		let newCardDiv;
		let delImage;
		for (let i = 0; i < this.cards.length; i++) {
			newCardDiv = document.createElement('div');
			newCardDiv.innerText = this.cards[i].front;
			newCardDiv.dataset.deckid = i;
			newCardDiv.classList.add('scrollCard');
			newCardDiv.classList.add('button');
			delImage = document.createElement('img');
			delImage.setAttribute('src', 'images/delete.png');
			delImage.dataset.deckid = i;
			delImage.style.width = '10px';
			delImage.style.border = '0';
			delImage.align = 'right';
			delImage.style.margin = '5px';
			delImage.classList.add('deleteCard');
			newCardDiv.appendChild(delImage);
			this.alterScrollBox.appendChild(newCardDiv);
		}
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
		this.refreshViewStats();
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

	onClickIcon(event) {
		if (event.target.classList.contains('download')) {
			this.downloadFile();
		} else {
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
			}
			deckDisplay.hideAll();
			this.refreshViewStats();
			this.view.classList.remove('hidden');
		}
	}

	onClickView(event) {
		const el = event.target;
		if (el.classList.contains('learnButton')) {
			deckDisplay.hideAll();
			this.test.classList.remove('hidden');
			this.showNextCard();
		} else if (el.classList.contains('toggleFront')) {
			this.viewToggleFront.classList.add('toggleShowSelected');
			this.viewToggleBack.classList.remove('toggleShowSelected');
			this.showQuestion = true;
			storedDecks.storeDeck(this.title, this.dumpDeck());
		} else if (el.classList.contains('toggleBack')) {
			this.viewToggleFront.classList.remove('toggleShowSelected');
			this.viewToggleBack.classList.add('toggleShowSelected');
			this.showQuestion = false;
			storedDecks.storeDeck(this.title, this.dumpDeck());
		} else if (el.classList.contains('editButton')) {
			// this.resetCards();
			deckDisplay.hideAll();
			this.edit.classList.remove('hidden');
		}
	}

	onClickTest(event) {
		// depending on where you click we will do things
		event.preventDefault();
		const el = event.target;

		// click one of the buttons to grade your card
		if (el.classList.contains('testResponseButton')) {
			this.scoreCurrentCard(parseInt(el.innerText, 10));
		} else if (el.classList.contains('testRevealButton')) {
			this.revealCurrentCard(parseInt(el.innerText, 10));
		} else if (el.classList.contains('editTestCard')) {
			this.alterCard(this.cards.indexOf(this.currentCard));
			deckDisplay.hideAll();
			this.refreshAlter();
			this.alter.classList.remove('hidden');
		}
	}

	onClickEdit(event) {
		if (event.target.classList.contains('toggleShuffle')) {
			if (event.target.dataset.id == 'edit11') this.shuffle[0] = -1;
			if (event.target.dataset.id == 'edit12')
				this.shuffle[0] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit13') this.shuffle[0] = 0;

			if (event.target.dataset.id == 'edit21') this.shuffle[1] = -1;
			if (event.target.dataset.id == 'edit22')
				this.shuffle[1] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit23') this.shuffle[1] = 0;

			if (event.target.dataset.id == 'edit31') this.shuffle[2] = -1;
			if (event.target.dataset.id == 'edit32')
				this.shuffle[2] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit33') this.shuffle[2] = 0;

			if (event.target.dataset.id == 'edit41') this.shuffle[3] = -1;
			if (event.target.dataset.id == 'edit42')
				this.shuffle[3] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit43') this.shuffle[3] = 0;

			if (event.target.dataset.id == 'edit51') this.shuffle[4] = -1;
			if (event.target.dataset.id == 'edit52')
				this.shuffle[4] = parseInt(event.target.innerText, 10);
			if (event.target.dataset.id == 'edit53') this.shuffle[4] = 0;
		} else if (event.target.classList.contains('resetButton')) {
			this.resetCards();
		} else if (event.target.classList.contains('deleteButton')) {
			this.deleteDeck();
			return 'deleted';
		} else if (event.target.classList.contains('alterButton')) {
			deckDisplay.hideAll();
			this.refreshAlter();
			this.alter.classList.remove('hidden');
		} else if (event.target.classList.contains('editDeckName')) {
			this.editDeckName();
		}

		this.refreshEdit();
		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	editDeckName(event) {
		if (this.dn.classList.contains('hidden')) {
			let oldTitle = this.title;
			this.dn.classList.remove('hidden');
			this.idn.classList.add('hidden');
			this.title = this.idn.value;
			this.refreshEdit();
			this.refreshViewStats();
			this.refreshAlter();
			this.refreshIcon();
			storedDecks.deleteDeck(oldTitle);
		} else {
			this.dn.classList.add('hidden');
			this.idn.classList.remove('hidden');
			this.idn.focus();
			this.idn.selectionStart = this.idn.selectionEnd = this.idn.value.length;
		}
	}

	onClickAlter(event) {
		if (event.target.classList.contains('scrollCard')) {
			this.alterCard(event.target.dataset.deckid);
			[...this.alter.querySelectorAll('.scrollCard')].forEach((card) =>
				card.classList.remove('toggleShowSelected')
			);
			event.target.classList.add('toggleShowSelected');
		} else if (event.target.classList.contains('alterScoreButton')) {
			if (parseInt(this.alterCardDetail.dataset.currentcard, 10) != -1) {
				this.saveCard(
					parseInt(this.alterCardDetail.dataset.currentcard, 10),
					this.alterFront.value,
					this.alterBack.value,
					parseInt(event.target.innerText, 10)
				);
				this.refreshAlter();
			} else {
				this.addCard(
					this.alterFront.value,
					this.alterBack.value,
					parseInt(event.target.innerText, 10)
				);
				this.refreshAlter();
			}
			this.startNewCard();
		} else if (event.target.classList.contains('newButton')) {
			this.startNewCard();
			this.refreshAlter();
		} else if (event.target.classList.contains('deleteCard')) {
			this.deleteCard(event.target.dataset.deckid);
			this.refreshAlter();
			this.startNewCard();
		}
	}

	deleteCard(cardId) {
		this.cards.splice(cardId, 1);
		this.refreshAlter();
		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	startNewCard() {
		this.alterCardDetail.dataset.currentcard = -1;
		this.alterFront.value = '';
		this.alterBack.value = '';
		this.alterFront.focus();
	}

	saveCard(cardId, front, back, score) {
		this.cards[cardId].front = front;
		this.cards[cardId].back = back;
		this.cards[cardId].score = score;
		storedDecks.storeDeck(this.title, this.dumpDeck());
	}

	alterCard(cardId) {
		this.alterCardDetail.dataset.currentcard = cardId;
		this.alterFront.value = this.cards[cardId].front;
		this.alterBack.value = this.cards[cardId].back;
	}

	deleteDeck() {
		this.icon.classList.add('hidden');
		this.view.classList.add('hidden');
		this.edit.classList.add('hidden');
		this.test.classList.add('hidden');
		this.alter.classList.add('hidden');
		storedDecks.deleteDeck(this.title);
	}

	onKeyup(event) {
		let keyPressed = event.code;
		let numPressed = keyPressed.charAt(keyPressed.length - 1);

		if (!this.test.classList.contains('hidden')) {
			if (this.getTestButtons() == 'reveal') {
				this.revealCurrentCard();
			} else if (['1', '2', '3', '4', '5'].includes(numPressed)) {
				this.scoreCurrentCard(parseInt(numPressed, 10));
			}
		} else if (!this.alter.classList.contains('hidden')) {
			let scoreButtons = [...this.alter.querySelectorAll('.alterScoreButton')];
			if (
				(keyPressed == 'NumpadEnter' || keyPressed == 'Enter') &&
				scoreButtons.includes(document.activeElement)
			) {
				event.target.click();
			}
		}
	}

	cardsWithScore(searchScore) {
		// function to have deck return cards with score
		return this.cards.filter((card) => card.score === searchScore);
	}

	refreshViewStats() {
		// counts
		const count = [];
		let countTotal = 0;
		for (let i = 1; i <= 5; i++) {
			const currentCount = this.cardsWithScore(i).length;
			count.push(currentCount);
			countTotal += currentCount;
		}
		const viewCounts = this.view.querySelectorAll('.viewCounts');
		for (let i = 0; i < viewCounts.length; i++) {
			viewCounts[i].innerText = i + 1 + ': ' + count[i];
		}
		viewCounts[viewCounts.length - 1].innerText = 'Total: ' + countTotal;

		if (this.showQuestion) {
			this.viewToggleFront.classList.add('toggleShowSelected');
			this.viewToggleBack.classList.remove('toggleShowSelected');
		} else {
			this.viewToggleFront.classList.remove('toggleShowSelected');
			this.viewToggleBack.classList.add('toggleShowSelected');
		}
	}

	refreshEdit() {
		this.dn.innerText = this.title;
		this.idn.value = this.dn.innerText;
		for (let i = 0; i <= 4; i++) {
			for (let j = 0; j <= 2; j++) {
				this.editShuffleButtons[i][j].classList.remove('toggleShowSelected');
			}
			if (this.shuffle[i] == -1) {
				this.editShuffleButtons[i][0].classList.add('toggleShowSelected');
			} else if (this.shuffle[i] == 0) {
				this.editShuffleButtons[i][2].classList.add('toggleShowSelected');
			} else {
				this.editShuffleButtons[i][1].classList.add('toggleShowSelected');
			}
		}
	}

	setTestButtons(direction = 'reveal') {
		// set to reveal or score
		if (direction === 'reveal') {
			this.test.querySelector('.testResponseGrades').classList.remove('hidden');
			this.test.querySelector('.testRevealButton').classList.add('hidden');
		} else {
			this.test.querySelector('.testResponseGrades').classList.add('hidden');
			this.test.querySelector('.testRevealButton').classList.remove('hidden');
		}

		if (direction === 'reveal') {
			if (this.showQuestion) {
				this.testBack.classList.remove('hidden');
				this.testBackSecret.classList.add('hidden');
				this.testFront.classList.remove('hidden');
				this.testFrontSecret.classList.add('hidden');
			} else {
				this.testBack.classList.remove('hidden');
				this.testBackSecret.classList.add('hidden');
				this.testFront.classList.remove('hidden');
				this.testFrontSecret.classList.add('hidden');
			}
		} else {
			if (this.showQuestion) {
				this.testBack.classList.add('hidden');
				this.testBackSecret.classList.remove('hidden');
				this.testFront.classList.remove('hidden');
				this.testFrontSecret.classList.add('hidden');
			} else {
				this.testBack.classList.remove('hidden');
				this.testBackSecret.classList.add('hidden');
				this.testFront.classList.add('hidden');
				this.testFrontSecret.classList.remove('hidden');
			}
		}
	}

	getTestButtons() {
		// return reveal or score

		if (
			this.test.querySelector('.testRevealButton').classList.contains('hidden')
		) {
			return 'score';
		} else {
			return 'reveal';
		}
	}

	showNextCard() {
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

		if (notFound) {
			modal.classList.remove('hidden');
			this.currentCard = this.cards[0];
			this.testFront.innerHTML = this.currentCard.front;
			this.testBack.innerHTML = this.currentCard.back;
			// hide answer and scoring buttons
			this.setTestButtons('score');
			return 1;
		}

		this.testFront.innerHTML = this.currentCard.front;
		this.testBack.innerHTML = this.currentCard.back;
		// hide answer and scoring buttons
		this.setTestButtons('score');
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
		this.showNextCard();
	}

	// reveal answer and scoring buttons
	revealCurrentCard() {
		this.setTestButtons('reveal');
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
}

class Card {
	constructor(front, back, score) {
		this.front = front;
		this.back = back;
		this.score = score;
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

let decks = [];

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

		deckBar.addDeck(tempDeck);
		deckDisplay.addDeck(tempDeck);
	}

	getDecks() {
		return this.decks;
	}
}

let templateDeck = {
	detail: {
		title: 'New Deck',
		shuffle: [-1, -1, 5, 5, 0],
		showQuestion: true,
	},
	cards: [],
};

const deckBar = new DeckBar();
const deckDisplay = new DeckDisplay();
const storedDecks = new Storage(uscapitals); // pass default deck in case that this is a new run or cleared mem
const book = new Book(storedDecks);

deckBar.activateCreateNew();

document.querySelector('body').addEventListener('keyup', (event) => {
	book.getDecks().forEach((deck) => {
		deck.onKeyup(event);
	});
});
