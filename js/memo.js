

let memos =
    JSON.parse(
        localStorage.getItem("memos")
    ) || [];

function addMemo(){

    const text =
        document.getElementById("memoInput").value;

    if(text === ""){
        alert("入力してください");
        return;
    }

    memos.push({
        text: text,
        done: false
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
    memo.text +
    "</span>" +

    " <button onclick='editMemo(" +
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


  
renderMemos();