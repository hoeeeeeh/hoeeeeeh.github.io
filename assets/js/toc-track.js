// Get all the elements that you want to track
const trackedElements = document.querySelectorAll('.toc-title');

// Listen to the scroll event on the window object
window.addEventListener('scroll', () => {
  const scrollPosition = window.scrollY;

  // Iterate through each tracked element
  for (let i = 0; i < trackedElements.length; i++) {
    const element = trackedElements[i];

    // Get the top and bottom positions of the element
    const elementTop = element.offsetTop;
    const elementBottom = element.offsetTop + element.offsetHeight;

    // Check if the scroll position is within the element's boundaries
    if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
      console.log(`The scroll bar is currently on element ${i + 1}`);
      // Do something with the tracked element that the scroll bar is currently on
    }
  }
});