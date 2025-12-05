let boxes = document.querySelectorAll(".box");
let playAgainBtn = document.getElementById("Play-Again");
let abortBtn = document.getElementById("Abort-Game");

let popup = document.getElementById("confirmPopup");
let cancelAbort = document.getElementById("cancelAbort");
let confirmAbort = document.getElementById("confirmAbort");
let turnInfo = document.getElementById("turnInfo");

let turnX = true; 
turnInfo.innerText = "Turn for X";  

let winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

function disableBoard() {
    boxes.forEach(box => box.disabled = true);
}

function enableBoard() {
    boxes.forEach(box => box.disabled = false);
}

boxes.forEach((box) => {
    box.addEventListener("click", () => {
        if (box.innerText !== "") 
            return;

      
        box.innerText = turnX ? "X" : "O";
        box.disabled = true;

        checkWinner();
        turnX = !turnX;

    
        if (![...boxes].every(b => b.disabled)) {
        turnInfo.innerText = turnX ? "Turn for X" : "Turn for O";
        }
    });
});

const checkWinner = () => {
    for (let pattern of winPatterns) {
        let [a, b, c] = pattern;
        let pos1 = boxes[a].innerText;
        let pos2 = boxes[b].innerText;
        let pos3 = boxes[c].innerText;

        if (pos1 !== "" && pos1 === pos2 && pos2 === pos3) {
            turnInfo.innerText = `${pos1} wins!`;
            alert(`${pos1} wins!`);
            disableBoard();  
            return;
        }
    }

    if ([...boxes].every(box => box.innerText !== "")) {
        turnInfo.innerText = "It's a draw!";
        alert("It's a draw!");
        disableBoard();
    }
};

playAgainBtn.addEventListener("click", () => {
    boxes.forEach(box => {
        box.innerText = "";
    });
    enableBoard();
    turnX = true;
    turnInfo.innerText = "Turn for X";  
});

abortBtn.addEventListener("click", () => {
    popup.style.display = "flex";
});

cancelAbort.addEventListener("click", () => {
    popup.style.display = "none";
});

confirmAbort.addEventListener()("click", () => {
    boxes.forEach(box => {
        box.innerText = "";
    });
    disableBoard();

    popup.style.display = "none";
    turnInfo.innerText = "Game aborted!";  
    alert("Game aborted!");
});

