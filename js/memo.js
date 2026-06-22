

let memos =
    JSON.parse(
        localStorage.getItem("memos")
    ) || [];

function addMemo(){

    const text =
        document.getElementById("memoInput").value;

    const priority =
        document.getElementById("priority").value;

    const deadline =
        document.getElementById("deadline").value;

    if(text === ""){
        alert("入力してください");
        return;
    }

    memos.push({
        text: text,
        done: false,
        priority: priority,
        deadline: deadline,
        createdAt: new Date().toLocaleString()
    });

    saveMemos();
    renderMemos();

    document.getElementById("memoInput").value = "";
}

function renderMemos(){

    const list =
        document.getElementById("memoList");
memos.sort(function(a, b){

    if(a.done === b.done){
        return 0;
    }

    if(a.done){
        return 1;
    }

    return -1;

});

    list.innerHTML = "";
let priorityColor = "";

if(memo.priority === "高"){
    priorityColor = "red";
}
else if(memo.priority === "中"){
    priorityColor = "orange";
}
else{
    priorityColor = "blue";
}

const today = new Date().toISOString().split("T")[0];
    memos.forEach(function(memo, index){

        const li =
            document.createElement("li");

            
li.innerHTML =
    "<input type='checkbox' " +
    (memo.done ? "checked" : "") +
    " onchange='toggleDone(" + index + ")'>" +

    "<span style='" +
    (memo.done
        ? "text-decoration:line-through;color:gray;"
        : "") +
    "'>" +
+"<span style='color:" +
priorityColor +
";font-weight:bold;'>[" +
(memo.priority || "中") +
"]</span> "
memo.text +
"<br><small style='" +
(memo.deadline && memo.deadline <= today
    ? "color:red;font-weight:bold;"
    : "") +
"'>締切: " +
(memo.deadline || "未設定") +
"</small>" +
"<br><small>作成日: " +
memo.createdAt +
"</small>"
"<br><small>作成日: " +
memo.createdAt +
"</small>" +
"</span>" +
    index +
    ")'>編集</button>" +

    " <button onclick='deleteMemo(" +
    index +
    ")'>削除</button>";

    
        list.appendChild(li);
    });
     const remaining = memos.filter(function(memo){
        return !memo.done;
    }).length;


const total = memos.length;

document.getElementById("count").textContent =
    "残り " + remaining +
    " 件 / 全 " + total + " 件";

}


function saveMemos(){

    localStorage.setItem(
        "memos",
        JSON.stringify(memos)
    );
}

function deleteMemo(index){

    memos.splice(index, 1);

     saveMemos()

    renderMemos();
}

function toggleDone(index){

    memos[index].done =
        !memos[index].done;

    saveMemos();

    renderMemos();

}

function editMemo(index){

    const newMemo =
        prompt(
            "メモを編集してください",
            memos[index].text
        );

    if(
        newMemo === null ||
        newMemo === ""
    ){
        return;
    }

    memos[index].text = newMemo;

    saveMemos();

    renderMemos();

}

    function searchMemo(){

    const keyword =
        document.getElementById("search")
        .value
        .toLowerCase();

    const items =
        document.querySelectorAll("#memoList li");

    items.forEach(function(item){

        if(
            item.textContent
                .toLowerCase()
                .includes(keyword)
        ){
            item.style.display = "";
        }else{
            item.style.display = "none";
        }
          });
    }
function deleteCompleted(){

    memos = memos.filter(function(memo){

        return !memo.done;

    });

    saveMemos();

    renderMemos();

}
function showCompleted(){

    const list =
        document.getElementById("memoList");

    list.innerHTML = "";

    memos.forEach(function(memo, index){

        if(!memo.done){
            return;
        }

        const li =
            document.createElement("li");

        li.textContent = memo.text;

        list.appendChild(li);

    });
}


  
renderMemos();