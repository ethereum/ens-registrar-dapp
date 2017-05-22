/*
Daefen
------

A library for encoding and decoding large numbers into a pronounceable, high density, string, that uses 3456 syllables as it's base.


*/

export default Daefen = function(num) {
  let syllables = [];

  // Creates the syllable array
  var consonants = 'bcdfghjklmnprstvwz'; // consonants except hard to speak ones
  var vowels = 'aeiouy'; // vowels

  // Vowel + Consonant
  for (a = 0; a < vowels.length; a++) {
    for (b = 0; b < consonants.length; b++) {
      syllables.push(vowels[a] + consonants[b] );
    } 
  }

  // Consonant + Vowel
  for (b = 0; b < consonants.length; b++) {
    for (a = 0; a < vowels.length; a++) {
      syllables.push(consonants[b] + vowels[a]);
    } 
  }

  // Consonant + Vowel + Vowel
  for (b = 0; b < consonants.length; b++) {
    for (a = 0; a < vowels.length; a++) {
      for (e = 0; e < vowels.length; e++) {
        syllables.push(consonants[b] + vowels[a] + vowels[e]);
      }  
    } 
  }

  // Consonant + Vowel + Consonant
  for (b = 0; b < consonants.length; b++) {
    for (a = 0; a < vowels.length; a++) {
      for (c = 0; c < consonants.length; c++) {
        syllables.push(consonants[b] + vowels[a] + consonants[c]);
      }  
    } 
  }

  // Vowel + Consonant + Vowel
  for (a = 0; a < vowels.length; a++) {
    for (b = 0; b < consonants.length; b++) {
      for (e = 0; e < vowels.length; e++) {
        syllables.push(vowels[a] + consonants[b] + vowels[e]);
      }  
    } 
  }

  // Quick function that converst a number into an array of numbers in any base
  function fromBase10(num, base) {
    var result = [];
    if (num == 0) return [0];
    for (var i=num; i > 0; i = Math.floor(i/base)){
     result.unshift(i % base);
    };
    return result;
  }

  // Important to check some spacing issues
  function isConsonant(letter) {
    return consonants.indexOf(letter) >= 0;
  }


  // Converts an integer (passed as a string to avoid scientific notation issues)
  function toWords(number) {
    let numberArray = fromBase10(number, syllables.length);
    let result = '';
    let lastWord = '';
    let n = 0;
    for (i = 0; i < numberArray.length; i++) {
      n = numberArray[i] || 0;

      lastWord = result.split(" ").slice(-1)[0];

      if (result == ''  || lastWord.length == syllables[n].length 
        || (lastWord.length < 5 && isConsonant(lastWord.slice(-1)) && isConsonant(syllables[n].slice(0,1))) ) {
        result += syllables[n];
      } else {
        result += " " + syllables[n];
      }
    }
    return result.replace(/\b[a-z]/g,function(f){return f.toUpperCase();});
  }

  // Converts a valid phrase back into a string
  function fromWords(words) {
    let wordArray = words.toLowerCase()
      .replace(/[bcdfghjklmnprstvwz][bcdfghjklmnprstvwz]/gi,function(r){ let n = Math.floor(r.length/2); return r.substr(0,n) + ' ' + r.substr(n,n)})
      .replace(/[a-z]{6}|[a-z]{4}/gi,function(r){ let n = Math.floor(r.length/2); return r.substr(0,n) + ' ' + r.substr(n,n)})
      .split(" ");
    let result = 0;

    for (i = 0; i < wordArray.length; i++) {
      if (syllables.indexOf(wordArray[i]) < 0) return;
      result = (result + syllables.indexOf(wordArray[i])) * (Math.pow(syllables.length, wordArray.length - i - 1)); 
    }

    return result.toString(10);
  }

  return toWords(num);
}