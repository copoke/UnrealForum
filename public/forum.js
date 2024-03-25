document.addEventListener('DOMContentLoaded', function() {
    fetch('/forum-categories')
      .then(response => response.json())
      .then(categories => {
        categories.forEach(category => {
          const categoriesList = document.querySelector('.forum-categories');
          const givenDate = new Date(category.CreatedDate);
          const currentDate = new Date();
          const timeDifferenceMs = currentDate - givenDate;
          const timeDifferenceSec = timeDifferenceMs / 1000;
  
          const daysAgo = Math.floor(timeDifferenceSec / 86400);
          const hoursAgo = Math.floor(timeDifferenceSec / 3600);
          const minutesAgo = Math.floor(timeDifferenceSec / 60);
          const secondsAgo = Math.floor(timeDifferenceSec);
  
          let timeAgo;

          if (daysAgo > 0) {
            timeAgo = daysAgo + (daysAgo === 1 ? " day ago" : " days ago");
          } else if (hoursAgo > 0) {
            timeAgo = hoursAgo + (hoursAgo === 1 ? " hour ago" : " hours ago");
          } else if (minutesAgo > 0) {
            timeAgo = minutesAgo + (minutesAgo === 1 ? " minute ago" : " minutes ago");
          } else {
            timeAgo = secondsAgo + (secondsAgo === 1 ? " second ago" : " seconds ago");
          }
          categoriesList.innerHTML += `
            <li class="forum-category">
              <h2 class="category-title">${category.title}</h2>
              <p class="category-stats">
                <span>${category.topics} Topics</span>
                <span>${category.Replies} Replies</span>
              </p>
              <div class="latest-post">
                <p>Created ${timeAgo}</p>
                <p>${category.last_post_date} by ${category.last_post_author}</p>
              </div>
              <div class="clear"></div>
            </li>
          `;
        });
      })
      .catch(error => console.error('Error fetching categories:', error));
  });