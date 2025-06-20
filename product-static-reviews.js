async function loadNsStaticReviews() {
  const response = await fetch('https://lnonato.github.io/reviews-widget/reviews.json');
  const data = await response.json();

  const container = document.getElementById('ns-product-static-reviews');

  if (data.reviews && data.reviews.length > 0) {
    let html = '';

    data.reviews.forEach(review => {
      let starsHtml = '';
      for (let i = 0; i < 5; i++) {
        starsHtml += `<span class="${i < review.rating ? 'filled' : ''}">★</span>`;
      }

      html += `
        <div class="ns-review-card">
          <div class="ns-review-author">
            <img src="${review.photo}" alt="${review.name}" class="ns-author-photo">
            <span class="ns-author-name">${review.name}</span>
          </div>
          <div class="ns-review-stars">${starsHtml}</div>
          <div class="ns-review-text">${review.text}</div>
          ${review.image ? `<img src="${review.image}" alt="Foto da avaliação" class="ns-review-image">` : ''}
        </div>
      `;
    });

    container.innerHTML = html;
  } else {
    container.innerHTML = '<p>Nenhuma avaliação disponível.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadNsStaticReviews);
