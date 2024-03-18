document.addEventListener('DOMContentLoaded', function() {
    fetch('/forum-categories')
      .then(response => response.json())
      .then(categories => {
        const categoriesList = document.querySelector('.forum-categories');
        categories.forEach(category => {
          categoriesList.innerHTML += `
            <li class="forum-category">
              <h2 class="category-title">${category.title}</h2>
              <p class="category-stats">
                <span>${category.topics} Topics</span>
                <span>${category.replies} Replies</span>
              </p>
              <div class="latest-post">
                <p>${category.last_post}</p>
                <p>${category.last_post_date} by ${category.last_post_author}</p>
              </div>
              <div class="clear"></div>
            </li>
          `;
        });
      })
      .catch(error => console.error('Error fetching categories:', error));
  });