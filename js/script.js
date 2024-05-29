// Importar las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-storage.js";

// Configurar Firebase con los parámetros del proyecto
const firebaseConfig = {
    apiKey: "AIzaSyAvydCRYCLSjtn3aVb6NMiuSSigDoos_Jk",
    authDomain: "zipi-35801.firebaseapp.com",
    databaseURL: "https://zipi-35801.firebaseio.com",
    projectId: "zipi-35801",
    storageBucket: "zipi-35801.appspot.com",
    messagingSenderId: "547970717661",
    appId: "1:547970717661:web:8fb15b9fa5ea710bd38834",
    measurementId: "G-LXMB9WNQRF"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    // Obtener el formulario de registro por su ID
    const registerForm = document.getElementById('registerForm');

    // Verificar si el formulario de registro existe en el DOM
    if (registerForm) {
        // Añadir un event listener para manejar el evento 'submit' del formulario
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevenir el comportamiento por defecto del formulario

            // Obtener los valores del nombre de usuario y la foto del formulario
            let username = document.getElementById('username').value;
            let photo = document.getElementById('photo').files[0];

            // Verificar si el nombre de usuario y la foto están presentes
            if (username && photo) {
                // Crear una referencia de almacenamiento para la foto
                const storageReference = storageRef(storage, 'photos/' + Date.now() + '_' + photo.name);
                
                // Subir la foto a Firebase Storage
                uploadBytes(storageReference, photo).then((snapshot) => {
                    console.log('Foto subida a Firebase Storage');

                    // Obtener la URL de descarga de la foto subida
                    getDownloadURL(snapshot.ref).then((downloadURL) => {
                        // Crear un objeto de usuario con el nombre, la foto y la marca de tiempo
                        let user = {
                            name: username,
                            photo: downloadURL,
                            timestamp: new Date().getTime()
                        };

                        // Guardar el objeto de usuario en Firebase Realtime Database
                        push(ref(database, 'users'), user)
                            .then(() => {
                                console.log('Usuario guardado en Firebase');

                                // Guardar el usuario actual en el almacenamiento local del navegador
                                localStorage.setItem('currentUser', JSON.stringify(user));

                                // Redirigir a la página de resultados del juego
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
    }
});

// Función para obtener un usuario aleatorio de Firebase Database
function getRandomUser(currentUser) {
    return new Promise((resolve, reject) => {
        // Leer los datos de 'users' en Firebase Database
        onValue(ref(database, 'users'), (snapshot) => {
            let users = [];

            // Iterar sobre cada snapshot hijo
            snapshot.forEach((childSnapshot) => {
                let user = childSnapshot.val();
                
                // Solo agregar usuarios que se registraron en las últimas 24 horas
                if ((new Date().getTime() - user.timestamp) < 86400000) {
                    users.push(user);
                }
            });

            // Resolver con un usuario aleatorio diferente al usuario actual
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

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos en la página de resultados
    if (window.location.pathname.endsWith('result.html')) {
        // Obtener el usuario actual del almacenamiento local
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        // Verificar si el usuario actual existe
        if (currentUser) {
            // Obtener un usuario aleatorio
            getRandomUser(currentUser).then(function(randomUser) {
                if (randomUser) {
                    // Mostrar la foto y el nombre del usuario aleatorio
                    document.getElementById('randomPhoto').src = randomUser.photo;
                    document.getElementById('randomUser').textContent = randomUser.name;
                } else {
                    document.getElementById('resultMessage').textContent = 'No hay usuarios suficientes para jugar.';
                }
            });
        } else {
            document.getElementById('resultMessage').textContent = 'No hay usuarios suficientes para jugar.';
        }

        // Configurar el contador de 24 horas
        let countdown = 86400;
        const countdownElement = document.getElementById('countdown');

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

        const countdownInterval = setInterval(updateCountdown, 1000);
    }

    // Funciones del carrusel
    let slideIndex = [1, 1, 1];
    const slideId = ["carousel1", "carousel2", "carousel3"];

    window.plusSlides = function(n, no) {
        showSlides(slideIndex[no] += n, no);
    };

    function showSlides(n, no) {
        let i;
        let x = document.getElementById(slideId[no]).getElementsByClassName("carousel-image");
        if (n > x.length) { slideIndex[no] = 1 }
        if (n < 1) { slideIndex[no] = x.length }
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }
        x[slideIndex[no] - 1].style.display = "block";
    }

    // Inicializar los carruseles
    showSlides(1, 0);
    showSlides(1, 1);
    showSlides(1, 2);
});
