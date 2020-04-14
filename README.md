# Flashcards: A Spaced-Repetition Implementation

## Description

Flashcards are a crucial tool in education but can get tedious - both in writing them out and in organizing and reviewing them. This web app is a flashcard program that addresses these two problems electronically by allowing:

- digital entry, edit and storage
- self-scoring and thus adaptive presentation of cards

In addition to being a project of personal interest, this web app fulfills the first project requirement for the [General Assembly Software Immersive Engineer Remote course](https://generalassemb.ly/education/software-engineering-immersive-remote).

## Structure

This web app works through the use of Decks, which are collections of Cards.

Each Deck has a title and card presentation options.
Each card has a front, back and score.

## Features

**Deck Storage**

- Download (json format)
- Upload (json format)
- Persistence in Browser memory using `localStorage`

**Deck Entry / Edit**

- Add New Deck
- Delete Deck
- Add New Cards
- Delete Cards
- Modify Existing Front / Back / Score of Cards

**Card Presentation and Scoring**

- Card scoring tiers from 1 (unknown) to 5 (immediate recall)
- Adaptive presentation based on score, customizable by Deck
- Show card front / recall Back, or reverse to show card back / recall front

## Technologies Used

Tools used in this project so far are those covered in the first three weeks of the GA SEIR course.

- HTML5
- CSS
- Javascript

## Approach

I've approached this coding challenge using classes and objects to represent the different screen sections and deck / card elements.

Each deck has five screens that allow interaction with the deck:

- Icon that is listed on the left-side bar. The working deck is selected here and can be downloaded.
- View contains a count of cards by score and lets the user toggle between showing card front or back first.
- Test presents the card one at a time based on the card's score, position in the deck, and presentation options at the deck level.
- Edit allows changes to the deck title, presentation options, and the ability to delete the deck.
- Alter allows changes to individual cards and the addition of new cards.

When a new deck is created / loaded then each of the five screens are created from a template in the DOM and links are saved in the deck object.

## Unsolved problems

A few things that bug me:

- I use the keyup event, but using it at the body makes it hard wonky when propagating up to my objects...there must be a better way.
- The code is unwieldy and needs a refactor since I was kind of rushing towards the end.
- I don't know if the template / copy design is efficient enough, rewriting to use the same screens over again would be nice
- I think that my class methods are copied in memory with each new instance, should I attach them to the prototype instead? Is this really important?

In general I like the size of this project at this point because it has me thinking about larger-scale organization for easier maintenance and troubleshooting.

## Installation

Use this app by visiting its hosted site [here](github.com) at github or by cloning the [repository](https://github.com/trental/Project-1-Flash-Cards.git) and running it yourself.
