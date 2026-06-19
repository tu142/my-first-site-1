let currentQuiz = 0;
let score = 0;

const quizzes = [
{
    question: "日本の首都は？",
    choices: ["大阪","名古屋","東京"],
    answer: 2
},
{
    question: "1+1は？",
    choices: ["1","2","3"],
    answer: 1
},
{
    question: "富士山の高さは？",
    choices: ["3776m","2000m","5000m"],
    answer: 0
}

];

function showQuiz(){

    document.getElementById("question")
        .textContent =
        quizzes[currentQuiz].question;

    document.getElementById("btn0")
        .textContent =
        quizzes[currentQuiz].choices[0];

    document.getElementById("btn1")
        .textContent =
        quizzes[currentQuiz].choices[1];

    document.getElementById("btn2")
        .textContent =
        quizzes[currentQuiz].choices[2];

        document.getElementById("progress")
.textContent =
"問題 " +
(currentQuiz + 1) +
" / " +
quizzes.length;
}

function checkAnswer(index){

    if(index === quizzes[currentQuiz].answer){

        score++;

        document.getElementById("result")
            .textContent =
            "〇 正解！";

    }else{

        document.getElementById("result")
            .textContent =
            "✕ 不正解";
    }

    currentQuiz++;

    if(currentQuiz < quizzes.length){

        showQuiz();

    }else{
  let message = "";

        if(score === 3){
            message = "満点！🎉";
        }else if(score === 2){
            message = "よくできました！";
        }else{
            message = "もう一度挑戦！";
        }
        
        document.getElementById("question")
            .textContent =
            "終了！";

        document.getElementById("result")
            .textContent =
            quizzes.length +
            "問中" +
            score +
            "問正解！";

        document.getElementById("btn0").style.display = "none";
        document.getElementById("btn1").style.display = "none";
        document.getElementById("btn2").style.display = "none";
    document.getElementById("retryBtn")
    .style.display = "inline-block";
}

  showQuiz();}
   
    function retryQuiz(){

    currentQuiz = 0;
    score = 0;

    document.getElementById("result")
        .textContent = "";

    document.getElementById("btn0")
        .style.display = "inline-block";

    document.getElementById("btn1")
        .style.display = "inline-block";

    document.getElementById("btn2")
        .style.display = "inline-block";

    document.getElementById("retryBtn")
        .style.display = "none";

  
    
}
  showQuiz();
