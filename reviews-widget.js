// reviews-widget.js

// Substitua 'SUA_API_KEY' pela sua chave de API válida.
const apiKey = 'AIzaSyDqsGQ9wm-ezyxJSvJ94OfO-4FIPAJwHGQ';
const placeId = 'ChIJWZVTMwZszpQReOuUbSztY4o';
const endpoint = `https://places.googleapis.com/v1/places/${placeId}?fields=reviews,photos&key=${apiKey}`;

async function fetchPlaceData() {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();

    // Agrupa as fotos por autor (nome normalizado)
    let photosByAuthor = {};
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach(photo => {
        if (photo.authorAttributions && photo.authorAttributions.length > 0) {
          let authorName = photo.authorAttributions[0].displayName || "";
          // Ignora fotos do "Day Imports"
          if (authorName.toLowerCase().includes("day imports")) return;
          let normAuthor = authorName.trim().toLowerCase();
          let photoRef = "";
          if (photo.name && photo.name.indexOf('/photos/') !== -1) {
            photoRef = photo.name.split('/photos/')[1];
          }
          if (photoRef) {
            const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=${apiKey}`;
            if (!photosByAuthor[normAuthor]) {
              photosByAuthor[normAuthor] = [];
            }
            photosByAuthor[normAuthor].push({
              url: photoUrl,
              author: authorName,
              authorPhoto: photo.authorAttributions[0].photoUri || ""
            });
          }
        }
      });
    }

    // Processa as avaliações (reviews)
    let reviewsHtml = '<div class="google-reviews">';
    if (data.reviews && data.reviews.length > 0) {
      data.reviews.forEach(review => {
        const authorName = (review.authorAttribution && review.authorAttribution.displayName)
                             ? review.authorAttribution.displayName
                             : 'Anônimo';
        const authorPhoto = (review.authorAttribution && review.authorAttribution.photoUri)
                             ? review.authorAttribution.photoUri
                             : '';
        // Gera 5 estrelas: preenchidas (full) e vazias (empty)
        const fullStars = Math.floor(review.rating);
        const emptyStars = 5 - fullStars;
        let starsHtml = '';
        for (let i = 0; i < fullStars; i++) {
          starsHtml += '<span class="star full">&#9733;</span>';
        }
        for (let i = 0; i < emptyStars; i++) {
          starsHtml += '<span class="star empty">&#9733;</span>';
        }
        const reviewText = (review.text && review.text.text) ? review.text.text : '';
        const reviewTime = review.relativePublishTimeDescription ? review.relativePublishTimeDescription : '';

        // Vincula as fotos do mesmo autor
        let reviewPhotosHtml = '';
        let normReviewAuthor = authorName.trim().toLowerCase();
        if (photosByAuthor[normReviewAuthor] && photosByAuthor[normReviewAuthor].length > 0) {
          reviewPhotosHtml = '<div class="review-photos">';
          photosByAuthor[normReviewAuthor].forEach(photoObj => {
            reviewPhotosHtml += `<img src="${photoObj.url}" alt="Foto do autor" class="review-photo">`;
          });
          reviewPhotosHtml += '</div>';
          // Remove as fotos vinculadas para que as restantes sejam tratadas como extra
          delete photosByAuthor[normReviewAuthor];
        }

        reviewsHtml += `
          <div class="review">
            <div class="review-header">
              ${authorPhoto ? `
                <div class="review-author-photo-container">
                  <img class="review-author-photo" src="${authorPhoto}" alt="${authorName}">
                </div>
              ` : ''}
              <span class="review-author-name">${authorName}</span>
              <span class="review-rating">${starsHtml} <span class="review-rating-value">${review.rating}</span></span>
            </div>
            <div class="review-body">
              <p class="review-text">${reviewText}</p>
              ${reviewPhotosHtml}
            </div>
            <div class="review-footer">
              <small class="review-date">${reviewTime}</small>
            </div>
          </div>
        `;
      });
    } else {
      reviewsHtml += '<p>Nenhuma avaliação encontrada.</p>';
    }
    reviewsHtml += '</div>';
    document.getElementById('reviews-container').innerHTML = reviewsHtml;

    // Exibe as fotos restantes (extra) que não estão vinculadas a nenhuma avaliação
    let extraPhotosHtml = '<div class="extra-photos"><h4>Mais fotos</h4><div class="google-photos">';
    let extraFound = false;
    for (const author in photosByAuthor) {
      if (photosByAuthor.hasOwnProperty(author)) {
        photosByAuthor[author].forEach(photoObj => {
          extraPhotosHtml += `
            <div class="photo-item">
              <img src="${photoObj.url}" alt="Foto extra" class="review-photo extra">
              <div class="photo-author">
                ${photoObj.authorPhoto ? `<img src="${photoObj.authorPhoto}" alt="${photoObj.author}" class="photo-author-img">` : ''}
                <span class="photo-author-name">${photoObj.author}</span>
              </div>
            </div>
          `;
          extraFound = true;
        });
      }
    }
    extraPhotosHtml += '</div></div>';
    document.getElementById('extra-photos-container').innerHTML = extraFound ? extraPhotosHtml : '';
    
  } catch (error) {
    console.error('Erro ao buscar os dados do local:', error);
    document.getElementById('reviews-container').innerHTML = '<p>Erro ao carregar as avaliações.</p>';
    document.getElementById('extra-photos-container').innerHTML = '<p>Erro ao carregar as fotos.</p>';
  }
}

window.addEventListener('load', fetchPlaceData);