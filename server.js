var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var express = require('express');
var logger = require('morgan');
var path = require('path');
var app = express();
//var indexRouter = require('./routes/sql');
var S = require('string');

var router = express.Router(); // Create Router Object
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./student.db', sqlite3.OPEN_READWRITE, (err) => {
  if(err) {console.error(err.message);}
  console.log('connected');
});

app.use(logger('dev'));
app.use(express.static('public'));
app.use(express.urlencoded({extended : true}));

//app.set('views', './views');
app.set('view engine', 'ejs');
app.use('/assets', express.static('assets'));
//--------------------------------------------------

//--------------------------------------------------

app.get('/', function(req, res){
    //res.render('index');
    var data = querystring.parse(req.url);
    var stnum = data['/?stnum'];

   //var stnum = data['/?stnum'];    

  if(stnum != undefined){
    db.serialize(function() {
      db.each(`SELECT num as hak, 
      name as yee FROM student WHERE num = ${stnum}`, function(err, row){
        res.end(
        `<!DOCTYPE html>
        <html lang="en" dir="ltr">
          <head>
            <meta charset="utf-8">
            <!-- <meta name="viewport" content="width=device-width, initial-scale=0.56, maximum-scale=0.56,user-scalable=0"/> -->
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        
            <title>Reverse Wikipedia</title>
        
            <link rel="stylesheet" href="/assets/styles.css" type="text/css">
        
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
            <script async scr="">
              //const url = 'https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=';
              const url = 'https://ko.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&rnfilterredir=nonredirect&prop=extracts&exintro=&format=json&callback=?';
        
        
        var ANSWER;
        var MASKED_TITLE;
        var raw_content;
        const GREEN = '#3dd28d';
        const BLUE = '#90B1F2';
        const RED = '#F32C52';
        var current_button_text = 'New Page';
        var is_playing = true;
        var mode = 'hard';
        
        var url_in_use = url;
        
        
        
        userinput.focus();
        userinput.addEventListener("keyup", function (e) {
            if (e.keyCode === 13 && is_playing === true) {  // keyCode 13 : Enter
              is_playing = false;
              reveal();
            } else if (e.keyCode === 13 && is_playing === false){
              is_playing = true;
              reload();
              current_button_text = 'New Page';
            } else {
              if (is_playing == true) {
                updateCensuredTitle();
              }
              current_button_text = 'Submit';
              document.getElementById("newpage").innerHTML = current_button_text;
            }
        });
        
        function updateCensuredTitle() {
          var curr_input = document.getElementById("userinput").value;
          var len_input = curr_input.length;
        
          var new_title = curr_input + MASKED_TITLE.substring(len_input);
          document.getElementById("wiki_title").innerHTML = '<h2>' + new_title + '</h2>';
        }
        
        function reveal() {
          var input = document.getElementById("userinput").value.toLowerCase();
          if(ANSWER === undefined || input === 'start game') {
            is_playing = true;
            console.log('Starting the game for you.');
            reload();
          } else {
            setButtonColor();
            // Check if answer is correct
            // using damerau-levenshtein to account for spelling errors
            if (distance(input,ANSWER.toLowerCase()) <= Math.max(ANSWER.toLowerCase().length/5,1) ) {
              setButtonColor(GREEN);
              console.log('Correct');
              document.getElementById('newpage').innerHTML = '새 문제';
              document.getElementById('dapcheck').innerHTML = 'correct';
            } else {
              setButtonColor(RED);
              console.log('False');
              document.getElementById('newpage').innerHTML = '새 문제';
              document.getElementById('dapcheck').innerHTML = 'false';
            }
            insertHTML(ANSWER,raw_content);
          }
        } 
        
        function reload() {
          document.getElementById('userinput').value = ''
          document.getElementById('userinput').focus();
          setButtonColor(BLUE);
          document.getElementById('newpage').innerHTML = '새 문제';
          document.getElementById('dapcheck').innerHTML = '답 확인';
          if (mode === 'easy') {
            var title;
            if ( Math.random() > 0.44 ) {
              $.getJSON(lvl3_url_first, function(data) {
                var items = data.query.categorymembers;
                title = items[Math.floor(Math.random()*items.length)].title.substring(5);
                loadNewPage(title_url + title);
              });
            } else {
              $.getJSON(lvl3_url_second, function(data) {
                var items = data.query.categorymembers;
                title = items[Math.floor(Math.random()*items.length)].title.substring(5);
                loadNewPage(title_url + title);
              }); 
            }
          
          } else if (mode === 'medium') {
            var title;
            var sublist = level4_page_separators[Math.floor(Math.random()*level4_page_separators.length)];
            $.getJSON(lvl4_url+sublist+'&callback=?', function(data) {
              var items = data.query.categorymembers;
              title = items[Math.floor(Math.random()*items.length)].title.substring(5);
              loadNewPage(title_url + title);
            });
        
          } else {
            loadNewPage(url_in_use);
          }
          
        }
        
        function insertHTML(title, content) {
          document.getElementById('wiki_title').innerHTML = '<h2>' + title + '</h2>';
          document.getElementById('wiki_intro').innerHTML = content;
        }
        
        function loadNewPage(url_in_use) {
          $.getJSON(url_in_use, function(data) {
            var pageid = Object.keys(data.query.pages);
            ANSWER = data.query.pages[pageid].title;
            MASKED_TITLE = ANSWER.replace(/[A-힣]/gi, '*');
        
            raw_content = data.query.pages[pageid].extract;
            var masked_content = removeMentions(raw_content);
            
            insertHTML(MASKED_TITLE,masked_content);
          });
        }
        
        function removeMentions(raw_content) {
          var title_words = ANSWER.toLowerCase().replace(/[,:]/g, "").split(" ");
          var masked_content = raw_content;
          console.log(title_words);
          var i;
          for (i = 0; i < title_words.length; ++i){ 
            var word = title_words[i];
            var mask = word.replace(/[A-힣]/gi, "*");
            var re = new RegExp(word, 'gi');
            masked_content = masked_content.replace(re, mask);
        
          }
        
          return masked_content;
        }
        
        // Compute how similar two strings are
        function distance(source, target) {
          if (!source) return target ? target.length : 0;
          else if (!target) return source.length;
        
          var m = source.length, n = target.length, INF = m+n, score = new Array(m+2), sd = {};
          for (var i = 0; i < m+2; i++) score[i] = new Array(n+2);
          score[0][0] = INF;
          for (var i = 0; i <= m; i++) {
              score[i+1][1] = i;
              score[i+1][0] = INF;
              sd[source[i]] = 0;
          }
          for (var j = 0; j <= n; j++) {
              score[1][j+1] = j;
              score[0][j+1] = INF;
              sd[target[j]] = 0;
          }
        
          for (var i = 1; i <= m; i++) {
              var DB = 0;
              for (var j = 1; j <= n; j++) {
                  var i1 = sd[target[j-1]],
                      j1 = DB;
                  if (source[i-1] === target[j-1]) {
                      score[i+1][j+1] = score[i][j];
                      DB = j;
                  }
                  else {
                      score[i+1][j+1] = Math.min(score[i][j], Math.min(score[i+1][j], score[i][j+1])) + 1;
                  }
                  score[i+1][j+1] = Math.min(score[i+1][j+1], score[i1] ? score[i1][j1] + (i-i1-1) + 1 + (j-j1-1) : Infinity);
              }
              sd[source[i-1]] = i;
          }
          return score[m+1][n+1];
        }
        
        function setButtonColor(color) {
          $("button").css("background", function(x){
            return color;
          });
        }
        
        function openNav() {
          document.getElementById("mySidenav").style.width = "250px";
          document.getElementById("main").style.marginRight = "250px";
        }
        
        function closeNav() {
          document.getElementById("mySidenav").style.width = "0";
          document.getElementById("main").style.marginRight= "0";
        }
        
        function setWiki() {
          url_in_use = url;
          document.getElementById("current-mode-title").innerText = 'Mode: Regular wiki'
        }
        
        function setMode(m) {
      
          mode = 'hard';
          document.getElementById("current-mode-title").innerHTML = 'Hard wiki'
        
      //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
      }
            </script>
          </head>
          <body>
            <div id=main>
            <header class="header">
            <a id="menu-title">${row.yee}님 환영합니다.</a>
              
              <span class="menubutton" style="font-size:30px;cursor:pointer" onclick="openNav()">&#9776;</span>
            </header>
        
            <div id="mySidenav" class="sidenav">
              <a id="cross" href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>
              <!-- <span style="font-size:30px;cursor:pointer" onclick="openNav()">&times;</span> -->
              <div id="links">
                <!--<a href="#" onclick="closeNav();setMode('easy');reload();">Easy wiki</a>-->
            </div>
              <form action="http://localhost:8080" method="GET">
                <input type="text" name = "stnum" placeholder="학번 입력">
                <input type="submit" value="로그인">
          
              </form>
            </div>
        
            <div id="current-mode-title" class="container title">
          위키피디아 퀴즈!
        </div>
    
        <div class="container container-input">
              <input id="userinput" class="input-field" value="">
          <button id="newpage" class="button" onclick="reload()"  >
            새 문제
          </button>
          <button id="dapcheck" class="button" onclick="reveal()"  >
            답 확인
          </button>
        </div>
            
            <div class="container" id=wiki_title>
              <!-- placeholder for wikipedia title -->
            </div>
            
            <div class="container">
              
              <div id="wiki_intro">
                <!-- placeholder for wikipedia text -->
              </div>
        
            </div>
        
            </div>
        
          </body>
        </html>`
        );
        
      });
    }
    );

  }//   
})

app.listen(8080, function(){
    console.log('8080 포트에서 대기중');
});
