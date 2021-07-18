let db;

const request = window.indexedDB.open("budgetdb", 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;

  const budgetStore = db.createObjectStore("BudgetStore", {
    autoIncrement: true,
  });
};

request.onsuccess = (event) => {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  console.log(event.target.errorCode);
};

function saveRecord(record) {
  const db = request.result;
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  budgetStore.add(record);
}

function checkDatabase() {
  const db = request.result;
  const transaction = db.transaction(["BudgetStore"], "readwrite");
  const budgetStore = transaction.objectStore("BudgetStore");
  const requestAll = budgetStore.getAll();

  requestAll.onsuccess = function () {
    if (requestAll.result.length > 0) {
      fetch("/api/transaction", {
        method: "POST",
        body: JSON.stringify(requestAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((results) => {
          const db = request.result;
          const transaction = db.transaction(["BudgetStore"], "readwrite");
          const budgetStore = transaction.objectStore("BudgetStore");
          if (results.length > 0) {
            budgetStore.clear();
          }
        });
    }
  };
}
