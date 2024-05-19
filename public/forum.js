document.addEventListener('DOMContentLoaded', function() {
    fetch('/forum-categories')
        .then(response => response.json())
        .then(categories => {
            const categoriesList = document.querySelector('.forum-categories');
            categories.forEach(category => {
                const givenDate = new Date(category.CreatedDate);
                const timeAgo = calculateTime(givenDate);

                const categoryItem = document.createElement('li');
                categoryItem.classList.add('forum-category');
                categoryItem.dataset.categoryId = category.postId;

                categoryItem.innerHTML = `
                    <h2 class="category-title">${category.Title}</h2>
                    <p class="category-stats">
                        <span>${category.ThreadCount} Topics</span>
                        <span>${category.Replies} Replies </span>
                    </p>
                    <div class="latest-post">
                        <p>${timeAgo} by ${category.CreatorUsername}</p>
                        <p>Latest Thread by ${category.RecentThreadCreatorUsername}</p>
                    </div>
                    <div class="clear"></div>
                `;

                categoriesList.appendChild(categoryItem);
            });

            categoriesList.addEventListener('click', function(event) {
                const clickedCategory = event.target.closest('.forum-category');
                if (clickedCategory) {
                    const categoryId = clickedCategory.dataset.categoryId;
                    window.location.href = `/thread-details.html?categoryId=${categoryId}`;
                }
            });
        })
        .catch(error => console.error('Error fetching categories:', error));
});

function calculateTime(time) {
    const currentDate = new Date();
    const timeDifferenceMs = currentDate - time;
    const timeDifferenceSec = timeDifferenceMs / 1000;

    const daysAgo = Math.floor(timeDifferenceSec / 86400);
    const hoursAgo = Math.floor(timeDifferenceSec / 3600);
    const minutesAgo = Math.floor(timeDifferenceSec / 60);
    const secondsAgo = Math.floor(timeDifferenceSec);

    let timeAgo;

    if (daysAgo > 7) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        timeAgo = time.toLocaleDateString(undefined, options);
    } else if (daysAgo > 0) {
        timeAgo = daysAgo + (daysAgo === 1 ? " day ago" : " days ago");
    } else if (hoursAgo > 0) {
        timeAgo = hoursAgo + (hoursAgo === 1 ? " hour ago" : " hours ago");
    } else if (minutesAgo > 0) {
        timeAgo = minutesAgo + (minutesAgo === 1 ? " minute ago" : " minutes ago");
    } else {
        timeAgo = secondsAgo + (secondsAgo === 1 ? " second ago" : " seconds ago");
    }
    return timeAgo;
}