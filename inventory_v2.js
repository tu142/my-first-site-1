
const inventory = [];

const inventoryHistory = [];

function saveInventory() {

  localStorage.setItem(
    "inventory",
    JSON.stringify(inventory)
  );
}

function saveInventoryHistory() {

  localStorage.setItem(
    "inventoryHistory",
    JSON.stringify(inventoryHistory)
  );

}

const savedInventoryHistory =
  localStorage.getItem("inventoryHistory");

if (savedInventoryHistory) {

  inventoryHistory.push(
    ...JSON.parse(savedInventoryHistory)
  );

}

const savedInventory =
  localStorage.getItem("inventory");

if (savedInventory) {

  const savedItems =
    JSON.parse(savedInventory);

  savedItems.forEach(function (item) {

    if (!item.id) {
      item.id = Date.now() + Math.random();
    }

    inventory.push(item);
  });

}

inventoryHistory.forEach(function (history) {

  if (!history.itemId) {

    const item = inventory.find(function (item) {
      return item.name === history.name;
    });

    if (item) {
      history.itemId = item.id;
    }

  }

});

saveInventoryHistory();

renderInventory();

const productInput =
  document.getElementById("productInput");

const inventorySearchInput =
  document.getElementById("inventorySearchInput");

const inventorySearchButton =
  document.getElementById("inventorySearchButton");

inventorySearchButton.addEventListener("click", function () {

  const keyword =
    inventorySearchInput.value.trim();

  searchCount++;

  inventorySearchCount.textContent =
    "検索回数：" + searchCount + "回";

  localStorage.setItem("inventorySearchCount", searchCount);

  searchInventory(keyword);

});

const inventoryDetail =
  document.getElementById("inventoryDetail");

const inventorySearchCount =
  document.getElementById("inventorySearchCount");

let searchCount =
  Number(localStorage.getItem("inventorySearchCount")) || 0;

inventorySearchCount.textContent =
  "検索回数：" + searchCount + "回";

const resetInventorySearchCountButton =
  document.getElementById(
    "resetInventorySearchCountButton"
  );

resetInventorySearchCountButton.addEventListener(
  "click",
  function () {

    searchCount = 0;

    localStorage.removeItem(
      "inventorySearchCount"
    );

    inventorySearchCount.textContent =
      "検索回数：" + searchCount + "回";
  }
);

const outOfStockList =
  document.getElementById("outOfStockList");

const lowStockList =
  document.getElementById("lowStockList");

const showLowStockButton =
  document.getElementById("showLowStockButton");



showLowStockButton.addEventListener("click", function () {

  const lowStockItems =
    inventory.filter(function (item) {
      return item.quantity <= 5;
    });

  console.log("在庫少の商品:", lowStockItems);

  lowStockItems.sort(function (a, b) {
    return a.quantity - b.quantity;
  });

  lowStockList.innerHTML = "";

  lowStockItems.forEach(function (item) {

    const li =
      document.createElement("li");

    li.textContent =
      item.name + " : " + item.quantity + "個";

    lowStockList.appendChild(li);

  });

});

function showInventoryDetail(item, result) {
  inventoryDetail.innerHTML =
    "<strong>基本情報</strong><br>" +
    "商品名：" +
    item.name +
    "<br>" +
    "現在の在庫：" +
    item.quantity +
    "個" +
    "<br>" +
    "入庫合計：" +
    result.inTotal +
    "個" +
    "<br>" +
    "出庫合計：" +
    result.outTotal +
    "個" +
    "<br>" +
    "調整を考慮しない差異：" +
    result.difference +
    "個" +
    "<br>" +
    "履歴件数：" +
    result.historyCount +
    "件";


  if (result.difference < 0) {

    inventoryDetail.innerHTML +=
      "<br><br>調整を考慮しない計算結果：" +
      "<br>履歴から計算した在庫より、現在の在庫が " +
      Math.abs(result.difference) +
      "個少なくなっています。";

  } else if (result.difference > 0) {

    inventoryDetail.innerHTML +=
      "<br><br>調整を考慮しない計算結果：" +
      "<br>履歴から計算した在庫より、現在の在庫が " +
      result.difference +
      "個多くなっています。";

  } else {

    inventoryDetail.innerHTML +=
      "<br>現在の在庫と履歴から計算した在庫は一致しています。";

  }

  const itemHistory =
    inventoryHistory.filter(function (history) {
      return history.itemId === item.id;
    });


  const hasAdjustment =
    itemHistory.some(function (history) {
      return history.type === "調整";
    });


  if (hasAdjustment) {

    inventoryDetail.innerHTML +=
      "<br><br>原因候補：" +
      "<br>過去に在庫調整が行われています。";

  } else {

    inventoryDetail.innerHTML +=
      "<br><br>原因候補：" +
      "<br>在庫調整の履歴はありません。";

  }


  const adjustmentHistory =
    itemHistory.filter(function (history) {

      return history.type === "調整";
    })
      .sort(function (a, b) {
        return b.createdAt - a.createdAt;
      });

  if (adjustmentHistory.length > 0) {

    const latestAdjustment =
      adjustmentHistory[0];


    inventoryDetail.innerHTML +=
      "<br><br>最後の調整内容：" +
      "<br>調整日時：" +
      latestAdjustment.time +
      "<br>変更前の在庫：" +
      latestAdjustment.oldQuantity +
      "個" +
      "<br>変更後の在庫：" +
      latestAdjustment.quantity +
      "個" +
      "<br>調整理由：" +
      latestAdjustment.reason;


    const afterAdjustmentHistory =
      itemHistory.filter(function (history) {
        return history.createdAt > latestAdjustment.createdAt;
      });


    const afterInTotal =
      afterAdjustmentHistory.reduce(function (total, history) {

        if (history.type === "入庫") {
          return total + history.quantity;
        }

        return total;

      }, 0);


    const afterOutTotal =
      afterAdjustmentHistory.reduce(function (total, history) {

        if (history.type === "出庫") {
          return total + history.quantity;
        }

        return total;

      }, 0);


    const afterCalculatedStock =
      latestAdjustment.quantity +
      afterInTotal -
      afterOutTotal;


    const afterDifference =
      item.quantity - afterCalculatedStock;


    inventoryDetail.innerHTML +=
      "<br><br>調整後の在庫チェック：" +
      "<br>調整後の計算上の在庫：" +
      afterCalculatedStock +
      "個" +
      "<br>現在の在庫：" +
      item.quantity +
      "個" +
      "<br>調整後の差異：" +
      afterDifference +
      "個";


    if (afterDifference === 0) {

      inventoryDetail.innerHTML +=
        "<br>→ 調整後の入出庫と現在の在庫は一致しています。";

    } else if (afterDifference < 0) {

      inventoryDetail.innerHTML +=
        "<br>→ 現在の在庫が " +
        Math.abs(afterDifference) +
        "個少なくなっています。";

    } else {

      inventoryDetail.innerHTML +=
        "<br>→ 現在の在庫が " +
        afterDifference +
        "個多くなっています。";

    }


    const afterInCount =
      afterAdjustmentHistory.filter(function (history) {
        return history.type === "入庫";
      }).length;


    const afterOutCount =
      afterAdjustmentHistory.filter(function (history) {
        return history.type === "出庫";
      }).length;


    inventoryDetail.innerHTML +=
      "<br><br>調整後の入出庫回数：" +
      "<br>入庫：" +
      afterInCount +
      "回" +
      "<br>出庫：" +
      afterOutCount +
      "回";


    inventoryDetail.innerHTML +=
      "<br><br><strong>調整履歴</strong>" +
      "<br>調整後の入出庫履歴：";


    afterAdjustmentHistory.forEach(function (history) {

      inventoryDetail.innerHTML +=
        "<br>" +
        history.time +
        " 【" +
        history.type +
        "】 " +
        history.quantity +
        "個";

    });

  }
}

const showInventorySummaryButton =
  document.getElementById("showInventorySummaryButton");

showInventorySummaryButton.onclick = function () {

  inventorySummaryList.innerHTML = "";

  inventory.forEach(function (item) {

    const li = document.createElement("li");

    const result =
      calculateInventory(item);

    let checkStatus;

    if (result.difference === 0) {
      checkStatus = "在庫は一致しています";
    } else if (result.difference > 0) {
      checkStatus = "登録在庫のほうが多いです";
    } else {
      checkStatus = "登録在庫のほうが少ないです";
    }

    let status;

    if (item.quantity === 0) {
      status = "在庫切れ";
    } else if (item.quantity <= 5) {
      status = "在庫少";
    } else {
      status = "通常";
    }

    li.textContent =
      item.name +
      " : " +
      item.quantity +
      "個" +
      " 【" +
      status +
      "】" +
      " 入庫合計：" +
      result.inTotal +
      "個" +
      " 出庫合計：" +
      result.outTotal +
      "個" +
      " 計算上の在庫：" +
      result.calculatedStock +
      "個" +
      " 在庫チェック：" +
      checkStatus;

    li.addEventListener("click", function () {
      showInventoryDetail(item, result);
    });

    inventorySummaryList.appendChild(li);

  });
};


function calculateInventory(item) {

  const allHistory =
    inventoryHistory.concat(importedHistory);

  allHistory.filter(function (history) {
    return history.name === item.name;
  });

  const itemHistory =
    allHistory.filter(function (history) {
      return Number(history.itemId) === Number(item.id);
    });

  const matchedHistory =
    inventoryHistory.filter(function (history) {
      return Number(history.itemId) === Number(item.id);
    });

  allHistory.slice(0, 5).map(function (history) {
    return history.itemId;
  })

  const validHistory =
    itemHistory.filter(isValidHistory);

  const historyCount = validHistory.length;

  const totals =
    validHistory.reduce(function (result, history) {

      if (history.type === "入庫") {
        result.inTotal += history.quantity;
      } else if (history.type === "出庫") {
        result.outTotal += history.quantity;
      }

      return result;

    }, {
      inTotal: 0,
      outTotal: 0
    });

  const calculatedStock =
    totals.inTotal - totals.outTotal;



  const difference =
    item.quantity - calculatedStock;

  return {
    inTotal: totals.inTotal,
    outTotal: totals.outTotal,
    calculatedStock: calculatedStock,
    difference: difference,
    historyCount: historyCount
  };
}

function isValidHistory(history) {

  if (
    history.type !== "入庫" &&
    history.type !== "出庫"
  ) {
    return false;
  }

  if (!Number.isFinite(history.quantity)) {
    return false;
  }

  if (
    history.quantity < 0 ||
    !Number.isInteger(history.quantity)
  ) {
    return false;
  }

  return true;
}

const showDifferenceButton =
  document.getElementById("showDifferenceButton");

showDifferenceButton.addEventListener("click", function () {
  differenceList.innerHTML = "";

  const results = inventory.map(function (item) {
    const result = calculateInventory(item);

    return {
      name: item.name,
      inTotal: result.inTotal,
      outTotal: result.outTotal,
      calculatedStock: result.calculatedStock,
      difference: result.difference,
      historyCount: result.historyCount
    };
  });

  const differences = results.filter(function (result) {
    return result.difference !== 0;
  });

  differences.forEach(function (result) {

    const li = document.createElement("li");

    if (result.difference > 0) {
      li.textContent =
        result.name +
        "：現在の在庫 " +
        result.difference +
        "個多い" +
        " / 入庫合計 " +
        result.inTotal +
        "個" +
        " / 出庫合計 " +
        result.outTotal +
        "個" +
        " / 計算上の在庫 " +
        result.calculatedStock +
        "個" +
        " / 履歴件数 " +
        result.historyCount +
        "件";
    } else {
      li.textContent =
        result.name +
        "：現在の在庫 " +
        Math.abs(result.difference) +
        "個少ない" +
        " / 入庫合計 " +
        result.inTotal +
        "個" +
        " / 出庫合計 " +
        result.outTotal +
        "個" +
        " / 計算上の在庫 " +
        result.calculatedStock +
        "個" +
        " / 履歴件数 " +
        result.historyCount +
        "件";
    }

    differenceList.appendChild(li);
  });
});

const adjustProductInput =
  document.getElementById("adjustProductInput");

const adjustQuantityInput =
  document.getElementById("adjustQuantityInput");

const adjustInventoryButton =
  document.getElementById("adjustInventoryButton");

const differenceList =
  document.getElementById("differenceList");

const inventorySummaryList =
  document.getElementById("inventorySummaryList");

const showOutOfStockButton =
  document.getElementById("showOutOfStockButton");

const quantityInput =
  document.getElementById("quantityInput");

const addButton =
  document.getElementById("addButton");


const resetInventoryButton =
  document.getElementById("resetInventoryButton");

const allHistoryButton =
  document.getElementById("allHistoryButton");

const inHistoryButton =
  document.getElementById("inHistoryButton");

const outHistoryButton =
  document.getElementById("outHistoryButton");


const removeQuantityInput =
  document.getElementById("removeQuantityInput");

const removeButton =
  document.getElementById("removeButton");

const adjustReasonInput =
  document.getElementById("adjustReasonInput");

const inventorySearchList =
  document.getElementById("inventorySearchList");

const checkInventoryButton =
  document.getElementById("checkInventoryButton");

const inventoryCheckList =
  document.getElementById("inventoryCheckList");

checkInventoryButton.addEventListener("click", function () {

  inventoryCheckList.innerHTML = "";

  inventory.forEach(function (item) {

    const result =
      calculateInventory(item);

    if (result.difference !== 0) {

      const li =
        document.createElement("li");

      li.textContent =
        item.name +
        "：在庫差異 " +
        result.difference +
        "個";

      if (result.difference < 0) {

        li.textContent +=
          " → 実際の在庫の方が少ない";

      } else {

        li.textContent +=
          " → 実際の在庫の方が多い";

      }
      li.addEventListener("click", function () {

        const itemHistory =
          inventoryHistory.filter(function (history) {
            return history.name === item.name;
          });

        inventoryDetail.innerHTML =
          "<strong>基本情報</strong><br>" +
          "商品名 : " +
          item.name +
          "<br>" +
          "現在の在庫 : " +
          item.quantity +
          "個" +
          "<br>" +
          "入庫合計 : " +
          result.inTotal +
          "個" +
          "<br>" +
          "出庫合計 : " +
          result.outTotal +
          "個" +
          "<br>" +
          "差異：" +
          result.difference +
          "個" +
          "<br>" +
          "履歴件数：" +
          result.historyCount +
          "件";

        if (result.difference < 0) {

          inventoryDetail.innerHTML +=
            "<br><br>原因 : " +
            "<br>履歴から計算した在庫より、現在の在庫が " +
            Math.abs(result.difference) +
            "個が少なくなっています。 " +
            "<br>履歴件数：" +
            result.historyCount +
            "件";

        } else {

          inventoryDetail.innerHTML +=
            "<br><br>原因 : " +
            "<br>履歴から計算した在庫より、現在の在庫が" +
            result.difference +
            "個多くなっています。 " +
            "<br>履歴件数：" +
            result.historyCount +
            "件";

        }

        const hasAdjustment =
          itemHistory.some(function (history) {
            return history.type === "調整";
          });

        if (hasAdjustment) {

          inventoryDetail.innerHTML +=
            "<br><br>原因候補：" +
            "<br>過去に在庫調整が行われています。";

          inventoryDetail.innerHTML +=
            "<br><br><strong>全履歴</strong>";

          itemHistory.forEach(function (history) {

            if (history.type === "調整") {

              inventoryDetail.innerHTML +=
                "<br>" +
                history.time +
                " 【調整】 " +
                history.oldQuantity +
                "個 → " +
                history.quantity +
                "個" +
                " 理由：" +
                history.reason;

            } else {

              inventoryDetail.innerHTML +=
                "<br>" +
                history.time +
                " 【" +
                history.type +
                "】 " +
                history.quantity +
                "個";

            }

          });

        } else {

          inventoryDetail.innerHTML +=
            "<br><br>原因候補：" +
            "<br>在庫調整の履歴はありません。";

        }

        inventoryDetail.innerHTML +=
          "<br><br><strong>全履歴</strong>";

        itemHistory.forEach(function (history) {

          if (history.type === "調整") {

            inventoryDetail.innerHTML +=
              "<br>" +
              history.time +
              " 【調整】 " +
              history.oldQuantity +
              "個 → " +
              history.quantity +
              "個" +
              " 理由：" +
              history.reason;

          } else {

            inventoryDetail.innerHTML +=
              "<br>" +
              history.time +
              " 【" +
              history.type +
              "】 " +
              history.quantity +
              "個";

          }

        });

        inventoryDetail.innerHTML +=
          "<br><br><strong>調整履歴</strong>";

        const adjustmentHistory =
          itemHistory.filter(function (history) {
            return history.type === "調整";
          });

        if (adjustmentHistory.length > 0) {

          const latestAdjustment =
            adjustmentHistory[0];

          const afterAdjustmentHistory =
            itemHistory.filter(function (history) {
              return history.createdAt > latestAdjustment.createdAt;
            });

          afterAdjustmentHistory.sort(function (a, b) {
            return b.createdAt - a.createdAt;
          });

          const calculationHistory =
            [...afterAdjustmentHistory].sort(function (a, b) {
              return a.createdAt - b.createdAt;
            });

          let runningStock = latestAdjustment.quantity;

          calculationHistory.forEach(function (history) {

            if (history.type === "入庫") {
              runningStock =
                runningStock + history.quantity;

            } else if (history.type === "出庫") {
              runningStock =
                runningStock - history.quantity;
            }

          });

          let displayStock =
            latestAdjustment.quantity;

          afterAdjustmentHistory.forEach(function (history) {

            const calculationItem =
              calculationHistory.find(function (item) {
                return item.createdAt === history.createdAt;
              });

            let stockAfter;

            if (calculationItem) {

              const index =
                calculationHistory.findIndex(function (item) {
                  return item.createdAt === history.createdAt;
                });

              stockAfter =
                latestAdjustment.quantity;

              for (let i = 0; i <= index; i++) {

                if (calculationHistory[i].type === "入庫") {
                  stockAfter +=
                    calculationHistory[i].quantity;

                } else if (calculationHistory[i].type === "出庫") {
                  stockAfter -=
                    calculationHistory[i].quantity;
                }
              }
            }

            inventoryDetail.innerHTML +=
              "<br><br>調整後の入出庫履歴：";

            afterAdjustmentHistory.forEach(function (history) {

              inventoryDetail.innerHTML +=
                "<br>" +
                history.time +
                " 【" +
                history.type +
                "】 " +
                history.quantity +
                "個";

            });

          });


          afterAdjustmentHistory.forEach(function (history) {

            inventoryDetail.innerHTML +=
              "<br>" +
              history.time +
              " 【" +
              history.type +
              "】 " +
              history.quantity +
              "個";

          });

          const afterInTotal =
            afterAdjustmentHistory.reduce(function (total, history) {

              if (history.type === "入庫") {
                return total + history.quantity;
              }

              return total;

            }, 0);

          const afterOutTotal =
            afterAdjustmentHistory.reduce(function (total, history) {

              if (history.type === "出庫") {
                return total + history.quantity;
              }

              return total;

            }, 0);

          const afterCalculatedStock =
            latestAdjustment.quantity +
            afterInTotal -
            afterOutTotal;

          const afterInCount =
            afterAdjustmentHistory.filter(function (history) {
              return history.type === "入庫";
            }).length;

          const afterOutCount =
            afterAdjustmentHistory.filter(function (history) {
              return history.type === "出庫";
            }).length;

          inventoryDetail.innerHTML +=
            "<br><br>調整後の入出庫回数：" +
            "<br>入庫：" +
            afterInCount +
            "回" +
            "<br>出庫：" +
            afterOutCount +
            "回";

          const afterDifference =
            item.quantity - afterCalculatedStock;

          inventoryDetail.innerHTML +=
            "<br><br>調整後の在庫チェック：" +
            "<br>調整後の計算上の在庫：" +
            afterCalculatedStock +
            "個" +
            "<br>現在の在庫：" +
            item.quantity +
            "個";

          if (afterDifference === 0) {

            inventoryDetail.innerHTML +=
              "<br>→ 調整後の入出庫と現在の在庫は一致しています。";

          } else if (afterDifference < 0) {

            inventoryDetail.innerHTML +=
              "<br>→ 現在の在庫が " +
              Math.abs(afterDifference) +
              "個少なくなっています。";

          } else {

            inventoryDetail.innerHTML +=
              "<br>→ 現在の在庫が " +
              afterDifference +
              "個多くなっています。";

          }

          inventoryDetail.innerHTML +=
            "<br><br>調整後の入出庫回数：" +
            "<br>入庫：" +
            afterInCount +
            "回" +
            "<br>出庫：" +
            afterOutCount +
            "回";

          const adjustmentDifference =
            item.quantity - latestAdjustment.quantity;

          if (adjustmentDifference === 0) {

            inventoryDetail.innerHTML +=



              "<br>→ 最新の調整後の在庫と現在の在庫は一致しています。";

          } else if (adjustmentDifference < 0) {

            inventoryDetail.innerHTML +=
              "<br>→ 現在の在庫が " +
              Math.abs(adjustmentDifference) +
              "個少なくなっています。";

          } else {

            inventoryDetail.innerHTML +=
              "<br>→ 現在の在庫が " +
              adjustmentDifference +
              "個多くなっています。";

          }
          const difference =
            latestAdjustment.quantity -
            latestAdjustment.oldQuantity;

          if (difference > 0) {
            inventoryDetail.innerHTML +=
              "<br>→ 在庫が " +
              difference +
              "個増加しました";
          } else if (difference < 0) {
            inventoryDetail.innerHTML +=
              "<br>→ 在庫が " +
              Math.abs(difference) +
              "個減少しました";
          } else {
            inventoryDetail.innerHTML +=
              "<br>→ 在庫に変化はありません";
          }



          inventoryDetail.innerHTML +=
            "<br>調整回数：" +
            adjustmentHistory.length +
            "回";


          inventoryDetail.innerHTML +=
            "<br><br>最後の調整内容：" +
            "<br>調整日時：" +
            latestAdjustment.time +
            "<br>変更前の在庫：" +
            latestAdjustment.oldQuantity +
            "個" +
            "<br>変更後の在庫：" +
            latestAdjustment.quantity +
            "個" +
            "<br>調整理由：" +
            latestAdjustment.reason;



        }

        adjustmentHistory.forEach(function (history) {

          inventoryDetail.innerHTML +=
            "<br>調整日時：" +
            history.time +

            "<br>調整理由：" +
            history.reason;

        });

        inventoryDetail.innerHTML +=
          "<br><br>入出庫・調整履歴：";

        itemHistory.forEach(function (history) {

          if (history.type === "調整") {

            inventoryDetail.innerHTML +=
              "<br>" +
              history.time +
              " 【調整】 " +
              history.oldQuantity +
              "個 → " +
              history.quantity +
              "個" +
              " 理由：" +
              history.reason;

          } else {

            inventoryDetail.innerHTML +=
              "<br>" +
              history.time +
              " 【" +
              history.type +
              "】 " +
              history.quantity +
              "個";

          }

        });

      });

      inventoryCheckList.appendChild(li);
    }


  });

});



showDifferenceButton.addEventListener("click", function () {

  differenceList.innerHTML = "";


  inventory.forEach(function (item) {

    const result =
      calculateInventory(item);

    if (result.difference !== 0) {

      const li = document.createElement("li");

      li.textContent =
        item.name +
        "：現在の在庫 " +
        item.quantity +
        "個" +
        " / 入庫合計 " +
        result.inTotal +
        "個" +
        " / 出庫合計 " +
        result.outTotal +
        "個" +
        " / 計算上の在庫 " +
        result.calculatedStock +
        "個" +
        " / 差異 " +
        Math.abs(result.difference) +
        "個";

      differenceList.appendChild(li);
    }

  });

});


adjustInventoryButton.addEventListener("click", function () {

  const name =
    adjustProductInput.value.trim();

  const correctQuantity =
    Number(adjustQuantityInput.value);

  const reason =
    adjustReasonInput.value.trim();

  if (reason === "") {
    alert("調整理由を入力してください");
    return;
  }

  const item =
    inventory.find(function (item) {
      return item.name === name;
    });

  if (!item) {
    alert("その商品はありません");
    return;
  }

  if (correctQuantity < 0) {
    alert("在庫数は0以上で入力してください");
    return;
  }

  const oldQuantity = item.quantity;

  item.quantity = correctQuantity;

  inventoryHistory.unshift({
    type: "調整",
    name: name,
    itemId: item.id,
    quantity: correctQuantity,
    oldQuantity: oldQuantity,
    reason: reason,
    time: new Date().toLocaleString(),
    createdAt: Date.now()
  });

  saveInventory();
  saveInventoryHistory();

  renderInventory();
  renderInventoryHistory();

  alert("在庫を調整しました");

});

function searchInventory(keyword) {

  const results =
    inventory.filter(function (item) {

      return item.name.includes(keyword);

    });

  results.sort(function (a, b) {

    if (a.quantity === 0 && b.quantity !== 0) {
      return -1;
    }

    if (a.quantity !== 0 && b.quantity === 0) {
      return 1;
    }



    if (a.quantity <= 5 && b.quantity > 5) {
      return -1;
    }

    if (a.quantity > 5 && b.quantity <= 5) {
      return 1;
    }

    return a.quantity - b.quantity;

  });

  renderSearchResults(results);

}

function renderSearchResults(results) {

  inventorySearchList.innerHTML = "";

  results.forEach(function (item) {

    const li =
      document.createElement("li");

    li.textContent =
      item.name + " : " +
      item.quantity + "個";

    li.addEventListener("click", function () {

      const itemHistory =
        inventoryHistory.filter(function (history) {
          return history.name === item.name;
        });

      inventoryDetail.textContent =
        "商品名：" +
        item.name +
        " 現在の在庫：" +
        item.quantity +
        "個";

      itemHistory.forEach(function (history) {

        if (history.type === "調整") {

          inventoryDetail.innerHTML +=
            "<br>" +
            history.time +
            " 【調整】 " +
            history.oldQuantity +
            "個 → " +
            history.quantity +
            "個";

        } else {

          inventoryDetail.innerHTML +=
            "<br>" +
            history.time +
            " 【" +
            history.type +
            "】 " +
            history.quantity +
            "個";

        }

      });

    });

    inventorySearchList.appendChild(li);

  });

}

showOutOfStockButton.addEventListener("click", function () {

  const outOfStockItems =
    inventory.filter(function (item) {
      return item.quantity === 0;
    });
  outOfStockList.innerHTML = "";

  outOfStockItems.forEach(function (item) {

    const li =
      document.createElement("li");

    li.textContent =
      item.name + " : " + item.quantity + "個";

    outOfStockList.appendChild(li);

  });
});

resetInventoryButton.addEventListener("click", function () {

  localStorage.removeItem("inventory");

  inventory.length = 0;

  renderInventory();

});
removeButton.addEventListener("click", function () {

  const name =
    productInput.value.trim();

  const removeQuantity =
    Number(removeQuantityInput.value);

  if (removeQuantity <= 0) {
    alert("出庫数量は0以上で入力してください");
    return;
  }

  const existingItem =
    inventory.find(function (item) {
      return item.name === name;
    });


  if (!existingItem) {
    alert("その商品は在庫にありません");
    return;
  }

  if (removeQuantity > existingItem.quantity) {
    alert("在庫が足りません");
    return;
  }

  existingItem.quantity =
    existingItem.quantity - removeQuantity;

  inventoryHistory.unshift({
    type: "出庫",
    name: name,
    itemId: existingItem.id,
    quantity: removeQuantity,
    time: new Date().toLocaleString(),
    createdAt: Date.now()
  });

  saveInventory();
  saveInventoryHistory();
  renderInventory();
  renderInventoryHistory();
});

addButton.addEventListener("click", function () {

  const name =
    productInput.value.trim();

  if (name === "") {
    alert("商品名を入力してください");
    return;
  }

  const quantity =
    Number(quantityInput.value);

  if (!validateQuantity(quantity)) {
    return;
  }

  let newItem = null;

  const existingItem =
    inventory.find(function (item) {
      return item.name === name;
    });

  if (existingItem) {

    existingItem.quantity =
      existingItem.quantity + quantity;
  } else {
    newItem = {
      id: Date.now(),
      name: name,
      quantity: quantity
    };

    inventory.push(newItem);
  }

  const targetItem = existingItem || newItem;

  inventoryHistory.unshift({
    type: "入庫",
    name: name,
    itemId: targetItem.id,
    quantity: quantity,
    time: new Date().toLocaleString(),
    createdAt: Date.now()
  });

  saveInventory();
  saveInventoryHistory();
  renderInventory();
  renderInventoryHistory();
});

function renderInventory() {

  const inventoryList =
    document.getElementById("inventoryList");

  inventoryList.innerHTML = "";

  const displayInventory = [...inventory];

  displayInventory.sort(function (a, b) {

    const aLow =
      a.quantity <= 5;

    const bLow =
      b.quantity <= 5;

    const aOut =
      a.quantity === 0;

    const bOut =
      b.quantity === 0;

    if (aOut && !bOut) {
      return -1;
    }

    if (!aOut && bOut) {
      return 1;
    }

    if (aLow && !bLow) {
      return -1;
    }

    if (!aLow && bLow) {
      return 1;
    }

    return 0;

  });

  displayInventory.forEach(function (item) {

    const li =
      document.createElement("li");

    li.textContent =
      item.name + "*" + item.quantity + "個";


    if (item.quantity === 0) {
      li.textContent += " ❌ 在庫切れ";

    } else if (item.quantity <= 5) {
      li.textContent += " ⚠️ 在庫少";
    }

    const deleteButton =
      document.createElement("button");

    deleteButton.textContent = "削除";

    deleteButton.addEventListener("click", function () {

      const deleteIndex =
        inventory.findIndex(function (inventoryItem) {
          return inventoryItem === item;
        });

      inventory.splice(deleteIndex, 1);

      renderInventory();

    });
    li.appendChild(deleteButton);

    inventoryList.appendChild(li);
  });
}

function renderInventoryHistory(filterType) {

  const resetInventoryHistoryButton =
    document.getElementById("resetInventoryHistoryButton");

  resetInventoryHistoryButton.addEventListener(
    "click",
    function () {

      inventoryHistory.length = 0;

      localStorage.removeItem("inventoryHistory");

      renderInventoryHistory();

      alert("入出庫履歴をリセットしました");
    }
  );

  const historyList =
    document.getElementById("inventoryHistoryList");

  historyList.innerHTML = "";

  const undoMessage =
    document.getElementById("undoMessage");

  if (historySortOrder === "oldest") {

    inventoryHistory.sort(function (a, b) {
      return a.createdAt - b.createdAt;
    });

  } else {

    inventoryHistory.sort(function (a, b) {
      return b.createdAt - a.createdAt;
    });

  }

  let displayHistory;

  if (filterType === "入庫") {

    displayHistory =
      inventoryHistory.filter(function (history) {
        return history.type === "入庫";
      });

  } else if (filterType === "出庫") {

    displayHistory =
      inventoryHistory.filter(function (history) {
        return history.type === "出庫";
      });

  } else {

    displayHistory =
      inventoryHistory;
  }

  displayHistory.forEach(function (history) {

    const li =
      document.createElement("li");

    li.textContent =
      history.time +
      " : " +
      history.type +
      " " +
      history.name +
      " " +
      history.quantity +
      "個";

    const inventoryHistoryCount =
      document.getElementById("inventoryHistoryCount");


    inventoryHistoryCount.textContent =
      "入出庫履歴：" +
      displayHistory.length +
      "件";

    const deleteButton =
      document.createElement("button");

    deleteButton.textContent = "削除";

    deleteButton.addEventListener("click", function (event) {

      event.stopPropagation();

      const deleteIndex =
        inventoryHistory.findIndex(function (historyItem) {
          return historyItem === history;
        });

      if (deleteIndex === -1) {
        return;
      }

      const result =
        confirm("この履歴を削除しますか？");

      if (!result) {
        return;
      }

      const deletedHistory =
        inventoryHistory[deleteIndex];

      inventoryHistory.splice(deleteIndex, 1);

      const undoButton =
        document.createElement("button");

      undoButton.textContent = "元に戻す";

      undoButton.addEventListener("click", function () {

        inventoryHistory.splice(
          deleteIndex,
          0,
          deletedHistory
        );

        saveInventoryHistory();

        renderInventoryHistory();

      });

      undoMessage.innerHTML = "";

      undoMessage.appendChild(undoButton);

    });

    li.appendChild(deleteButton);

    li.addEventListener("click", function () {
      if (history.type === "調整") {

        inventoryDetail.innerHTML =
          "日時：" +
          history.time +
          "<br>" +
          "種類：" +
          history.type +
          "<br>" +
          "商品名：" +
          history.name +
          "<br>" +
          "変更前：" +
          history.oldQuantity +
          "個" +
          "<br>" +
          "変更後：" +
          history.quantity +
          "個" +
          "<br>" +
          "調整理由：" +
          history.reason;

      } else {

        inventoryDetail.innerHTML =
          "日時：" +
          history.time +
          "<br>" +
          "種類：" +
          history.type +
          "<br>" +
          "商品名：" +
          history.name +
          "<br>" +
          "数量：" +
          history.quantity +
          "個";

      }

    });

    historyList.appendChild(li);
  });
}

function renderSearchHistoryResults() {

  historySearchList.innerHTML = "";

  if (historySearchResults.length === 0) {

    const li =
      document.createElement("li");

    li.textContent =
      "検索結果がありません";

    historySearchList.appendChild(li);

    return;
  }

  historySearchResults.forEach(function (history) {

    const li =
      document.createElement("li");

    li.textContent =
      history.time +
      " : " +
      history.type +
      " " +
      history.name +
      " " +
      history.quantity +
      "個";

    li.addEventListener("click", function () {

      inventoryDetail.innerHTML =
        "日時：" +
        history.time +
        "<br>" +
        "種類：" +
        history.type +
        "<br>" +
        "商品名：" +
        history.name +
        "<br>" +
        "数量：" +
        history.quantity +
        "個";

      if (history.type === "調整") {

        inventoryDetail.innerHTML +=
          "<br>" +
          "変更前：" +
          history.oldQuantity +
          "個" +
          "<br>" +
          "変更後：" +
          history.quantity +
          "個" +
          "<br>" +
          "理由：" +
          history.reason;

      }

    });

    historySearchList.appendChild(li);

  });


}

const newestHistoryButton =
  document.getElementById("newestHistoryButton");

newestHistoryButton.addEventListener("click", function () {

  inventoryHistory.sort(function (a, b) {
    return b.createdAt - a.createdAt;
  });

  historySortOrder = "newest";

  localStorage.setItem(
    "historySortOrder",
    historySortOrder
  );

  renderInventoryHistory();

});

const oldestHistoryButton =
  document.getElementById("oldestHistoryButton");

oldestHistoryButton.addEventListener("click", function () {

  inventoryHistory.sort(function (a, b) {
    return a.createdAt - b.createdAt;
  });

  historySortOrder = "oldest";

  localStorage.setItem(
    "historySortOrder",
    historySortOrder
  );

  renderInventoryHistory();

});

let historySortOrder =
  localStorage.getItem("historySortOrder") || "newest";

let historySearchResults = [];

function csvValue(value) {

  return '"' +
    String(value).replace(/"/g, '""') +
    '"';

}

const historySearchInput =
  document.getElementById("historySearchInput");

const exportHistoryButton =
  document.getElementById("exportHistoryButton");

exportHistoryButton.addEventListener("click", function () {

  let csv =
    "日時,種類,商品名,数量,変更前,変更後,理由\n";

  historySearchResults.forEach(function (history) {

    csv +=
      csvValue(history.time) +
      "," +
      csvValue(history.type) +
      "," +
      csvValue(history.name) +
      "," +
      csvValue(history.quantity) +
      "," +
      csvValue(history.oldQuantity ?? "") +
      "," +
      csvValue(
        history.type === "調整"
          ? history.quantity
          : ""
      ) +
      "," +
      csvValue(history.reason ?? "") +
      "\n";

  });
  const bom = "\uFEFF";

  const blob =
    new Blob([bom + csv], {
      type: "text/csv;charset=utf-8"
    });

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;
  a.download = "inventory_history.csv";

  a.click();

  URL.revokeObjectURL(url);

});

const csvFileInput =
  document.getElementById("csvFileInput");

const readCsvButton =
  document.getElementById("readCsvButton");

const csvResult =
  document.getElementById("csvResult");

function parseCsvLine(line) {

  const values = [];
  let value = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {

    const char = line[i];

    if (char === '"') {

      insideQuotes = !insideQuotes;

    } else if (char === "," && !insideQuotes) {

      values.push(value);
      value = "";

    } else {

      value += char;

    }

  }

  values.push(value);

  return values;
}

const savedImportedHistory =
  localStorage.getItem("importedHistory");

const importedHistory =
  savedImportedHistory
    ? JSON.parse(savedImportedHistory)
    : [];

function renderImportedHistory() {

  const importedHistoryList =
    document.getElementById("importedHistoryList");

  importedHistoryList.innerHTML = "";

  importedHistory.forEach(function (history) {

    const li =
      document.createElement("li");

    li.textContent =
      history.time +
      " : " +
      history.type +
      " " +
      history.name +
      " " +
      history.quantity +
      "個" +
      " / 変更前: " +
      (history.oldQuantity ?? "-") +
      " / 変更後: " +
      (history.newQuantity ?? "-") +
      " / 理由: " +
      (history.reason || "-");

    importedHistoryList.appendChild(li);

  });
}

localStorage.getItem("importedHistory")
readCsvButton.addEventListener("click", function () {

  const file =
    csvFileInput.files[0];

  if (!file) {
    alert("CSVファイルを選択してください");
    return;
  }

  const reader =
    new FileReader();

  reader.onload = function () {

    const csv =
      reader.result;

    importedHistory.length = 0;

    const lines =
      csv.split("\n");

    lines.slice(1).forEach(function (line) {

      if (line.trim() === "") {
        return;
      }
      const values =
        parseCsvLine(line);

      if (!validateDateTime(values[0])) {
        return;
      }

      if (
        values[1] !== "入庫" &&
        values[1] !== "出庫"
      ) {
        alert("種類が正しくありません");
        return;
      }

      if (values[2].trim() === "") {
        alert("商品名が入力されていません");
        return;
      }
      if (values[3].trim() === "") {
        alert("数量が入力されていません");
        return;
      }

      const quantity =
        Number(values[3]);

      if (!validateQuantity(quantity)) {
        return;
      }

      if (!validateOptionalQuantity(values[4])) {
        return;
      }

      if (!validateOptionalQuantity(values[5])) {
        return;
      }

      const history =
        createHistory(values);

      const isDuplicate =
        importedHistory.some(function (item) {
          return (
            item.time === history.time &&
            item.type === history.type &&
            item.name === history.name &&
            item.quantity === history.quantity
          );
        });

      if (!isDuplicate) {
        importedHistory.push(history);
      }

      saveImportedHistory();

    });

    csvResult.textContent =
      lines.join("\n");

    renderImportedHistory();
  };
  reader.readAsText(file, "UTF-8");
});

const importHistoryButton =
  document.getElementById("importHistoryButton");

importHistoryButton.addEventListener("click", function () {

  let newCount = 0;
  let newHistory = [];

  importedHistory.forEach(function (history) {

    const exists =
      inventoryHistory.some(function (item) {

        return (
          item.createdAt === history.createdAt &&
          item.type === history.type &&
          item.name === history.name &&
          item.quantity === history.quantity
        );

      });

    if (!exists) {

      newCount++;

      newHistory.push(history);

    }

  });

  if (newCount === 0) {
    alert("新しく取り込むデータはありません");
    return;
  }

  const result = confirm(
    newCount + "件のデータを取り込みます。よろしいですか？"
  );

  if (!result) {
    return;
  }

  newHistory.forEach(function (history) {
    inventoryHistory.push(history);
  });

  importedHistory.length = 0;

  saveInventoryHistory();
  renderInventoryHistory();

  saveImportedHistory();
  renderImportedHistory();

});

function validateQuantity(quantity) {


  if (!Number.isFinite(quantity)) {
    alert("数量が正しい数字ではありません");
    return false;
  }

  if (quantity < 0) {
    alert("数量は0以上で入力してください");
    return false;
  }

  if (!Number.isInteger(quantity)) {
    alert("数量は整数で入力してください");
    return false;
  }

  return true;
}

function validateOptionalQuantity(quantity) {

  if (quantity === "") {
    return true;
  }

  const number =
    Number(quantity);

  if (!Number.isFinite(number)) {
    alert("数量が正しい数字ではありません");
    return false;
  }

  if (number < 0) {
    alert("数量は0以上で入力してください");
    return false;
  }

  if (!Number.isInteger(number)) {
    alert("数量は整数で入力してください");
    return false;
  }

  return true;
}

function validateDateTime(value) {

  if (value.trim() === "") {
    alert("日時が入力されていません");
    return false;
  }

  if (
    !/^\d{4}\/\d{1,2}\/\d{1,2} \d{1,2}:\d{2}:\d{2}$/.test(value)
  ) {
    alert("日時の形式が正しくありません");
    return false;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    alert("日時が正しくありません");
    return false;
  }

  const parts = value.match(
    /^(\d{4})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{2}):(\d{2})$/
  );

  const year = Number(parts[1]);
  const month = Number(parts[2]);
  const day = Number(parts[3]);

  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    alert("存在しない日時です");
    return false;
  }

  return true;
}

function validateType(type) {

  if (!validateType(values[1])) {
    return;
  }
}

function validateProductName(name) {

  if (!validateProductName(values[2])) {
    return;
  }

  return true;
}

function createHistory(values) {

  return {
    time: values[0],
    type: values[1],
    name: values[2],

    itemId: (function () {
      const item = inventory.find(function (item) {
        return item.name === values[2];
      });

      return item ? item.id : undefined;
    })(),

    quantity: Number(values[3]),

    oldQuantity:
      values[4] === ""
        ? undefined
        : Number(values[4]),
    newQuantity:
      values[5] === ""
        ? undefined
        : Number(values[5]),
    reason: values[6],
    createdAt:
      new Date(values[0]).getTime()
  };
}


function saveImportedHistory() {

  localStorage.setItem(
    "importedHistory",
    JSON.stringify(importedHistory)
  );
}

const clearImportedHistoryButton =
  document.getElementById("clearImportedHistoryButton");

clearImportedHistoryButton.addEventListener("click", function () {
  const result = confirm("読み込み履歴をすべて削除しますか？");

  if (!result) {
    return;
  }

  importedHistory.length = 0;

  saveImportedHistory();

  renderImportedHistory();
});

const historySearchCount =
  document.getElementById("historySearchCount");

const historySearchButton =
  document.getElementById("historySearchButton");

const resetHistorySearchButton =
  document.getElementById("resetHistorySearchButton");

resetHistorySearchButton.addEventListener("click", function () {

  historySearchInput.value = "";

  historyTypeSelect.value = "すべて";

  historySearchResults = [];

  historySearchList.innerHTML = "";

  inventoryDetail.innerHTML = "";

});

const historySearchList =
  document.getElementById("historySearchList");

const newestSearchHistoryButton =
  document.getElementById("newestSearchHistoryButton");

newestSearchHistoryButton.addEventListener("click", function () {

  historySearchResults.sort(function (a, b) {
    return b.createdAt - a.createdAt;
  });

  renderSearchHistoryResults();

});

const oldestSearchHistoryButton =
  document.getElementById("oldestSearchHistoryButton");

oldestSearchHistoryButton.addEventListener("click", function () {

  historySearchResults.sort(function (a, b) {
    return a.createdAt - b.createdAt;
  });

  renderSearchHistoryResults();

});
const historyTypeSelect =
  document.getElementById("historyTypeSelect");

historySearchButton.addEventListener("click", function () {

  const keyword =
    historySearchInput.value.trim();

  const selectedType =
    historyTypeSelect.value;


  historySearchResults =
    inventoryHistory.filter(function (history) {
      return (
        history.name.includes(keyword) &&
        (
          selectedType === "すべて" ||
          history.type === selectedType
        )
      );

    });

  historySearchCount.textContent =
    "検索結果：" +
    historySearchResults.length +
    "件";

  renderSearchHistoryResults();
});



allHistoryButton.addEventListener("click", function () {

  renderInventoryHistory("すべて");

});

inHistoryButton.addEventListener("click", function () {

  renderInventoryHistory("入庫");

});

outHistoryButton.addEventListener("click", function () {

  renderInventoryHistory("出庫");

});

saveInventory();
saveInventoryHistory();
renderInventory();
renderInventoryHistory();
renderImportedHistory();



