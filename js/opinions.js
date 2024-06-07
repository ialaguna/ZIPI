// Importar las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, onValue, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

            onValue(ref(database, 'opinions'), (snapshot) => {
                snapshot.forEach((childSnapshot) => {
                    let opinion = childSnapshot.val();
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
document.addEventListener('DOMContentLoaded', function() {
    loadOpinions();
});

function loadOpinions() {
    const opinionsList = document.getElementById('opinionsList');
    opinionsList.innerHTML = ''; // Limpiar el contenido existente

    // Suponiendo que tienes un array de opiniones
    let opinions = getOpinionsFromStorageOrAPI();

    // Ordenar opiniones por fecha de más reciente a más antigua
    opinions.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Renderizar opiniones
    opinions.forEach(opinion => {
        const opinionElement = document.createElement('div');
        opinionElement.classList.add('opinion');
        
        opinionElement.innerHTML = `
            <h4>${opinion.username}</h4>
            <div class="rating">${renderStars(opinion.rating)}</div>
            <p>${opinion.review}</p>
            <div class="date">${new Date(opinion.date).toLocaleDateString()}</div>
        `;
        
        opinionsList.appendChild(opinionElement);
    });
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star">${i <= rating ? '&#9733;' : '&#9734;'}</span>`;
    }
    return stars;
}

// Ejemplo de función para obtener opiniones, reemplazar con la fuente de datos real
function getOpinionsFromStorageOrAPI() {
    return [
        { username: 'User1', rating: 5, review: 'Great product!', date: '2024-01-01' },
        { username: 'User2', rating: 4, review: 'Very good.', date: '2024-01-02' },
        // más opiniones...
    ];
}

