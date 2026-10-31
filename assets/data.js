/* Lessons and word lists. All words are short, simple and child-safe. */
(function () {
  'use strict';

  const LESSONS = [
    { id: 'l1', title: 'F and J', emoji: '🐣', keys: 'fj', tip: 'Feel the little bumps on F and J? Put your pointer fingers there. That is home!' },
    { id: 'l2', title: 'D and K', emoji: '🐥', keys: 'dk', tip: 'Your middle fingers sit next to your pointer fingers, on D and K.' },
    { id: 'l3', title: 'S and L', emoji: '🐤', keys: 'sl', tip: 'Ring fingers go on S and L. Keep your fingers curved like a little bridge.' },
    { id: 'l4', title: 'A and ;', emoji: '🐔', keys: 'a;', tip: 'Pinkies rest on A and ; . Now all 8 fingers are home!' },
    { id: 'l5', title: 'Home Row Hero', emoji: '🦸', keys: '', review: true, tip: 'Type everything from the home row. Try not to look at your hands!' },
    { id: 'l6', title: 'G and H', emoji: '🐶', keys: 'gh', tip: 'Stretch a pointer finger to the middle: left one to G, right one to H. Then come back home.' },
    { id: 'l7', title: 'E and I', emoji: '🐱', keys: 'ei', tip: 'Middle fingers reach up: left to E, right to I.' },
    { id: 'l8', title: 'R and U', emoji: '🐰', keys: 'ru', tip: 'Pointer fingers reach up: left to R, right to U.' },
    { id: 'l9', title: 'T and Y', emoji: '🦊', keys: 'ty', tip: 'Pointer fingers reach up and to the middle: left to T, right to Y.' },
    { id: 'l10', title: 'W and O', emoji: '🐼', keys: 'wo', tip: 'Ring fingers reach up: left to W, right to O.' },
    { id: 'l11', title: 'Q and P', emoji: '🐨', keys: 'qp', tip: 'Pinkies reach up: left to Q, right to P.' },
    { id: 'l12', title: 'Top Row Star', emoji: '🌟', keys: '', review: true, tip: 'Mix of home row and top row. You know 18 letters now!' },
    { id: 'l13', title: 'V and N', emoji: '🦁', keys: 'vn', tip: 'Pointer fingers reach down: left to V, right to N.' },
    { id: 'l14', title: 'C and M', emoji: '🐯', keys: 'cm', tip: 'Left middle finger goes down to C. Right pointer finger goes down to M.' },
    { id: 'l15', title: 'X and Z', emoji: '🦓', keys: 'xz', tip: 'Left ring finger goes down to X. Left pinky goes down to Z.' },
    { id: 'l16', title: 'B and Dot', emoji: '🐻', keys: 'b.', tip: 'Left pointer finger stretches down to B. Right ring finger goes down to the dot.' },
    { id: 'l17', title: 'Word Wizard', emoji: '🧙', keys: '', words: true, tip: 'You know every letter! Now type real words. Press space with your thumb.' },
    { id: 'l18', title: 'Numbers 1 to 5', emoji: '🔢', keys: '12345', numbers: true, tip: 'Numbers are on the top row. Reach up with your left hand fingers.' },
    { id: 'l19', title: 'Numbers 6 to 0', emoji: '💯', keys: '67890', numbers: true, tip: 'Now the right hand reaches up for 6, 7, 8, 9 and 0.' }
  ];

  // Extra words that only use early letters, so lessons can show real words sooner.
  const EARLY = ['add', 'ask', 'dad', 'sad', 'lad', 'all', 'fall', 'had', 'has', 'gas', 'flag', 'glad', 'hall', 'half', 'dash', 'lash', 'salad', 'hag', 'jag', 'as', 'ad',
    'see', 'fed', 'red', 'led', 'lid', 'did', 'hid', 'fig', 'dig', 'egg', 'leg', 'keg', 'like', 'hike', 'kite', 'side', 'ride', 'hide', 'free', 'tree', 'feet', 'jelly', 'jet', 'get', 'yes', 'try', 'day', 'say', 'hay', 'key', 'fly'];

  const WORDS = {
    short: ['at', 'an', 'am', 'as', 'is', 'it', 'in', 'on', 'up', 'us', 'go', 'no', 'so', 'we', 'me', 'he', 'be', 'my', 'by', 'to', 'do',
      'cat', 'dog', 'sun', 'hat', 'bat', 'rat', 'mat', 'pig', 'big', 'dig', 'cup', 'pup', 'bus', 'run', 'fun', 'bed', 'red', 'ten', 'hen', 'pen',
      'box', 'fox', 'six', 'zip', 'jam', 'yes', 'leg', 'egg', 'bag', 'map', 'cap', 'nap', 'sit', 'hot', 'dot', 'mud', 'bug', 'hug', 'rug', 'kid', 'lid', 'owl', 'ant', 'cow', 'toy', 'pie', 'bee', 'ice', 'zoo', 'van', 'web', 'yak'],
    medium: ['frog', 'fish', 'duck', 'bird', 'cake', 'milk', 'book', 'ball', 'tree', 'star', 'moon', 'rain', 'snow', 'kite', 'jump', 'play', 'sing', 'swim',
      'home', 'love', 'hand', 'foot', 'nose', 'blue', 'pink', 'gold', 'ship', 'boat', 'bike', 'lion', 'bear', 'goat', 'lamp', 'door', 'sock', 'shoe',
      'king', 'gift', 'game', 'baby', 'farm', 'nest', 'leaf', 'seed', 'corn', 'rice', 'soup', 'drum', 'bell', 'wolf', 'deer', 'crab', 'seal', 'lake', 'hill', 'park'],
    long: ['apple', 'happy', 'smile', 'train', 'tiger', 'zebra', 'panda', 'robot', 'pizza', 'juice', 'water', 'house', 'plant', 'cloud', 'beach', 'candy',
      'mango', 'lemon', 'sunny', 'rocket', 'planet', 'banana', 'purple', 'orange', 'yellow', 'rabbit', 'monkey', 'turtle', 'garden', 'school', 'friend',
      'dragon', 'castle', 'flower', 'puppy', 'kitten', 'pencil', 'teacher', 'rainbow', 'dinosaur', 'giraffe', 'penguin', 'unicorn', 'cookie'],
    sight: ['the', 'and', 'a', 'to', 'said', 'you', 'look', 'can', 'see', 'come', 'here', 'play', 'jump', 'big', 'little', 'red', 'blue', 'one', 'two', 'three',
      'run', 'find', 'help', 'make', 'not', 'we', 'where', 'away', 'funny', 'down', 'up', 'go', 'is', 'it', 'in', 'my', 'me', 'for', 'have', 'he', 'she',
      'they', 'was', 'what', 'all', 'are', 'but', 'did', 'do', 'eat', 'good', 'like', 'new', 'now', 'our', 'please', 'ride', 'saw', 'that', 'there', 'this', 'too', 'want', 'who', 'yes']
  };
  const ALL_WORDS = Array.from(new Set([].concat(EARLY, WORDS.short, WORDS.medium, WORDS.long, WORDS.sight)));

  window.TK_DATA = { LESSONS, WORDS, ALL_WORDS };
})();
