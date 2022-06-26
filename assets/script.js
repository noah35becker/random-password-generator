
//GLOBAL VARIABLES
  var password;

  var sliderItself = document.querySelector('#number-of-chars-slider');
  var sliderNumVal = document.querySelector('#number-of-chars-number-input');
  const minNumChars = parseInt(sliderItself.getAttribute('min'));
  const maxNumChars = parseInt(sliderItself.getAttribute('max'));

  const CHARACTERS = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numeric: '0123456789',
    special: ' !"#$%&()*+,-./:;<=>?@[]^_`{|}~' + "'" + '\\'
  }

  var copyBtn = document.querySelector('#copy-to-clipboard');
  var origCopyBtnText = copyBtn.innerHTML;

  var generateBtn = document.querySelector('#generate');
  var passwordText = document.querySelector('#password');



//'NUMBER OF CHARACTERS' SLIDER/NUMBER INPUT

  //When slider itself is adjusted, adjust the corresponding number value simultaneously
    sliderItself.oninput = function(){
      sliderNumVal.value = this.value;
      sliderItself.blur();
    };

  //Function: When number value is adjusted, at the moment that the corresponding slider is also adjusted,
  //make its circle 'flash'
    function sliderFlash(){
      var activeElem = this.document.activeElement;

      //If number value input was focused before sliderFlash(),
      //mask the fact that it temporarily loses focus
      if (activeElem === sliderNumVal)
        sliderNumVal.style.outline = window.getComputedStyle(sliderNumVal,':focus-visible').getPropertyValue('outline');
      
      sliderItself.focus();
      setTimeout(
        function(){
          activeElem.focus();
          sliderItself.blur();
          sliderNumVal.removeAttribute('style'); //REMOVE the <losing-focus> masking described above
        },
        200)
      ;
    }

  //Function: Fixing user input for number of characters
    function fixNumCharsInput(){
      var origVal = sliderNumVal.value;

      var adjVal = Math.round(origVal);
      if (adjVal < minNumChars)
        adjVal = minNumChars;
      if (adjVal > maxNumChars)
        adjVal = maxNumChars;

      if (!(adjVal == origVal))
        sliderFlash();
      
      sliderNumVal.value = adjVal;
      sliderItself.value = adjVal;
    }

  //When number value is adjusted, adjust the corresponding slider SIMULTANEOUSLY
  //(only if number value is currently valid)
    sliderNumVal.oninput = function(){
      var finalVal = this.value;

      if (finalVal == Math.round(finalVal) && finalVal >= 8 && finalVal <= 128){
        sliderItself.value = finalVal;
        sliderFlash();
      }
    };
  
  //When user is adjusting number value with the input field's arrows (whether clicking them or using up/down arrow keys),
  //prevent number value from going out of bounds
    window.addEventListener('click',function(e){  
      e = e || window.event;
      if (e.target === sliderNumVal || e.srcElement === sliderNumVal)
        fixNumCharsInput();
    });

    window.addEventListener('keyup',function(e){
      if (sliderNumVal === this.document.activeElement)
        switch (e.key){
          case 'ArrowUp':
            if (sliderNumVal.value > 128)
              fixNumCharsInput();
            break;
          case 'ArrowDown':
            if (sliderNumVal.value < 8){
              fixNumCharsInput();
            }
            break;
        }
    });

  //After user completes number value input by typing, correct it if invalid
    sliderNumVal.addEventListener('blur', function(){
      fixNumCharsInput();
    });


    
//GENERATE PASSWORD FUNCTION
  function generatePassword(){

    //Variables
      var pw;
      var eligibleChars;
      
      var passwordLength = sliderItself.value;
      var useLowercase = document.querySelector('#lowercase').checked;
      var useUppercase = document.querySelector('#uppercase').checked;
      var useNumeric = document.querySelector('#numeric').checked;
      var useSpecial = document.querySelector('#special').checked;

    //Inner functions
      function atLeastOneCharType(){
        if (useLowercase || useUppercase || useNumeric || useSpecial)
          return true;
        return false;
      }
    
      function getEligibleChars(){
        var output = '';

        if (useLowercase)
          output += CHARACTERS.lowercase;
        if (useUppercase)
          output += CHARACTERS.uppercase;
        if (useNumeric)
          output += CHARACTERS.numeric;
        if (useSpecial)
          output += CHARACTERS.special;
          
        return output;
      }

      function build(){
        var output = '';
        var randIndex;

        for (i = 0; i < passwordLength; i++){
          randIndex = Math.floor(Math.random() * eligibleChars.length);
          output += eligibleChars.substring(randIndex, randIndex + 1);
        }

        return output;
      }

      function allCharCategoriesPresent(){ 
        function checkAgainstBaseline(baseline){
          for (i = 0; i < pw.length; i++)
            for (c = 0; c < baseline.length; c++)
              if (pw.substring(i, i + 1) === baseline.substring(c, c + 1))
                return true;

          return false;
        }

        if(useLowercase && !checkAgainstBaseline(CHARACTERS.lowercase))
          return false;
        if(useUppercase && !checkAgainstBaseline(CHARACTERS.uppercase))
          return false;
        if(useNumeric && !checkAgainstBaseline(CHARACTERS.numeric))
          return false;
        if(useSpecial && !checkAgainstBaseline(CHARACTERS.special))
          return false;
        
        return true;

      }

    //Execute
      if (atLeastOneCharType()){
        eligibleChars = getEligibleChars();
        
        do
          pw = build();
        while (!allCharCategoriesPresent());

        return pw;
      }
      
      return false;
  }



//COPY TO CLIPBOARD BUTTON
  function copyBtnReset(){
    copyBtn.innerHTML = origCopyBtnText;
    copyBtn.removeAttribute('style');
  }

  copyBtn.addEventListener('click', function(){
    var delay = 3000; //milliseconds
    var duration = 1000; //milliseconds

    navigator.clipboard.writeText(password);
    
    copyBtn.style.width = window.getComputedStyle(copyBtn).getPropertyValue('width');
    copyBtn.style.fontStyle = 'italic';
    copyBtn.innerHTML = 'Copied!';
    copyBtn.style.transition = 'color ' + duration + 'ms ease-in ' + delay + 'ms';
    copyBtn.style.color = window.getComputedStyle(copyBtn).getPropertyValue('background-color');

    setTimeout(copyBtnReset, delay + duration);
  });



//ADD GENERATEPASSWORD() TO GENERATE BUTTON,
//INC. ERROR-CHECKING + DISPLAYING/UPDATING STATS AND COPY BUTTON
  function updateSupplements(display){
    function charTypesString(){
      const charTypes = [];
      var index = 0;

      if (document.querySelector('#lowercase').checked)
        charTypes[index++] = 'lowercase';
      if (document.querySelector('#uppercase').checked)
        charTypes[index++] = 'uppercase';
      if (document.querySelector('#numeric').checked)
        charTypes[index++] = 'numeric';
      if (document.querySelector('#special').checked)
        charTypes[index] = 'special';

      return charTypes.join(', ');
    }
    
    if (display){
      var stats = password.length + ' characters (' + charTypesString() + ')';
      document.querySelector('.pw-stats').innerHTML = stats;

      document.querySelector('.card-supplements').style.display = 'flex';
    }else
      document.querySelector('.card-supplements').style.display = 'none';
  }
  


  function writePassword(){
    generateBtn.innerHTML = 'Generate new password';
    
      copyBtnReset();

    password = generatePassword();

    if (password){
      passwordText.style.color = 'black';
      passwordText.value = password;
      updateSupplements(true);
    }
    else{
      passwordText.style.color = window.getComputedStyle(generateBtn).getPropertyValue('background-color');
      passwordText.value = 'Error! You must check at least one type of character.';
      updateSupplements(false);
    }
  }

  generateBtn.addEventListener('click', writePassword);