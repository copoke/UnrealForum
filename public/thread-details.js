document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = urlParams.get('categoryId');

    if (categoryId) {
        fetch(`/threads/${categoryId}`)
            .then(response => response.json())
            .then(threads => {
                const threadsContainer = document.querySelector('.threads');
                threadsContainer.innerHTML = ''; // Clear any existing content
                console.log(threads)

                threads.forEach(thread => {
                    const threadElement = document.createElement('div');
                    threadElement.classList.add('thread');

                    const threadPreview = thread.ThreadContent.length > 100 ? thread.ThreadContent.substring(0, 100) + '...' : thread.ThreadContent;
                    
                    threadElement.innerHTML = `
                        <h2>${thread.ThreadTitle}</h2>
                        <div class="thread-content-preview">${threadPreview}</div>
                        <p class="thread-info">Posted on ${new Date(thread.ThreadCreatedDate).toLocaleString()} by ${thread.ThreadCreatorUsername}</p>
                        <p class="thread-likes">Likes: ${thread.ThreadLikes}</p>
                        <p class="thread-comments">Comments: ${thread.CommentCount}</p>
                        <p class="thread-views">Views: ${thread.ThreadViews}</p>
                        <button class="show-more" data-thread-id="${thread.ThreadId}">Show More</button>
                    `;

                    threadElement.querySelector('.show-more').addEventListener('click', function(event) {
                        const button = event.target;
                        const threadId = button.dataset.threadId;

                        if (button.innerText === 'Show More') {
                            fetch(`/increment-views/${threadId}`, { method: 'POST' })
                                .then(response => response.json())
                                .then(result => {
                                    if (result.success) {
                                        fetch(`/thread/${threadId}`)
                                            .then(response => response.json())
                                            .then(fullThread => {
                                                const contentElement = threadElement.querySelector('.thread-content-preview');
                                                contentElement.innerText = fullThread.ThreadContent;
                                                button.innerText = 'Show Less';
                                                // Append comments
                                                const commentsContainer = document.createElement('div');
                                                commentsContainer.classList.add('comments');
                                                fullThread.comments.forEach(comment => {
                                                    const commentElement = document.createElement('div');
                                                    commentElement.classList.add('comment');
                                                    commentElement.innerHTML = `
                                                        <p>${comment.Content}</p>
                                                        <p>Posted by ${comment.Username} on ${new Date(comment.CreatedDate).toLocaleString()}</p>
                                                        <p>Likes: ${comment.Likes}</p>
                                                    `;
                                                    commentsContainer.appendChild(commentElement);
                                                });
                                                threadElement.appendChild(commentsContainer);
                                            });
                                    } else {
                                        console.error('Failed to increment views');
                                    }
                                })
                                .catch(error => console.error('Error incrementing views:', error));
                        } else {
                            // Show Less functionality
                            const contentElement = threadElement.querySelector('.thread-content-preview');
                            contentElement.innerText = threadPreview;
                            button.innerText = 'Show More';
                            // Remove comments
                            const commentsContainer = threadElement.querySelector('.comments');
                            if (commentsContainer) {
                                commentsContainer.remove();
                            }
                        }
                    });

                    threadsContainer.appendChild(threadElement);
                });
            })
            .catch(error => console.error('Error fetching thread details:', error));
    } else {
        document.querySelector('.threads').innerText = 'Category ID not provided.';
    }
});