// Importar las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Configurar Firebase con los parámetros del proyecto
const firebaseConfig = {
    apiKey: "AIzaSyA_v3KtWPdISsc1ClCg6AD4Ja349N0AHk4",
    authDomain: "zipi-73ec9.firebaseapp.com",
    databaseURL: "https://zipi-73ec9-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "zipi-73ec9",
    storageBucket: "zipi-73ec9.appspot.com",
    messagingSenderId: "265288167467",
    appId: "1:265288167467:web:4a4e7ef9ac376449807a6e"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

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
