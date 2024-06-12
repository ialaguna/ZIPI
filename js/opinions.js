// Importar las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove, query, orderByChild } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM completamente cargado y analizado");

    // Manejo de opiniones
    const opinionForm = document.getElementById('opinionForm');
    if (opinionForm) {
        opinionForm.addEventListener('submit', function(event) {
            event.preventDefault();

            let username = document.getElementById('opinionUsername').value;
            let rating = document.querySelector('input[name="rating"]:checked').value;
            let review = document.getElementById('review').value;

            if (username && rating && review) {
                let opinion = {
                    username: username,
                    rating: rating,
                    review: review,
                    timestamp: new Date().getTime()
                };

                push(ref(database, 'opinions'), opinion)
                    .then(() => {
                        console.log('Opinión guardada en Firebase');
                        loadOpinions();
                        opinionForm.reset();
                    })
                    .catch((error) => {
                        console.log('Error al guardar la opinión en Firebase:', error);
                    });
            } else {
                alert("Por favor, completa todos los campos antes de enviar tu opinión.");
            }
        });
    }

    function loadOpinions() {
        const opinionsList = document.getElementById('opinionsList');
        if (opinionsList) {
            opinionsList.innerHTML = '';

            const opinionsRef = ref(database, 'opinions');
            const opinionsQuery = query(opinionsRef, orderByChild('timestamp'));

            onValue(opinionsQuery, (snapshot) => {
                let opinions = [];
                snapshot.forEach((childSnapshot) => {
                    opinions.push(childSnapshot.val());
                });

                // Ordenar opiniones de más reciente a más antiguo
                opinions.sort((a, b) => b.timestamp - a.timestamp);

                opinions.forEach((opinion) => {
                    let opinionElement = document.createElement('div');
                    opinionElement.classList.add('opinion');
                    let date = new Date(opinion.timestamp).toLocaleDateString();
                    opinionElement.innerHTML = `
                        <h4>${opinion.username}</h4>
                        <div class="rating">${'★'.repeat(opinion.rating)}</div>
                        <p>${opinion.review}</p>
                        <div class="date">${date}</div>
                    `;
                    opinionsList.appendChild(opinionElement);
                });
            });
        } else {
            console.log("Elemento opinionsList no encontrado en el DOM.");
        }
    }

    loadOpinions();
});
 let rating = 0;

        function renderStars(rating) {
            let stars = '';
            for (let i = 1; i <= 5; i++) {
                stars += `<span class="star" data-value="${i}">${i <= rating ? '&#9733;' : '&#9734;'}</span>`;
            }
            return stars;
        }

        function updateRating(newRating) {
            rating = newRating;
            document.getElementById('star-rating').innerHTML = renderStars(rating);
            attachClickHandlers();
        }

        function attachClickHandlers() {
            const stars = document.querySelectorAll('.star');
            stars.forEach(star => {
                star.addEventListener('click', function() {
                    const value = parseInt(this.getAttribute('data-value'));
                    updateRating(value);
                });
            });
        }

        // Initial render
        document.getElementById('star-rating').innerHTML = renderStars(rating);
        attachClickHandlers();
