
let memos = JSON.parse(localStorage.getItem("memos")) || [];
let draggedIndex = null;

function addMemo() {


    const text =
        document.getElementById("memoInput").value;

    const priority =
        document.getElementById("priority").value;

    const category =
        document.getElementById("category").value;

    const deadline =
        document.getElementById("deadline").value;

    if (text === "") {
        alert("入力してください");
        return;
    }

    memos.push({
        text: text,
        category: category,
        done: false,
        priority: priority,
        deadline: deadline,
        createdAt: new Date().toLocaleString()
    });

    saveMemos();
    localStorage.setItem("memos", JSON.stringify(memos));
    renderMemos();

    document.getElementById("memoInput").value = "";


}


function renderMemos() {

    const list = document.getElementById("memoList");

    list.innerHTML = "";

    const keyword =
        document.getElementById("search")
            .value
            .toLowerCase();

    const categoryFilter =
        document.getElementById("categoryFilter").value;

    const priorityFilter =
        document.getElementById("priorityFilter").value;

    const deadlineFilter =
        document.getElementById("deadlineFilter").value;

    const filteredMemos = memos.filter(function (memo) {

        // 検索
        if (
            keyword &&
            !memo.text.toLowerCase().includes(keyword)
        ) {
            return false;
        }

        // カテゴリー
        if (
            category &&
            memo.category !== category
        ) {
            return false;
        }

        // 優先度
        if (
            priority &&
            memo.priority !== priority
        ) {
            return false;
        }

        // 締切
        if (
            deadline &&
            memo.deadline !== deadline
        ) {
            return false;
        }

        return true;
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    memos.sort(function (a, b) {
        if (a.done !== b.done) {
            return a.done ? 1 : -1;
        }
        if (a.deadline === "" && b.deadline === "") {
            return 0;
        }

        if (a.deadline === "") {
            return 1;
        }

        if (b.deadline === "") {
            return -1;
        }

        return new Date(a.deadline) - new Date(b.deadline);

    });

    memos.forEach(function (memo, index) {
        if (
            categoryFilter !== "すべて" &&
            memo.category !== categoryFilter
        ) {
            return;
        }
        if (
            priorityFilter !== "すべて" &&
            memo.priority !== priorityFilter
        ) {
            return;
        }
        if (deadlineFilter !== "すべて") {

            if (deadlineFilter === "締切あり" &&
                memo.deadline === "") {
                return;
            }

            if (deadlineFilter === "締切なし" &&
                memo.deadline !== "") {
                return;
            }

            if (memo.deadline !== "") {

                const deadline = new Date(memo.deadline);
                deadline.setHours(0, 0, 0, 0);

                if (deadlineFilter === "今日" &&
                    deadline.getTime() !== today.getTime()) {
                    return;
                }

                if (deadlineFilter === "期限切れ" &&
                    deadline >= today) {
                    return;
                }

            } else if (
                deadlineFilter === "今日" ||
                deadlineFilter === "期限切れ"
            ) {
                return;
            }
        }

        let categoryColor = "";


        if (memo.category === "勉強") {
            categoryColor = "royalblue";
        } else if (memo.category === "仕事") {
            categoryColor = "brown";
        } else if (memo.category === "買い物") {
            categoryColor = "purple";
        } else {
            categoryColor = "gray";
        }
        let priorityColor = "";

        if (memo.priority === "高") {
            priorityColor = "crimson";
        } else if (memo.priority === "中") {
            priorityColor = "darkorange";
        } else {
            priorityColor = "forestgreen";
        }
        let deadlineColor = "";

        if (memo.deadline !== "") {

            const deadline = new Date(memo.deadline);
            deadline.setHours(0, 0, 0, 0);

            if (deadline < today) {
                deadlineColor = "red";
            }
        }
        const li = document.createElement("li");

        li.draggable = true;

        li.addEventListener("dragstart", function () {
            draggedIndex = index;
        });

        li.addEventListener("dragover", function (event) {
            event.preventDefault();
        });

        li.addEventListener("drop", function () {

            const draggedMemo = memos[draggedIndex];

            memos.splice(draggedIndex, 1);
            memos.splice(index, 0, draggedMemo);

            localStorage.setItem("memos", JSON.stringify(memos));

            renderMemos();
        });
        li.innerHTML =
            "<input type='checkbox' " +
            (memo.done ? "checked" : "") +
            " onchange='toggleDone(" + index + ")'>" +

            "<span style='" +
            (memo.done
                ? "text-decoration:line-through;color:gray;"
                : "") +
            "'>" +

            "<span style='color:" + categoryColor + "; font-weight:bold;'>[" +
            (memo.category || "その他") +
            "]</span> " +
            "<span style='color:" + priorityColor + "; font-weight:bold;'>[" +
            (memo.priority || "中") +
            "]</span> " +
            memo.text +

            " 締切: <span style='color:" + deadlineColor + "; font-weight:bold;'>" +
            (memo.deadline || "未設定") +
            "</span>" +
            " 作成日: " +
            memo.createdAt +

            "</span> " +

            "<button onclick='editMemo(" + index + ")'>編集</button> " +
            "<button onclick='deleteMemo(" + index + ")'>削除</button>";

        list.appendChild(li);

    });

    const remaining = memos.filter(function (memo) {
        return !memo.done;
    }).length;

    const total = memos.length;

    document.getElementById("count").textContent =
        "残り " + remaining +
        " 件 / 全 " + total + " 件";
}



function saveMemos() {

    localStorage.setItem(
        "memos",
        JSON.stringify(memos)
    );
}

function deleteMemo(index) {

    if (confirm("このメモを削除しますか？")) {

        memos.splice(index, 1);

        localStorage.setItem("memos", JSON.stringify(memos));

        renderMemos();

    }

}



function toggleDone(index) {

    memos[index].done = !memos[index].done;

    localStorage.setItem("memos", JSON.stringify(memos));

    renderMemos();

}

function editMemo(index) {

    const newText =
        prompt(
            "メモを編集してください",
            memos[index].text
        );

    if (
        newText === null ||
        newText === ""
    ) {
        return;
    }

    memos[index].text = newText;

    localStorage.setItem("memos", JSON.stringify(memos));

    saveMemos();

    renderMemos();

}


function searchMemo() {

    const keyword =
        document.getElementById("search")
            .value
            .toLowerCase();

    const category =
        document.getElementById("categoryFilter")
            .value;

    const items =
        document.querySelectorAll("#memoList li");

    items.forEach(function (item) {

        const textMatch =
            item.textContent
                .toLowerCase()
                .includes(keyword);

        const categoryMatch =
            category === "" ||
            item.textContent.includes("[" + category + "]");

        if (textMatch && categoryMatch) {
            item.style.display = "";
        } else {
            item.style.display = "none";
        }

    });

}

renderMemos();

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}
