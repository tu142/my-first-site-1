let expenses = JSON.parse(
    localStorage.getItem("expenses")
) || [];

let total = 0;

function saveExpenses() {
    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );
}

function renderExpenses() {
let incomeTotal = 0;
let expenseTotal = 0;

    const list =
        document.getElementById("list");

    list.innerHTML = "";

    total = 0;

    expenses.forEach(function(expense, index){

        const li =
            document.createElement("li");

const label =
    expense.type === "income"
    ? "💰収入"
    : "💸支出";

li.innerHTML =
    label +
    " " +
    expense.item +
    " ¥" +
    expense.amount +
    " <button onclick='deleteItem(" +
    index +
    ")'>削除</button>";

        list.appendChild(li);

if(expense.type === "income"){

    total += expense.amount;
    incomeTotal += expense.amount;

}else{

    total -= expense.amount;
    expenseTotal += expense.amount;
}
    });

    document.getElementById("total")
        .textContent =
        "合計: ¥" + total;

document.getElementById("incomeTotal")
    .textContent =
    "収入合計: ¥" + incomeTotal;

document.getElementById("expenseTotal")
    .textContent =
    "支出合計: ¥" + expenseTotal;
}
function addExpense(){
const type =
    document.getElementById("type").value;

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

expenses.push({
    type: type,
    item: item,
    amount: amount
});

    saveExpenses();

    renderExpenses();

    document.getElementById("item").value = "";
    document.getElementById("amount").value = "";
}

function deleteItem(index){

    expenses.splice(index, 1);

    saveExpenses();

    renderExpenses();
}

renderExpenses();