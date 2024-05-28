import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";

// Configurar Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAvydCRYCLSjtn3aVb6NMiuSSigDoos_Jk",
    authDomain: "zipi-35801.firebaseapp.com",
    databaseURL: "https://zipi-35801-default-rtdb.firebaseio.com/users/-NyvLT7sormOiOBi-A6x", // Reemplaza con tu databaseURL real
    projectId: "zipi-35801",
    storageBucket: "zipi-35801.appspot.com",
    messagingSenderId: "547970717661",
    appId: "1:547970717661:web:8fb15b9fa5ea710bd38834",
    measurementId: "G-LXMB9WNQRF"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Funcionalidad del formulario de registro
document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let username = document.getElementById('username').value;
    let photo = document.getElementById('photo').files[0];
    
    if (username && photo) {
        // Subir la foto a Firebase Storage
        const storageReference = storageRef(storage, 'photos/' + Date.now() + '_' + photo.name);
        uploadBytes(storageReference, photo).then((snapshot) => {
            console.log('Foto subida a Firebase Storage');

            // Obtener la URL de descarga de la foto
            getDownloadURL(snapshot.ref).then((downloadURL) => {
                let user = {
                    name: username,
                    photo: downloadURL,
                    timestamp: new Date().getTime() // Almacena el tiempo actual en milisegundos
                };

                // Guarda el usuario en Firebase Realtime Database
                push(ref(database, 'users'), user)
                    .then(() => {
                        console.log('Usuario guardado en Firebase');

                        // Guarda el usuario actual en localStorage
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        window.location.href = 'result.html';
                    })
                    .catch((error) => {
                        console.log('Error al guardar en Firebase:', error);
                    });
            });
        }).catch((error) => {
            console.log('Error al subir la foto a Firebase Storage:', error);
        });
    } else {
        alert("Por favor, completa todos los campos antes de registrarte.");
    }
});

function getRandomUser(currentUser) {
    return new Promise((resolve, reject) => {
        onValue(ref(database, 'users'), (snapshot) => {
            let users = [];
            snapshot.forEach((childSnapshot) => {
                let user = childSnapshot.val();
                if ((new Date().getTime() - user.timestamp) < 86400000) { // Filtra usuarios que tienen menos de 24 horas
                    users.push(user);
                }
            });

            if (users.length <= 1) {
                resolve(null);
            } else {
                let randomIndex;
                do {
                    randomIndex = Math.floor(Math.random() * users.length);
                } while (users[randomIndex].name === currentUser.name);

                resolve(users[randomIndex]);
            }
        }, { onlyOnce: true });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Funcionalidad del carrusel de imágenes
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

    showSlides(1, 0);
    showSlides(1, 1);
    showSlides(1, 2);

    // Cargar el usuario aleatorio al cargar la página de resultados
    if (window.location.pathname.endsWith('result.html')) {
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            getRandomUser(currentUser).then(function(randomUser) {
                if (randomUser) {
                    document.getElementById('randomPhoto').src = randomUser.photo;
                    document.getElementById('randomUser').textContent = randomUser.name;
                } else {
                    document.getElementById('resultMessage').textContent = 'No hay usuarios suficientes para jugar.';
                }
            });
        } else {
            document.getElementById('resultMessage').textContent = 'No hay usuarios suficientes para jugar.';
        }

        // Inicializar el contador
        let countdown = 86400; // 24 horas en segundos
        let countdownElement = document.getElementById('countdown');

        function updateCountdown() {
            let hours = Math.floor(countdown / 3600);
            let minutes = Math.floor((countdown % 3600) / 60);
            let seconds = countdown % 60;

            countdownElement.textContent = `Tiempo restante: ${hours}h ${minutes}m ${seconds}s`;

            if (countdown > 0) {
                countdown--;
            } else {
                clearInterval(countdownInterval);
            }
        }

        let countdownInterval = setInterval(updateCountdown, 1000);
    }
});

// Hacer que las funciones del carrusel sean globales para el HTML
window.plusSlides = plusSlides;
window.showSlides = showSlides;

