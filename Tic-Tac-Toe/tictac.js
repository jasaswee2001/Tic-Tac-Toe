const menu = document.getElementById("menu");
const gamePage = document.getElementById("game-page");
const playWithFriendsBtn = document.getElementById("Play-With-Friends");

document.getElementById("Play-With-Friends").addEventListener("click", () => {
    window.location.href = "game.html"; 
});

document.getElementById("Play-With-AI").addEventListener("click", () => {
    alert("AI is ready to play");
});