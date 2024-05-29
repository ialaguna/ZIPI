import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_v3KtWPdISsc1ClCg6AD4Ja349N0AHk4",
    authDomain: "zipi-73ec9.firebaseapp.com",
    databaseURL: "https://zipi-73ec9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "zipi-73ec9",
    storageBucket: "zipi-73ec9.appspot.com",
    messagingSenderId: "265288167467",
    appId: "1:265288167467:web:4a4e7ef9ac376449807a6e"
   };

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

// Esperar a que el DOM esté completamente cargado antes de ejecutar el código
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    // Mensaje de depuración para verificar si el formulario existe en el DOM
    if (registerForm) {
        console.log("Formulario de registro encontrado.");
        
        // Añadir un event listener para manejar el evento 'submit' del formulario
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();  // Prevenir el comportamiento por defecto del formulario (recargar la página)

            // Obtener los valores del nombre de usuario y la foto del formulario
            let username = document.getElementById('username').value;
            let photo = document.getElementById('photo').files[0];

            // Verificar que el nombre de usuario y la foto estén presentes
            if (username && photo) {
                console.log('Nombre de usuario y foto presentes.');

                // Crear una referencia en Firebase Storage con un nombre único basado en la fecha y hora actual
                const storageReference = storageRef(storage, 'photos/' + Date.now() + '_' + photo.name);

                // Subir la foto a Firebase Storage
                uploadBytes(storageReference, photo).then((snapshot) => {
                    console.log('Foto subida a Firebase Storage');

                    // Obtener la URL de descarga de la foto subida
                    getDownloadURL(snapshot.ref).then((downloadURL) => {
                        // Crear un objeto de usuario con el nombre, la URL de la foto y la marca de tiempo
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
    } else {
        console.log("Formulario de registro no encontrado en el DOM.");
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
