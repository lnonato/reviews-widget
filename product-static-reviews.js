// product-static-reviews.js (ATUALIZADO)

async function loadStaticReviews() {
  const reviewsJsonUrl = window.reviewConfig.reviewsJson;

  const response = await fetch(reviewsJsonUrl);
  const data = await response.json();

  const container = document.getElementById('product-static-reviews');

  if (data.reviews && data.reviews.length > 0) {
    let html = '';

    data.reviews.forEach(review => {
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        starsHtml += `<span class="static-review-star ${i < review.rating ? 'filled' : 'empty'}">&#9733;</span>`;
      }

      html += `
        <div class="static-review-item">
          <div class="static-review-author">
            <img src="${review.photo}" alt="${review.name}" class="static-review-photo">
            <span class="static-review-name">${review.name}</span>
          </div>
          <div class="static-review-rating">${starsHtml}</div>
          <div class="static-review-text">${review.text}</div>
          ${review.image ? `<img src="${review.image}" alt="Imagem da Avaliação" class="review-image">` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  } else {
    container.innerHTML = '<p>Nenhuma avaliação disponível.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadStaticReviews);
