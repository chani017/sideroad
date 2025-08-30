// Map and choice functionality
document.addEventListener('DOMContentLoaded', function() {
    const generateDot1 = document.getElementById('generateDot1');
    const dotCanvas = document.getElementById('dotCanvas');
    const doorImage = document.querySelector('.door-closed-svg');
    const initialButtonContainer = document.getElementById('initialButtonContainer');
    const choiceButtonContainer = document.getElementById('choiceButtonContainer');
    const goUsualWay = document.getElementById('goUsualWay');
    const goNewWay = document.getElementById('goNewWay');
    
    let circles = []; // Array to store all circles
    let gridSections = []; // Array to store available grid sections
    let isDoorOpen = false; // Track door state
    let hasExitedDoor = false; // Track if user has exited the door
    
    // Grid system variables
    const GRID_COLS = 3;
    const GRID_ROWS = 3;
    const TOTAL_SECTIONS = GRID_COLS * GRID_ROWS;
    
    // Function to toggle door image
    function toggleDoorImage() {
        if (isDoorOpen) {
            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg";
            isDoorOpen = false;
            console.log('Door closed');
        } else {
            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
            isDoorOpen = true;
            console.log('Door opened');
        }
    }
    
    // Function to transition from door to way image
    function transitionToWay() {
        if (!hasExitedDoor) {
            hasExitedDoor = true;
            
            // First change to door_opened.svg
            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
            
            // Wait a moment then start fade out
            setTimeout(() => {
                // Fade out door image and button
                doorImage.style.transition = 'opacity 1s ease-out';
                doorImage.style.opacity = '0';
                initialButtonContainer.style.transition = 'opacity 1s ease-out';
                initialButtonContainer.style.opacity = '0';
                
                setTimeout(() => {
                    // Change to way image
                    doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/way.svg";
                    doorImage.style.opacity = '1';
                    
                    // Hide initial button, show choice buttons
                    initialButtonContainer.style.display = 'none';
                    choiceButtonContainer.style.display = 'flex';
                    choiceButtonContainer.style.opacity = '0';
                    
                    // Fade in choice buttons
                    setTimeout(() => {
                        choiceButtonContainer.style.transition = 'opacity 1s ease-in';
                        choiceButtonContainer.style.opacity = '1';
                    }, 100);
                    
                    console.log('Transitioned to way image and choice buttons');
                }, 1000);
            }, 500);
        }
    }
    
    // Function to initialize grid sections
    function initializeGridSections() {
        gridSections = [];
        for (let i = 0; i < TOTAL_SECTIONS; i++) {
            gridSections.push(i);
        }
        console.log('Grid sections initialized:', gridSections);
    }
    
    // Function to get random position within a grid section
    function getRandomPositionInGridSection(sectionIndex) {
        const mapSection = document.querySelector('.map-section');
        const mapRect = mapSection.getBoundingClientRect();
        
        // Calculate grid section boundaries
        const sectionWidth = mapRect.width / GRID_COLS;
        const sectionHeight = mapRect.height / GRID_ROWS;
        
        // Calculate section position
        const col = sectionIndex % GRID_COLS;
        const row = Math.floor(sectionIndex / GRID_ROWS);
        
        // Calculate section boundaries
        const startX = col * sectionWidth;
        const endX = startX + sectionWidth;
        const startY = row * sectionHeight;
        const endY = startY + sectionHeight;
        
        // Generate random position within section with safe margins
        const circleSize = 13.33;
        const margin = Math.max(20, circleSize / 2 + 10);
        
        // Calculate safe boundaries for circle placement
        const safeStartX = startX + margin;
        const safeEndX = endX - margin - circleSize;
        const safeStartY = startY + margin;
        const safeEndY = endY - margin - circleSize;
        
        // Ensure we have enough space for the circle
        if (safeEndX <= safeStartX || safeEndY <= safeStartY) {
            console.log(`Grid section ${sectionIndex} too small for circle placement`);
            return null;
        }
        
        const randomX = safeStartX + Math.random() * (safeEndX - safeStartX);
        const randomY = safeStartY + Math.random() * (safeEndY - safeStartY);
        
        return { x: randomX, y: randomY };
    }
    
    // Function to generate a random circle
    function generateRandomCircle() {
        // Get map section dimensions
        const mapSection = document.querySelector('.map-section');
        const mapRect = mapSection.getBoundingClientRect();
        
        // Circle size: 10pt = 13.33px (1pt = 1.33px)
        const circleSize = 13.33;
        
        let randomX, randomY;
        
        // If this is the first circle, place it below home_svg
        if (circles.length === 0) {
            const homeSvg = document.querySelector('.home-svg');
            const homeRect = homeSvg.getBoundingClientRect();
            
            // Calculate position below home_svg (center horizontally, below vertically)
            randomX = homeRect.left - mapRect.left + (homeRect.width / 2) - (circleSize / 2);
            randomY = homeRect.bottom - mapRect.top + 20; // 20px below home_svg
            
            console.log('First circle placed below home_svg at fixed position');
        } else {
            // For subsequent circles, use grid system
            if (gridSections.length === 0) {
                console.log('All grid sections are filled!');
                return null;
            }
            
            // Randomly select a grid section
            const randomSectionIndex = Math.floor(Math.random() * gridSections.length);
            const selectedSection = gridSections[randomSectionIndex];
            
            // Remove the selected section from available sections
            gridSections.splice(randomSectionIndex, 1);
            
            // Get random position within the selected grid section
            const position = getRandomPositionInGridSection(selectedSection);
            
            // If position is null, section was too small, try another section
            if (!position) {
                console.log(`Section ${selectedSection} too small, trying another section...`);
                // Put the section back and try another
                gridSections.push(selectedSection);
                if (gridSections.length > 0) {
                    return generateRandomCircle(); // Try again with remaining sections
                } else {
                    console.log('No more sections available');
                    return null;
                }
            }
            
            randomX = position.x;
            randomY = position.y;
            
            console.log(`Circle generated in grid section ${selectedSection} at random position`);
        }
        
        // Create circle element
        const circle = document.createElement('div');
        circle.className = 'random-circle';
        circle.style.left = randomX + 'px';
        circle.style.top = randomY + 'px';
        circle.style.zIndex = '1';
        
        // Add to canvas
        dotCanvas.appendChild(circle);
        
        // Add to circles array
        circles.push(circle);
        
        console.log(`Circle generated at position (${randomX}, ${randomY}) in map section`);
        
        // Draw connecting line if there's a previous circle
        if (circles.length > 1) {
            drawConnectingLine(circles[circles.length - 2], circle);
        }
        
        // Remove automatic circular connection when 6th circle is created
        // Now user needs to click button again to create circular connection
        
        return circle;
    }
    
    // Function to draw connecting line between two circles
    function drawConnectingLine(prevCircle, newCircle) {
        // Get positions of both circles
        const prevRect = prevCircle.getBoundingClientRect();
        const newRect = newCircle.getBoundingClientRect();
        
        // Calculate centers
        const circleSize = 13.33;
        const prevCenterX = prevRect.left + circleSize / 2;
        const prevCenterY = prevRect.top + circleSize / 2;
        const newCenterX = newRect.left + circleSize / 2;
        const newCenterY = newRect.top + circleSize / 2;
        
        // Calculate distance and angle
        const distance = Math.sqrt(Math.pow(newCenterX - prevCenterX, 2) + Math.pow(newCenterY - prevCenterY, 2));
        const angle = Math.atan2(newCenterY - prevCenterY, newCenterX - prevCenterX) * 180 / Math.PI;
        
        // Create line element
        const line = document.createElement('div');
        line.className = 'connecting-line';
        line.style.zIndex = '1';
        
        // Set line properties for precise connection
        line.style.setProperty('--line-width', distance + 'px');
        
        // Position the line at the previous circle center (start point)
        line.style.left = prevCenterX + 'px';
        line.style.top = prevCenterY + 'px';
        line.style.transform = `rotate(${angle}deg)`;
        
        // Add line to canvas
        dotCanvas.appendChild(line);
        
        // Trigger animation by adding animation class
        setTimeout(() => {
            line.classList.add('animate-line');
        }, 10);
        
        console.log('Connecting line added between circles with animation');
    }
    
    // Function to create circular connection from last circle to first circle
    function createCircularConnection() {
        if (circles.length < 6) {
            console.log('Need 6 circles to create circular connection');
            return;
        }
        
        const firstCircle = circles[0];
        const lastCircle = circles[5]; // 6th circle
        
        // Get positions of first and last circles
        const firstRect = firstCircle.getBoundingClientRect();
        const lastRect = lastCircle.getBoundingClientRect();
        
        // Calculate centers
        const circleSize = 13.33;
        const firstCenterX = firstRect.left + circleSize / 2;
        const firstCenterY = firstRect.top + circleSize / 2;
        const lastCenterX = lastRect.left + circleSize / 2;
        const lastCenterY = lastRect.top + circleSize / 2;
        
        // Calculate distance and angle FROM last circle TO first circle
        const distance = Math.sqrt(Math.pow(firstCenterX - lastCenterX, 2) + Math.pow(firstCenterY - lastCenterY, 2));
        const angle = Math.atan2(firstCenterY - lastCenterY, firstCenterX - lastCenterX) * 180 / Math.PI;
        
        // Create circular line element
        const circularLine = document.createElement('div');
        circularLine.className = 'connecting-line circular-line';
        circularLine.style.zIndex = '1';
        
        // Set line properties for precise connection
        circularLine.style.setProperty('--line-width', distance + 'px');
        
        // Position the line at the last circle center (start point)
        circularLine.style.left = lastCenterX + 'px';
        circularLine.style.top = lastCenterY + 'px';
        circularLine.style.transform = `rotate(${angle}deg)`;
        
        // Add circular line to canvas
        dotCanvas.appendChild(circularLine);
        
        // Trigger animation by adding animation class
        setTimeout(() => {
            circularLine.classList.add('animate-line');
        }, 10);
        
        console.log('Circular connection created from 6th circle to 1st circle');
    }
    
    // Event listener for button
    generateDot1.addEventListener('click', function() {
        // If this is the first click, transition to way image
        if (!hasExitedDoor) {
            transitionToWay();
            return;
        }
        
        // If we have 6 circles, create circular connection instead of new circle
        if (circles.length === 6) {
            createCircularConnection();
            // Add button click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            return;
        }
        
        generateRandomCircle();
        // Add button click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Event listeners for choice buttons
    goUsualWay.addEventListener('click', function() {
        console.log('User chose to go the usual way');
        // Add button click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    goNewWay.addEventListener('click', function() {
        console.log('User chose to go the new way');
        // Add button click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
    
    // Handle window resize to ensure circles stay within map section
    window.addEventListener('resize', function() {
        // Remove all existing circles and lines when window is resized
        const existingCircles = dotCanvas.querySelectorAll('.random-circle');
        const existingLines = dotCanvas.querySelectorAll('.connecting-line');
        
        existingCircles.forEach(circle => {
            circle.remove();
        });
        
        existingLines.forEach(line => {
            line.remove();
        });
        
        // Clear circles array
        circles = [];
        
        // Reinitialize grid sections
        initializeGridSections();
        
        console.log('Circles and lines cleared on resize, grid sections reinitialized');
    });
    
    // Initialize grid sections
    initializeGridSections();
    
    console.log('Map and choice layout initialized with 3x3 grid system and circular connection');
});
