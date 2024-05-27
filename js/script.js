document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let username = document.getElementById('username').value;
    let photo = document.getElementById('photo').files[0];
    
    if (username && photo) {
        let reader = new FileReader();
        reader.onloadend = function() {
            let user = {
                name: username,
                photo: reader.result,
                timestamp: new Date().getTime() // Almacena el tiempo actual en milisegundos
            };

            let users = JSON.parse(localStorage.getItem('users')) || [];
            users.push(user);
            localStorage.setItem('users', JSON.stringify(users));

            // Filtra los usuarios que tienen menos de 24 horas
            users = users.filter(u => (new Date().getTime() - u.timestamp) < 86400000);
            localStorage.setItem('users', JSON.stringify(users));

            let randomUser = getRandomUser(users, user);
            localStorage.setItem('currentUser', JSON.stringify(randomUser));

            window.location.href = 'result.html';
        };
        reader.readAsDataURL(photo);
    }
});

function getRandomUser(users, currentUser) {
    if (users.length <= 1) return null;

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * users.length);
    } while (users[randomIndex].name === currentUser.name);

    return users[randomIndex];
}

// Carousel functionality
let slideIndex = [1, 1, 1];
let slideId = ["carousel1", "carousel2", "carousel3"];

function plusSlides(n, no) {
    showSlides(slideIndex[no] += n, no);
}

function showSlides(n, no) {
    let i;
    let x = document.getElementById(slideId[no]).getElementsByClassName("carousel-image");
    if (n > x.length) {slideIndex[no] = 1}
    if (n < 1) {slideIndex[no] = x.length}
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";  
    }
    x[slideIndex[no]-1].style.display = "block";  
}

document.addEventListener('DOMContentLoaded', function() {
    showSlides(1, 0);
    showSlides(1, 1);
    showSlides(1, 2);
});
