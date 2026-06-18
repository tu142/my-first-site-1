let total = Number(
    localStorage.getItem("total")
) || 0;

document.getElementById("total")
    .textContent =
    "合計: ¥" + total;

function addExpense(){

    const item =
        document.getElementById("item").value;

    const amount =
        Number(
            document.getElementById("amount").value
        );

    if(item === "" || amount <= 0){
        alert("入力してください");
        return;
    }

    const li =
        document.createElement("li");

    li.innerHTML =
        item +
        " ¥" +
        amount +
        " <button onclick='deleteItem(this," +
        amount +
        ")'>削除</button>";

    document
        .getElementById("list")
        .appendChild(li);

    total += amount;

    localStorage.setItem(
        "total",
        total
    );

    document.getElementById("total")
        .textContent =
        "合計: ¥" + total;

    document.getElementById("item").value = "";
    document.getElementById("amount").value = "";
}

function deleteItem(button, amount){

    button.parentElement.remove();

    total -= amount;

    localStorage.setItem(
        "total",
        total
    );

    document.getElementById("total")
        .textContent =
        "合計: ¥" + total;
}