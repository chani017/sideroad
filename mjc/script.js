// Double Click Prevention Utility
let isProcessing = false;

function preventDoubleClick(button, callback, duration = 1000) {
    return async function() {
        // 이미 처리 중이면 무시
        if (isProcessing || button.disabled || button.classList.contains('processing')) {
            console.log('Double click prevented');
            return;
        }
        
        // 처리 시작
        isProcessing = true;
        button.disabled = true;
        button.classList.add('processing');
        
        try {
            // 콜백 함수 실행
            await callback.call(this);
        } catch (error) {
            console.error('Button callback error:', error);
        } finally {
            // 지정된 시간 후 다시 활성화
            setTimeout(() => {
                isProcessing = false;
                button.disabled = false;
                button.classList.remove('processing');
            }, duration);
        }
    };
}

// Enhanced button click handler
function createSafeButton(button, callback, duration = 500) {
    const safeCallback = preventDoubleClick(button, callback, duration);
    button.addEventListener('click', safeCallback);
}

// Splash Screen Logic
window.addEventListener('load', function() {
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    let canClick = false;
    
    // Enable clicking after all animations are complete
    setTimeout(() => {
        canClick = true;
        splashScreen.style.cursor = 'pointer';
    }, 2600); // 1s title + 1.6s delay for last animation to start
    
    // Add click event listener to splash screen
    splashScreen.addEventListener('click', function() {
        if (canClick) {
            splashScreen.classList.add('fade-out');
            
            // After fade out completes (1s), show main content and remove splash
            setTimeout(() => {
                splashScreen.style.display = 'none';
                mainContent.classList.add('show');
            }, 1000);
        }
    });
});

// Map and choice functionality
document.addEventListener('DOMContentLoaded', function() {
    const generateDot1 = document.getElementById('generateDot1');
    const dotCanvas = document.getElementById('dotCanvas');
    const doorImage = document.querySelector('.door-closed-svg');
    const initialButtonContainer = document.getElementById('initialButtonContainer');
    const choiceSection = document.getElementById('choiceSection');
    
    // Dynamic elements that will be created
    let choiceButtonContainer = null;
    let goUsualWay = null;
    let goNewWay = null;
    
    let circles = []; // Array to store all circles
    let gridSections = []; // Array to store available grid sections
    let isDoorOpen = false; // Track door state
    let hasStartedGenerating = false; // Track if circle generation has started
    
    // Grid system variables
    const GRID_COLS = 3;
    const GRID_ROWS = 3;
    const TOTAL_SECTIONS = GRID_COLS * GRID_ROWS;
    
    // Helper function to change image with fade effect
    function changeImageWithFade(newImageSrc, duration = 300) {
        return new Promise((resolve) => {
            doorImage.style.transition = `opacity ${duration}ms ease-in-out`;
            doorImage.style.opacity = '0';
            
            setTimeout(() => {
                doorImage.src = newImageSrc;
                doorImage.style.opacity = '1';
                setTimeout(resolve, duration);
            }, duration);
        });
    }
    
    // Helper function to change text with fade effect
    function changeTextWithFade(element, newText, duration = 300) {
        return new Promise((resolve) => {
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.innerHTML = newText;
                element.style.opacity = '1';
                setTimeout(resolve, duration);
            }, duration);
        });
    }
    
    // Helper function to hide/show elements with fade effect
    function fadeElement(element, show, duration = 300) {
        return new Promise((resolve) => {
            element.style.transition = `opacity ${duration}ms ease-in-out`;
            element.style.opacity = show ? '1' : '0';
            
            if (!show) {
                setTimeout(() => {
                    element.style.display = 'none';
                    resolve();
                }, duration);
            } else {
                element.style.display = 'flex';
                setTimeout(resolve, duration);
            }
        });
    }

    // Function to toggle door image
    function toggleDoorImage() {
        if (isDoorOpen) {
            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg");
            isDoorOpen = false;
            console.log('Door closed');
        } else {
            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg");
            isDoorOpen = true;
            console.log('Door opened');
        }
    }
    
    // Function to transition from door to way image
    function transitionToWay() {
        if (!hasStartedGenerating) {
            hasStartedGenerating = true;
            
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
                    
                    // Show way title
                    const wayTitle = document.getElementById('wayTitle');
                    wayTitle.style.display = 'block';
                    wayTitle.style.opacity = '0';
                    wayTitle.style.transition = 'opacity 1s ease-in';
                    
                    setTimeout(() => {
                        wayTitle.style.opacity = '1';
                    }, 100);
                    
                    // Hide initial button
                    initialButtonContainer.style.display = 'none';
                    
                    // Create choice button container dynamically
                    choiceButtonContainer = document.createElement('div');
                    choiceButtonContainer.className = 'button-container';
                    choiceButtonContainer.id = 'choiceButtonContainer';
                    choiceButtonContainer.style.display = 'flex';
                    choiceButtonContainer.style.flexDirection = 'column';
                    choiceButtonContainer.style.gap = '15px';
                    choiceButtonContainer.style.alignItems = 'center';
                    choiceButtonContainer.style.marginTop = '20px';
                    choiceButtonContainer.style.opacity = '0';
                    
                    // Create choice buttons
                    goUsualWay = document.createElement('button');
                    goUsualWay.id = 'goUsualWay';
                    goUsualWay.className = 'dot-btn';
                    goUsualWay.textContent = '← 늘 가던 길로 간다.';
                    
                    goNewWay = document.createElement('button');
                    goNewWay.id = 'goNewWay';
                    goNewWay.className = 'dot-btn';
                    goNewWay.textContent = '→ 새로운 길로 간다.';
                    
                    // Add event listeners to the dynamically created buttons
                    goUsualWay.addEventListener('click', goUsualWayHandler);
                    goNewWay.addEventListener('click', goNewWayHandler);
                    
                    // Add buttons to container
                    choiceButtonContainer.appendChild(goUsualWay);
                    choiceButtonContainer.appendChild(goNewWay);
                    
                    // Add container to choice section
                    choiceSection.appendChild(choiceButtonContainer);
                    
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
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Circle size: 15px
        const circleSize = 15;
        
        let randomX, randomY;
        
        // If this is the first circle, place it below home_svg
        if (circles.length === 0) {
            const homeSvg = document.querySelector('.home-svg');
            const homeRect = homeSvg.getBoundingClientRect();
            
            // Calculate position below home_svg (center horizontally, below vertically)
            randomX = homeRect.left + (homeRect.width / 2) - (circleSize / 2);
            randomY = homeRect.bottom + 20; // 20px below home_svg
            
            console.log('First circle placed below home_svg at fixed position');
        } else {
            // For subsequent circles, use random position within viewport
            // Ensure circle is fully visible within viewport
            const margin = circleSize / 2;
            randomX = margin + Math.random() * (viewportWidth - circleSize - margin * 2);
            randomY = margin + Math.random() * (viewportHeight - circleSize - margin * 2);
            
            console.log(`Circle generated at random position (${randomX}, ${randomY})`);
        }
        
        // Create circle element
        const circle = document.createElement('div');
        circle.className = 'random-circle';
        circle.style.left = randomX + 'px';
        circle.style.top = randomY + 'px';
        circle.style.width = circleSize + 'px';
        circle.style.height = circleSize + 'px';
        circle.style.zIndex = '1';
        
        // Add to document body (not just map section)
        document.body.appendChild(circle);
        
        // Add to circles array
        circles.push(circle);
        
        console.log(`Circle generated at position (${randomX}, ${randomY})`);
        
        // Draw connecting line based on state
        if (circles.length > 1) {
            // Always connect from previous circle to new circle (sequential connection)
            drawConnectingLine(circles[circles.length - 2], circle);
        }
        
        return circle;
    }
    
    // Function to draw connecting line between circles
    function drawConnectingLine(fromCircle, toCircle) {
        // Get positions of both circles
        const fromRect = fromCircle.getBoundingClientRect();
        const toRect = toCircle.getBoundingClientRect();
        
        // Calculate center points
        const fromX = fromRect.left + fromRect.width / 2;
        const fromY = fromRect.top + fromRect.height / 2;
        const toX = toRect.left + toRect.width / 2;
        const toY = toRect.top + toRect.height / 2;
        
        // Create SVG line element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '0';
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromX);
        line.setAttribute('y1', fromY);
        line.setAttribute('x2', toX);
        line.setAttribute('y2', toY);
        line.setAttribute('stroke', '#000000');
        line.setAttribute('stroke-width', '3'); // 8px line width
        line.setAttribute('stroke-linecap', 'round');
        
        // Calculate line length for dash animation
        const lineLength = Math.sqrt(Math.pow(toX - fromX, 2) + Math.pow(toY - fromY, 2));
        
        // Set up dash animation - line starts invisible and draws slowly
        line.setAttribute('stroke-dasharray', lineLength);
        line.setAttribute('stroke-dashoffset', lineLength);
        
        svg.appendChild(line);
        document.body.appendChild(svg);
        
        // Animate the line drawing with CSS transition
        line.style.transition = 'stroke-dashoffset 2s ease-in-out';
        
        setTimeout(() => {
            line.setAttribute('stroke-dashoffset', '0');
        }, 100);
        
        // Generate background circles when line is drawn
        generateBackgroundCircles();
        
        console.log(`Connecting line drawn from (${fromX}, ${fromY}) to (${toX}, ${toY})`);
        }
    
    // Function to generate background circles when lines are drawn
    function generateBackgroundCircles() {
        // Calculate number of background circles based on current line count
        // Each line generates circles, with increasing density
        const lineCount = circles.length - 1; // Number of lines = circles - 1
        const baseCircleCount = 3; // Base number of circles per line
        const multiplier = Math.min(lineCount * 0.5, 3); // Increase density up to 3x
        const circleCount = Math.floor(baseCircleCount * (1 + multiplier));
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const circleSize = 15; // Same size as main circles
        
        for (let i = 0; i < circleCount; i++) {
            // Create random position ensuring even distribution
            const margin = circleSize / 2;
            const randomX = margin + Math.random() * (viewportWidth - circleSize - margin * 2);
            const randomY = margin + Math.random() * (viewportHeight - circleSize - margin * 2);
            
            // Create background circle element exactly same as main circles
            const bgCircle = document.createElement('div');
            bgCircle.className = 'background-circle';
            bgCircle.style.position = 'absolute';
            bgCircle.style.left = randomX + 'px';
            bgCircle.style.top = randomY + 'px';
            bgCircle.style.width = circleSize + 'px';
            bgCircle.style.height = circleSize + 'px';
            bgCircle.style.backgroundColor = '#ffffff'; // Same white background as main circles
            bgCircle.style.border = '3px solid #000000'; // Same black border as main circles
            bgCircle.style.borderRadius = '50%';
            bgCircle.style.zIndex = '0'; // Behind main circles
            bgCircle.style.pointerEvents = 'none';
            
            // Add fade in animation
            bgCircle.style.transition = 'opacity 0.5s ease-in-out';
            bgCircle.style.opacity = '0';
            
            // Add to document body
            document.body.appendChild(bgCircle);
            
            // Fade in with random delay for staggered effect
            setTimeout(() => {
                bgCircle.style.opacity = '1';
            }, Math.random() * 1000 + 200);
        }
        
        console.log(`Generated ${circleCount} background circles (line count: ${lineCount})`);
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
        
    // Event listener for button with double-click prevention
    createSafeButton(generateDot1, function() {
        
        // Always generate a circle first
        generateRandomCircle();
        
        // If this is the first click, also transition to way image
        if (!hasStartedGenerating) {
            transitionToWay();
        }
        
        // Add button click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
        
    }, 1000); // 1 second cooldown for double-click prevention
    
    // Event handler functions for choice buttons
    async function goUsualWayHandler() {
        console.log('User chose to go the usual way');
        
        const wayTitle = document.getElementById('wayTitle');
        
        // Generate circle and connecting line first
        generateRandomCircle();
        
        // Apply fade effects
        await Promise.all([
            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/construction.svg"),
            changeTextWithFade(wayTitle, "늘 가던 길로 들어갔는데 공사중이었다.<br>새로운 길로 다시 찾아보자."),
            fadeElement(choiceButtonContainer, false)
        ]);
        
        // Create new choice button container
        const newChoiceContainer = document.createElement('div');
        newChoiceContainer.className = 'button-container';
        newChoiceContainer.id = 'newChoiceButtonContainer';
        newChoiceContainer.style.display = 'flex';
        newChoiceContainer.style.flexDirection = 'column';
        newChoiceContainer.style.gap = '15px';
        newChoiceContainer.style.alignItems = 'center';
        newChoiceContainer.style.marginTop = '20px';
        
        // Create first new choice button
        const newWay1Button = document.createElement('button');
        newWay1Button.id = 'goNewWay1';
        newWay1Button.className = 'dot-btn';
        newWay1Button.textContent = '돌과 풀이 많은 비포장길로 가자';
        
        // Create second new choice button
        const newWay2Button = document.createElement('button');
        newWay2Button.id = 'goNewWay2';
        newWay2Button.className = 'dot-btn';
        newWay2Button.textContent = '정돈되고 사람 많은 곳으로 가자';
        
        // Add click events for new buttons
        newWay1Button.addEventListener('click', async function() {
            console.log('User chose the unpaved road with stones and grass');
            
            const wayTitle = document.getElementById('wayTitle');
            const currentContainer = document.getElementById('newChoiceButtonContainer');
            
            // Add button click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Apply fade effects with consistent timing
            const fadeDuration = 500;
            await Promise.all([
                changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/alert.svg", fadeDuration),
                changeTextWithFade(wayTitle, "가다보니 내가 길을 잃었다. 도움을 요청할까?", fadeDuration),
                currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
            ]);
            
            // Create new choice button container for lost options
            const lostChoiceContainer = document.createElement('div');
            lostChoiceContainer.className = 'button-container';
            lostChoiceContainer.id = 'lostChoiceButtonContainer';
            lostChoiceContainer.style.display = 'flex';
            lostChoiceContainer.style.flexDirection = 'column';
            lostChoiceContainer.style.gap = '15px';
            lostChoiceContainer.style.alignItems = 'center';
            lostChoiceContainer.style.marginTop = '20px';
            
            // Create first choice button - use map app
            const useMapButton = document.createElement('button');
            useMapButton.id = 'useMap';
            useMapButton.className = 'dot-btn';
            useMapButton.textContent = '지도 앱을 켜고 혼자 간다.';
            
            // Create second choice button - ask for directions
            const askDirectionsButton = document.createElement('button');
            askDirectionsButton.id = 'askDirections';
            askDirectionsButton.className = 'dot-btn';
            askDirectionsButton.textContent = '가는 사람을 붙잡고 길을 물어본다.';
            
            // Add click events for lost choice buttons
            useMapButton.addEventListener('click', async function() {
                console.log('User chose to use map app');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('lostChoiceButtonContainer');
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Apply fade effects with consistent timing
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/warning.svg", fadeDuration),
                    changeTextWithFade(wayTitle, "앗! 지도 앱이 이상한 곳을 알려줘서 결국 집에 늦게 도착했다.", fadeDuration),
                    currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                ]);
                
                // Create new choice button container for tired option
                const tiredChoiceContainer = document.createElement('div');
                tiredChoiceContainer.className = 'button-container';
                tiredChoiceContainer.id = 'tiredChoiceButtonContainer';
                tiredChoiceContainer.style.display = 'flex';
                tiredChoiceContainer.style.flexDirection = 'column';
                tiredChoiceContainer.style.gap = '15px';
                tiredChoiceContainer.style.alignItems = 'center';
                tiredChoiceContainer.style.marginTop = '20px';
                
                // Create tired button
                const tiredButton = document.createElement('button');
                tiredButton.id = 'tired';
                tiredButton.className = 'dot-btn';
                tiredButton.textContent = '피곤하다...';
                
                // Add click event for tired button - START ENDING SEQUENCE
                tiredButton.addEventListener('click', async function() {
                    console.log('User chose tired option - Starting ending sequence');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('tiredChoiceButtonContainer');
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                    
                    // Apply fade effects with consistent timing
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg", fadeDuration),
                        changeTextWithFade(wayTitle, "힘겹게 방 문 앞에 섰다.", fadeDuration),
                        currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for door entry
                    const doorEntryChoiceContainer = document.createElement('div');
                    doorEntryChoiceContainer.className = 'button-container';
                    doorEntryChoiceContainer.id = 'tiredDoorEntryChoiceButtonContainer';
                    doorEntryChoiceContainer.style.display = 'flex';
                    doorEntryChoiceContainer.style.flexDirection = 'column';
                    doorEntryChoiceContainer.style.gap = '15px';
                    doorEntryChoiceContainer.style.alignItems = 'center';
                    doorEntryChoiceContainer.style.marginTop = '20px';
                    
                    // Create door entry button
                    const enterDoorButton = document.createElement('button');
                    enterDoorButton.id = 'enterDoorTired';
                    enterDoorButton.className = 'dot-btn';
                    enterDoorButton.textContent = '문을 열고 들어간다';
                    
                    // Add click event for door entry button - ENDING SEQUENCE
                    enterDoorButton.addEventListener('click', async function() {
                        console.log('User chose to enter through the door - Starting ending sequence from tired path');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('tiredDoorEntryChoiceButtonContainer');
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                        
                        // Step 1: Change to door_opened.svg and fade out
                        await Promise.all([
                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg", fadeDuration),
                            currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                        ]);
                        
                        // Wait for transition to complete
                        await new Promise(resolve => setTimeout(resolve, fadeDuration));
                        
                        // Step 2: Change to sunset.svg and ending message
                        const currentImage = document.querySelector('.illust-container img');
                        if (currentImage) {
                            // Fade out current image and text
                            currentImage.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                            currentImage.style.opacity = '0';
                            wayTitle.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                            wayTitle.style.opacity = '0';
                            
                            // Wait for fade out to complete
                            await new Promise(resolve => setTimeout(resolve, fadeDuration));
                            
                            // Change image and text
                            currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                            wayTitle.innerHTML = "오늘 하루도 끝났다...";
                            
                            // Fade in new content
                            currentImage.style.opacity = '1';
                            wayTitle.style.opacity = '1';
                        }
                        
                        // Step 3: Create restart button
                        const restartChoiceContainer = document.createElement('div');
                        restartChoiceContainer.className = 'button-container';
                        restartChoiceContainer.id = 'tiredRestartChoiceButtonContainer';
                        restartChoiceContainer.style.display = 'flex';
                        restartChoiceContainer.style.flexDirection = 'column';
                        restartChoiceContainer.style.gap = '15px';
                        restartChoiceContainer.style.alignItems = 'center';
                        restartChoiceContainer.style.marginTop = '20px';
                        
                        const restartButton = document.createElement('button');
                        restartButton.id = 'restartTired';
                        restartButton.className = 'dot-btn';
                        restartButton.textContent = '처음으로 돌아가기';
                        
                        // Add click event for restart button
                        restartButton.addEventListener('click', function() {
                            console.log('User chose to restart from tired path - Reloading page');
                            // Page reload
                            location.reload();
                        });
                        
                        // Add restart button to container
                        restartChoiceContainer.appendChild(restartButton);
                        
                        // Add restart container to choice section
                        const choiceSection = document.querySelector('.choice-section');
                        choiceSection.appendChild(restartChoiceContainer);
                        
                        // Fade in restart button
                        fadeElement(restartChoiceContainer, true, fadeDuration);
                    });
                    
                    // Add door entry button to container
                    doorEntryChoiceContainer.appendChild(enterDoorButton);
                    
                    // Add door entry container to choice section
                    const choiceSection = document.querySelector('.choice-section');
                    choiceSection.appendChild(doorEntryChoiceContainer);
                    
                    // Fade in door entry button
                    fadeElement(doorEntryChoiceContainer, true, fadeDuration);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                });
                
                // Add tired button to container
                tiredChoiceContainer.appendChild(tiredButton);
                
                // Add tired choice container to choice section
                const choiceSection = document.querySelector('.choice-section');
                choiceSection.appendChild(tiredChoiceContainer);
                
                // Fade in tired button
                fadeElement(tiredChoiceContainer, true, fadeDuration);
                
                // Generate circle and connecting line
                generateRandomCircle();
            });
            
            askDirectionsButton.addEventListener('click', async function() {
                console.log('User chose to ask for directions - Starting ending sequence');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('lostChoiceButtonContainer');
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Apply fade effects with consistent timing
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg", fadeDuration),
                    changeTextWithFade(wayTitle, "길을 아는 사람이 아무도 없어 <br>결국 밤이 되어 빙빙 돌아 집으로 돌아갔다.", fadeDuration),
                    currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                ]);
                
                // Create new choice button container for door entry
                const doorEntryChoiceContainer = document.createElement('div');
                doorEntryChoiceContainer.className = 'button-container';
                doorEntryChoiceContainer.id = 'askDirectionsDoorEntryChoiceButtonContainer';
                doorEntryChoiceContainer.style.display = 'flex';
                doorEntryChoiceContainer.style.flexDirection = 'column';
                doorEntryChoiceContainer.style.gap = '15px';
                doorEntryChoiceContainer.style.alignItems = 'center';
                doorEntryChoiceContainer.style.marginTop = '20px';
                
                // Create door entry button
                const enterDoorButton = document.createElement('button');
                enterDoorButton.id = 'enterDoorAskDirections';
                enterDoorButton.className = 'dot-btn';
                enterDoorButton.textContent = '문을 열고 들어간다';
                
                // Add click event for door entry button - ENDING SEQUENCE
                enterDoorButton.addEventListener('click', async function() {
                    console.log('User chose to enter through the door - Starting ending sequence from ask directions path');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('askDirectionsDoorEntryChoiceButtonContainer');
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                    
                    // Step 1: Change to door_opened.svg (no fade) and fade out buttons
                    // Change door image immediately without fade
                    const doorImage = document.querySelector('.illust-container img');
                    if (doorImage) {
                        doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                    }
                    
                    // Hide current choice button
                    if (currentContainer) {
                        await fadeElement(currentContainer, false, fadeDuration);
                    }
                    
                    // Wait for transition to complete
                    await new Promise(resolve => setTimeout(resolve, fadeDuration));
                    
                    // Step 2: Change to sunset.svg and ending message
                    const currentImage = document.querySelector('.illust-container img');
                    if (currentImage) {
                        // Fade out current image and text
                        currentImage.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                        currentImage.style.opacity = '0';
                        wayTitle.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                        wayTitle.style.opacity = '0';
                        
                        // Wait for fade out to complete
                        await new Promise(resolve => setTimeout(resolve, fadeDuration));
                        
                        // Change image and text
                        currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                        wayTitle.innerHTML = "오늘 하루도 끝났다...";
                        
                        // Fade in new content
                        currentImage.style.opacity = '1';
                        wayTitle.style.opacity = '1';
                    }
                    
                    // Step 3: Create restart button
                    const restartChoiceContainer = document.createElement('div');
                    restartChoiceContainer.className = 'button-container';
                    restartChoiceContainer.id = 'askDirectionsRestartChoiceButtonContainer';
                    restartChoiceContainer.style.display = 'flex';
                    restartChoiceContainer.style.flexDirection = 'column';
                    restartChoiceContainer.style.gap = '15px';
                    restartChoiceContainer.style.alignItems = 'center';
                    restartChoiceContainer.style.marginTop = '20px';
                    
                    const restartButton = document.createElement('button');
                    restartButton.id = 'restartAskDirections';
                    restartButton.className = 'dot-btn';
                    restartButton.textContent = '처음으로 돌아가기';
                    
                    // Add click event for restart button
                    restartButton.addEventListener('click', function() {
                        console.log('User chose to restart from ask directions path - Reloading page');
                        // Page reload
                        location.reload();
                    });
                    
                    // Add restart button to container
                    restartChoiceContainer.appendChild(restartButton);
                    
                    // Add restart container to choice section
                    const choiceSection = document.querySelector('.choice-section');
                    choiceSection.appendChild(restartChoiceContainer);
                    
                    // Fade in restart button
                    fadeElement(restartChoiceContainer, true, fadeDuration);
                });
                
                // Add door entry button to container
                doorEntryChoiceContainer.appendChild(enterDoorButton);
                
                // Add door entry container to choice section
                const choiceSection = document.querySelector('.choice-section');
                choiceSection.appendChild(doorEntryChoiceContainer);
                
                // Fade in door entry button
                fadeElement(doorEntryChoiceContainer, true, fadeDuration);
                
                // Generate circle and connecting line
                generateRandomCircle();
            });
            
            // Add buttons to lost choice container
            lostChoiceContainer.appendChild(useMapButton);
            lostChoiceContainer.appendChild(askDirectionsButton);
            
            // Add lost choice container to choice section
            const choiceSection = document.querySelector('.choice-section');
            choiceSection.appendChild(lostChoiceContainer);
            
            // Fade in new buttons
            fadeElement(lostChoiceContainer, true, fadeDuration);
            
            // Generate circle and connecting line
            generateRandomCircle();
        });
        
        createSafeButton(newWay2Button, async function() {
            console.log('User chose the organized and crowded place');
            
            const wayTitle = document.getElementById('wayTitle');
            const currentContainer = document.getElementById('newChoiceButtonContainer');
            
            // Apply fade effects
            await Promise.all([
                changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/map_man_0.svg"),
                changeTextWithFade(wayTitle, "가다가 길을 잃은 것처럼 보이는 사람을 만났다.<br>먼저 말을 걸어 볼까?"),
                currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
            ]);
            
            // Create new choice button container for lost person options
            const lostPersonChoiceContainer = document.createElement('div');
            lostPersonChoiceContainer.className = 'button-container';
            lostPersonChoiceContainer.id = 'lostPersonChoiceButtonContainer';
            lostPersonChoiceContainer.style.display = 'flex';
            lostPersonChoiceContainer.style.flexDirection = 'column';
            lostPersonChoiceContainer.style.gap = '15px';
            lostPersonChoiceContainer.style.alignItems = 'center';
            lostPersonChoiceContainer.style.marginTop = '20px';
            
            // Create first choice button
            const ignorePersonButton = document.createElement('button');
            ignorePersonButton.id = 'ignorePerson';
            ignorePersonButton.className = 'dot-btn';
            ignorePersonButton.textContent = '무시하고 갈 길을 갔다.';
            
            // Create second choice button
            const talkToPersonButton = document.createElement('button');
            talkToPersonButton.id = 'talkToPerson';
            talkToPersonButton.className = 'dot-btn';
            talkToPersonButton.textContent = '말을 걸어본다.';
            
            // Add click events for lost person buttons
            ignorePersonButton.addEventListener('click', async function() {
                console.log('User chose to ignore the lost person');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('lostPersonChoiceButtonContainer');
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Apply fade effects with consistent timing
                const fadeDuration = 500;
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/alert.svg", fadeDuration),
                    changeTextWithFade(wayTitle, "가다보니 내가 길을 잃었다. 도움을 요청할까?", fadeDuration),
                    currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                ]);
                
                // Create new choice button container for lost options
                const lostChoiceContainer = document.createElement('div');
                lostChoiceContainer.className = 'button-container';
                lostChoiceContainer.id = 'ignoreLostChoiceButtonContainer';
                lostChoiceContainer.style.display = 'flex';
                lostChoiceContainer.style.flexDirection = 'column';
                lostChoiceContainer.style.gap = '15px';
                lostChoiceContainer.style.alignItems = 'center';
                lostChoiceContainer.style.marginTop = '20px';
                
                // Create first choice button - use map app
                const useMapButton = document.createElement('button');
                useMapButton.id = 'useMapIgnore';
                useMapButton.className = 'dot-btn';
                useMapButton.textContent = '지도 앱을 켜고 혼자 간다.';
                
                // Create second choice button - ask for directions
                const askDirectionsButton = document.createElement('button');
                askDirectionsButton.id = 'askDirectionsIgnore';
                askDirectionsButton.className = 'dot-btn';
                askDirectionsButton.textContent = '가는 사람을 붙잡고 길을 물어본다.';
                
                // Add click events for lost choice buttons
                useMapButton.addEventListener('click', async function() {
                    console.log('User chose to use map app after ignoring person');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('ignoreLostChoiceButtonContainer');
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                    
                    // Apply fade effects with consistent timing
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/warning.svg", fadeDuration),
                        changeTextWithFade(wayTitle, "앗! 지도 앱이 이상한 곳을 알려줘서 결국 집에 늦게 도착했다.", fadeDuration),
                        currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for tired option
                    const tiredChoiceContainer = document.createElement('div');
                    tiredChoiceContainer.className = 'button-container';
                    tiredChoiceContainer.id = 'ignoreTiredChoiceButtonContainer';
                    tiredChoiceContainer.style.display = 'flex';
                    tiredChoiceContainer.style.flexDirection = 'column';
                    tiredChoiceContainer.style.gap = '15px';
                    tiredChoiceContainer.style.alignItems = 'center';
                    tiredChoiceContainer.style.marginTop = '20px';
                    
                    // Create tired button
                    const tiredButton = document.createElement('button');
                    tiredButton.id = 'tiredIgnore';
                    tiredButton.className = 'dot-btn';
                    tiredButton.textContent = '피곤하다...';
                    
                    // Add click event for tired button - START ENDING SEQUENCE
                    tiredButton.addEventListener('click', async function() {
                        console.log('User chose tired option after ignoring person - Starting ending sequence');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('ignoreTiredChoiceButtonContainer');
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                        
                        // Apply fade effects with consistent timing
                        await Promise.all([
                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg", fadeDuration),
                            changeTextWithFade(wayTitle, "힘겹게 방 문 앞에 섰다.", fadeDuration),
                            currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                        ]);
                        
                        // Create new choice button container for door entry
                        const doorEntryChoiceContainer = document.createElement('div');
                        doorEntryChoiceContainer.className = 'button-container';
                        doorEntryChoiceContainer.id = 'ignoreTiredDoorEntryChoiceButtonContainer';
                        doorEntryChoiceContainer.style.display = 'flex';
                        doorEntryChoiceContainer.style.flexDirection = 'column';
                        doorEntryChoiceContainer.style.gap = '15px';
                        doorEntryChoiceContainer.style.alignItems = 'center';
                        doorEntryChoiceContainer.style.marginTop = '20px';
                        
                        // Create door entry button
                        const enterDoorButton = document.createElement('button');
                        enterDoorButton.id = 'enterDoorIgnoreTired';
                        enterDoorButton.className = 'dot-btn';
                        enterDoorButton.textContent = '문을 열고 들어간다';
                        
                        // Add click event for door entry button - ENDING SEQUENCE
                        enterDoorButton.addEventListener('click', async function() {
                            console.log('User chose to enter through the door - Starting ending sequence from ignore tired path');
                            
                            const wayTitle = document.getElementById('wayTitle');
                            const currentContainer = document.getElementById('ignoreTiredDoorEntryChoiceButtonContainer');
                            
                            // Add button click effect
                            this.style.transform = 'scale(0.95)';
                            setTimeout(() => {
                                this.style.transform = 'scale(1)';
                            }, 150);
                            
                            // Step 1: Change to door_opened.svg (no fade) and fade out buttons
                            // Change door image immediately without fade
                            const doorImage = document.querySelector('.illust-container img');
                            if (doorImage) {
                                doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                            }
                            
                            // Hide current choice button
                            if (currentContainer) {
                                await fadeElement(currentContainer, false, fadeDuration);
                            }
                            
                            // Wait for transition to complete
                            await new Promise(resolve => setTimeout(resolve, fadeDuration));
                            
                            // Step 2: Change to sunset.svg and ending message
                            const currentImage = document.querySelector('.illust-container img');
                            if (currentImage) {
                                // Fade out current image and text
                                currentImage.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                                currentImage.style.opacity = '0';
                                wayTitle.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                                wayTitle.style.opacity = '0';
                                
                                // Wait for fade out to complete
                                await new Promise(resolve => setTimeout(resolve, fadeDuration));
                                
                                // Change image and text
                                currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                wayTitle.innerHTML = "오늘 하루도 끝났다...";
                                
                                // Fade in new content
                                currentImage.style.opacity = '1';
                                wayTitle.style.opacity = '1';
                            }
                            
                            // Step 3: Create restart button
                            const restartChoiceContainer = document.createElement('div');
                            restartChoiceContainer.className = 'button-container';
                            restartChoiceContainer.id = 'ignoreTiredRestartChoiceButtonContainer';
                            restartChoiceContainer.style.display = 'flex';
                            restartChoiceContainer.style.flexDirection = 'column';
                            restartChoiceContainer.style.gap = '15px';
                            restartChoiceContainer.style.alignItems = 'center';
                            restartChoiceContainer.style.marginTop = '20px';
                            
                            const restartButton = document.createElement('button');
                            restartButton.id = 'restartIgnoreTired';
                            restartButton.className = 'dot-btn';
                            restartButton.textContent = '처음으로 돌아가기';
                            
                            // Add click event for restart button
                            restartButton.addEventListener('click', function() {
                                console.log('User chose to restart from ignore tired path - Reloading page');
                                // Page reload
                                location.reload();
                            });
                            
                            // Add restart button to container
                            restartChoiceContainer.appendChild(restartButton);
                            
                            // Add restart container to choice section
                            const choiceSection = document.getElementById('choiceSection');
                            choiceSection.appendChild(restartChoiceContainer);
                            
                            // Fade in restart button
                            fadeElement(restartChoiceContainer, true, fadeDuration);
                        });
                        
                        // Add door entry button to container
                        doorEntryChoiceContainer.appendChild(enterDoorButton);
                        
                        // Add door entry container to choice section
                        const choiceSection = document.getElementById('choiceSection');
                        choiceSection.appendChild(doorEntryChoiceContainer);
                        
                        // Fade in door entry button
                        fadeElement(doorEntryChoiceContainer, true, fadeDuration);
                        
                        // Generate circle and connecting line
                        generateRandomCircle();
                    });
                    
                    // Add tired button to container
                    tiredChoiceContainer.appendChild(tiredButton);
                    
                    // Add tired choice container to choice section
                    const choiceSection = document.getElementById('choiceSection');
                    choiceSection.appendChild(tiredChoiceContainer);
                    
                    // Fade in tired button
                    fadeElement(tiredChoiceContainer, true, fadeDuration);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                });
                
                askDirectionsButton.addEventListener('click', async function() {
                    console.log('User chose to ask for directions after ignoring person - Starting ending sequence');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('ignoreLostChoiceButtonContainer');
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                    
                    // Apply fade effects with consistent timing
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg", fadeDuration),
                        changeTextWithFade(wayTitle, "길을 아는 사람이 아무도 없어 결국 밤이 되어 빙빙 돌아 집으로 돌아갔다.", fadeDuration),
                        currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for door entry
                    const doorEntryChoiceContainer = document.createElement('div');
                    doorEntryChoiceContainer.className = 'button-container';
                    doorEntryChoiceContainer.id = 'ignoreAskDirectionsDoorEntryChoiceButtonContainer';
                    doorEntryChoiceContainer.style.display = 'flex';
                    doorEntryChoiceContainer.style.flexDirection = 'column';
                    doorEntryChoiceContainer.style.gap = '15px';
                    doorEntryChoiceContainer.style.alignItems = 'center';
                    doorEntryChoiceContainer.style.marginTop = '20px';
                    
                    // Create door entry button
                    const enterDoorButton = document.createElement('button');
                    enterDoorButton.id = 'enterDoorIgnoreAskDirections';
                    enterDoorButton.className = 'dot-btn';
                    enterDoorButton.textContent = '문을 열고 들어간다';
                    
                    // Add click event for door entry button - ENDING SEQUENCE
                    enterDoorButton.addEventListener('click', async function() {
                        console.log('User chose to enter through the door - Starting ending sequence from ignore ask directions path');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('ignoreAskDirectionsDoorEntryChoiceButtonContainer');
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                        
                        // Step 1: Change to door_opened.svg (no fade) and fade out buttons
                        // Change door image immediately without fade
                        const doorImage = document.querySelector('.illust-container img');
                        if (doorImage) {
                            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                        }
                        
                        // Hide current choice button
                        if (currentContainer) {
                            await fadeElement(currentContainer, false, fadeDuration);
                        }
                        
                        // Wait for transition to complete
                        await new Promise(resolve => setTimeout(resolve, fadeDuration));
                        
                        // Step 2: Change to sunset.svg and ending message
                        const currentImage = document.querySelector('.illust-container img');
                        if (currentImage) {
                            // Fade out current image and text
                            currentImage.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                            currentImage.style.opacity = '0';
                            wayTitle.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                            wayTitle.style.opacity = '0';
                            
                            // Wait for fade out to complete
                            await new Promise(resolve => setTimeout(resolve, fadeDuration));
                            
                            // Change image and text
                            currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                            wayTitle.innerHTML = "오늘 하루도 끝났다...";
                            
                            // Fade in new content
                            currentImage.style.opacity = '1';
                            wayTitle.style.opacity = '1';
                        }
                        
                        // Step 3: Create restart button
                        const restartChoiceContainer = document.createElement('div');
                        restartChoiceContainer.className = 'button-container';
                        restartChoiceContainer.id = 'ignoreAskDirectionsRestartChoiceButtonContainer';
                        restartChoiceContainer.style.display = 'flex';
                        restartChoiceContainer.style.flexDirection = 'column';
                        restartChoiceContainer.style.gap = '15px';
                        restartChoiceContainer.style.alignItems = 'center';
                        restartChoiceContainer.style.marginTop = '20px';
                        
                        const restartButton = document.createElement('button');
                        restartButton.id = 'restartIgnoreAskDirections';
                        restartButton.className = 'dot-btn';
                        restartButton.textContent = '처음으로 돌아가기';
                        
                        // Add click event for restart button
                        restartButton.addEventListener('click', function() {
                            console.log('User chose to restart from ignore ask directions path - Reloading page');
                            // Page reload
                            location.reload();
                        });
                        
                        // Add restart button to container
                        restartChoiceContainer.appendChild(restartButton);
                        
                        // Add restart container to choice section
                        const choiceSection = document.getElementById('choiceSection');
                        choiceSection.appendChild(restartChoiceContainer);
                        
                        // Fade in restart button
                        fadeElement(restartChoiceContainer, true, fadeDuration);
                    });
                    
                    // Add door entry button to container
                    doorEntryChoiceContainer.appendChild(enterDoorButton);
                    
                    // Add door entry container to choice section
                    const choiceSection = document.getElementById('choiceSection');
                    choiceSection.appendChild(doorEntryChoiceContainer);
                    
                    // Fade in door entry button
                    fadeElement(doorEntryChoiceContainer, true, fadeDuration);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                });
                
                // Add buttons to lost choice container
                lostChoiceContainer.appendChild(useMapButton);
                lostChoiceContainer.appendChild(askDirectionsButton);
                
                // Add lost choice container to choice section
                const choiceSection = document.getElementById('choiceSection');
                choiceSection.appendChild(lostChoiceContainer);
                
                // Fade in new buttons
                fadeElement(lostChoiceContainer, true, fadeDuration);
                
                // Generate circle and connecting line
                generateRandomCircle();
            });
            
            talkToPersonButton.addEventListener('click', async function() {
                console.log('User chose to talk to the lost person');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('lostPersonChoiceButtonContainer');
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                
                // Apply fade effects with consistent timing
                const fadeDuration = 500;
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/map_man_1.svg", fadeDuration),
                    changeTextWithFade(wayTitle, "말 걸었더니 길 잃은게 아니라고 한다.", fadeDuration),
                    currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                ]);
                
                // Create new choice button container for single option
                const singleChoiceContainer = document.createElement('div');
                singleChoiceContainer.className = 'button-container';
                singleChoiceContainer.id = 'singleChoiceButtonContainer';
                singleChoiceContainer.style.display = 'flex';
                singleChoiceContainer.style.flexDirection = 'column';
                singleChoiceContainer.style.gap = '15px';
                singleChoiceContainer.style.alignItems = 'center';
                singleChoiceContainer.style.marginTop = '20px';
                
                // Create single choice button
                const ohNoButton = document.createElement('button');
                ohNoButton.id = 'ohNo';
                ohNoButton.className = 'dot-btn';
                ohNoButton.textContent = '헉...';
                
                // Add click event for the oh no button
                ohNoButton.addEventListener('click', async function() {
                    console.log('User chose oh no...');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('singleChoiceButtonContainer');
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                    
                    // Apply fade effects with consistent timing
                    const fadeDuration = 500;
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg", fadeDuration),
                        changeTextWithFade(wayTitle, "사이비로 취급당하며 욕먹었다...<br>울적해진 마음에 집으로 돌아갔다.", fadeDuration),
                        currentContainer ? fadeElement(currentContainer, false, fadeDuration) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for door entry
                    const doorEntryChoiceContainer = document.createElement('div');
                    doorEntryChoiceContainer.className = 'button-container';
                    doorEntryChoiceContainer.id = 'doorEntryChoiceButtonContainer';
                    doorEntryChoiceContainer.style.display = 'flex';
                    doorEntryChoiceContainer.style.flexDirection = 'column';
                    doorEntryChoiceContainer.style.gap = '15px';
                    doorEntryChoiceContainer.style.alignItems = 'center';
                    doorEntryChoiceContainer.style.marginTop = '20px';
                    
                    // Create door entry button
                    const enterDoorButton = document.createElement('button');
                    enterDoorButton.id = 'enterDoor';
                    enterDoorButton.className = 'dot-btn';
                    enterDoorButton.textContent = '문을 열고 들어간다';
                    
                    // Add click event for door entry button - ENDING SEQUENCE
                    enterDoorButton.addEventListener('click', async function() {
                        console.log('User chose to enter through the door - Starting ending sequence');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('doorEntryChoiceButtonContainer');
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                        
                        // Step 1: Change to door_opened.svg (no fade) and fade out buttons
                        const fadeDuration = 500; // 더 자연스러운 타이밍으로 조정
                        
                        // Change door image immediately without fade
                        const doorImage = document.querySelector('.illust-container img');
                        if (doorImage) {
                            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                        }
                        
                        // Hide current choice button
                        if (currentContainer) {
                            await fadeElement(currentContainer, false, fadeDuration);
                        }
                        
                        // Wait for transition to complete
                        await new Promise(resolve => setTimeout(resolve, fadeDuration));
                        
                        // Step 2: Change to sunset.svg and ending message
                        const currentImage = document.querySelector('.illust-container img');
                        if (currentImage) {
                            // Fade out current image and text
                            currentImage.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                            currentImage.style.opacity = '0';
                            wayTitle.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                            wayTitle.style.opacity = '0';
                            
                            // Wait for fade out to complete
                            await new Promise(resolve => setTimeout(resolve, fadeDuration));
                            
                            // Change image and text
                            currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                            wayTitle.innerHTML = "오늘 하루도 끝났다...";
                            
                            // Fade in new content
                            currentImage.style.opacity = '1';
                            wayTitle.style.opacity = '1';
                        }
                        
                        // Step 3: Create restart button
                        const restartChoiceContainer = document.createElement('div');
                        restartChoiceContainer.className = 'button-container';
                        restartChoiceContainer.id = 'restartChoiceButtonContainer';
                        restartChoiceContainer.style.display = 'flex';
                        restartChoiceContainer.style.flexDirection = 'column';
                        restartChoiceContainer.style.gap = '15px';
                        restartChoiceContainer.style.alignItems = 'center';
                        restartChoiceContainer.style.marginTop = '20px';
                        
                        const restartButton = document.createElement('button');
                        restartButton.id = 'restart';
                        restartButton.className = 'dot-btn';
                        restartButton.textContent = '처음으로 돌아가기';
                        
                        // Add click event for restart button
                        restartButton.addEventListener('click', function() {
                            console.log('User chose to restart - Reloading page');
                            // Page reload
                            location.reload();
                        });
                        
                        // Add restart button to container
                        restartChoiceContainer.appendChild(restartButton);
                        
                        // Add restart container to choice section
                        const choiceSection = document.getElementById('choiceSection');
                        choiceSection.appendChild(restartChoiceContainer);
                        
                        // Fade in restart button with same timing
                        fadeElement(restartChoiceContainer, true, fadeDuration);
                    });
                    
                    // Add door entry button to container
                    doorEntryChoiceContainer.appendChild(enterDoorButton);
                    
                    // Add door entry container to choice section
                    const choiceSection = document.getElementById('choiceSection');
                    choiceSection.appendChild(doorEntryChoiceContainer);
                    
                    // Fade in door entry button with consistent timing
                    fadeElement(doorEntryChoiceContainer, true, 500);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                });
                
                // Add button to single choice container
                singleChoiceContainer.appendChild(ohNoButton);
                
                // Add single choice container to choice section
                const choiceSection = document.getElementById('choiceSection');
                choiceSection.appendChild(singleChoiceContainer);
                
                // Fade in new button with consistent timing
                fadeElement(singleChoiceContainer, true, 500);
                
                // Generate circle and connecting line
                generateRandomCircle();
            });
            
            // Add buttons to lost person container
            lostPersonChoiceContainer.appendChild(ignorePersonButton);
            lostPersonChoiceContainer.appendChild(talkToPersonButton);
            
            // Add lost person choice container to choice section
            choiceSection.appendChild(lostPersonChoiceContainer);
            
            // Fade in new buttons
            fadeElement(lostPersonChoiceContainer, true);
            
            // Generate circle and connecting line
            generateRandomCircle();
            
            // Add button click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        }, 800); // 800ms cooldown for longer async operations
        
        // Add buttons to new container
        newChoiceContainer.appendChild(newWay1Button);
        newChoiceContainer.appendChild(newWay2Button);
        
        // Add new choice container to choice section
        const choiceSection = document.querySelector('.choice-section');
        choiceSection.appendChild(newChoiceContainer);
        
        // Fade in new buttons
        fadeElement(newChoiceContainer, true);
        
        // Add button click effect (this will be handled by the calling element)
        console.log('goUsualWay button clicked');
    }
    
    async function goNewWayHandler() {
        console.log('User chose to go the new way');
        
        const wayTitle = document.getElementById('wayTitle');
        
        // Generate circle and connecting line first
        generateRandomCircle();
        
        // Apply fade effects
        await Promise.all([
            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/store.svg"),
            changeTextWithFade(wayTitle, "못 보던 가게가 생겼다.<br>들어가 볼까?"),
            fadeElement(choiceButtonContainer, false)
        ]);
        
        // Create new choice button container
        const newChoiceContainer = document.createElement('div');
        newChoiceContainer.className = 'button-container';
        newChoiceContainer.id = 'storeChoiceButtonContainer';
        newChoiceContainer.style.display = 'flex';
        newChoiceContainer.style.flexDirection = 'column';
        newChoiceContainer.style.gap = '15px';
        newChoiceContainer.style.alignItems = 'center';
        newChoiceContainer.style.marginTop = '20px';
        
        // Create first new choice button
        const enterStoreButton = document.createElement('button');
        enterStoreButton.id = 'enterStore';
        enterStoreButton.className = 'dot-btn';
        enterStoreButton.textContent = '들어가본다.';
        
        // Create second new choice button
        const notEnterStoreButton = document.createElement('button');
        notEnterStoreButton.id = 'notEnterStore';
        notEnterStoreButton.className = 'dot-btn';
        notEnterStoreButton.textContent = '들어가지 않는다.';
        
        // Add click events for new buttons
        enterStoreButton.addEventListener('click', async function() {
            console.log('User chose to enter the store');
            
            const wayTitle = document.getElementById('wayTitle');
            const currentContainer = document.getElementById('storeChoiceButtonContainer');
            
            // Apply fade effects
            await Promise.all([
                changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/warning.svg"),
                changeTextWithFade(wayTitle, "앗 알고보니 가게가 아니고 누군가가 사는 집이었다..!<br>집주인에게 사과를 할까?"),
                currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
            ]);
            
            // Create new choice button container for apology options
            const apologyChoiceContainer = document.createElement('div');
            apologyChoiceContainer.className = 'button-container';
            apologyChoiceContainer.id = 'apologyChoiceButtonContainer';
            apologyChoiceContainer.style.display = 'flex';
            apologyChoiceContainer.style.flexDirection = 'column';
            apologyChoiceContainer.style.gap = '15px';
            apologyChoiceContainer.style.alignItems = 'center';
            apologyChoiceContainer.style.marginTop = '20px';
            
            // Create first apology choice button
            const apologizeButton = document.createElement('button');
            apologizeButton.id = 'apologize';
            apologizeButton.className = 'dot-btn';
            apologizeButton.textContent = '만나서 사과를 한다.';
            
            // Create second apology choice button
            const leaveQuietlyButton = document.createElement('button');
            leaveQuietlyButton.id = 'leaveQuietly';
            leaveQuietlyButton.className = 'dot-btn';
            leaveQuietlyButton.textContent = '사과없이 조용히 나가기로 한다.';
            
            // Add click events for apology buttons
            apologizeButton.addEventListener('click', async function() {
                console.log('User chose to apologize');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('apologyChoiceButtonContainer');
                
                // Apply fade effects
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/angry.svg"),
                    changeTextWithFade(wayTitle, "만나서 사과를 하기 전에 집에 들어온걸 들켜버렸다..!<br>화를 내면서 쫓아온다. 어떻게 하지?"),
                    currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                ]);
                
                // Create new choice button container for escape options
                const escapeChoiceContainer = document.createElement('div');
                escapeChoiceContainer.className = 'button-container';
                escapeChoiceContainer.id = 'escapeChoiceButtonContainer';
                escapeChoiceContainer.style.display = 'flex';
                escapeChoiceContainer.style.flexDirection = 'column';
                escapeChoiceContainer.style.gap = '15px';
                escapeChoiceContainer.style.alignItems = 'center';
                escapeChoiceContainer.style.marginTop = '20px';
                
                // Create first escape choice button
                const makeExcuseButton = document.createElement('button');
                makeExcuseButton.id = 'makeExcuse';
                makeExcuseButton.className = 'dot-btn';
                makeExcuseButton.textContent = '구차하게 변명을 한다.';
                
                // Create second escape choice button
                const runAwayButton = document.createElement('button');
                runAwayButton.id = 'runAway';
                runAwayButton.className = 'dot-btn';
                runAwayButton.textContent = '빠르게 도망간다.';
                
                // Add click events for escape buttons
                makeExcuseButton.addEventListener('click', async function() {
                    console.log('User chose to make excuses');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('escapeChoiceButtonContainer');
                    
                    // Apply fade effects
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/punch.svg"),
                        changeTextWithFade(wayTitle, "변명이 통하지 않았다.<br>주먹을 맞고 쓰러졌다.<br>두 눈이 깜깜해진다..<br>(암전)"),
                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                    ]);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                    
                    // Create overlay for fade effect
                    const fadeOverlay = document.createElement('div');
                    fadeOverlay.style.position = 'fixed';
                    fadeOverlay.style.top = '0';
                    fadeOverlay.style.left = '0';
                    fadeOverlay.style.width = '100vw';
                    fadeOverlay.style.height = '100vh';
                    fadeOverlay.style.backgroundColor = 'black';
                    fadeOverlay.style.opacity = '0';
                    fadeOverlay.style.zIndex = '9999';
                    fadeOverlay.style.transition = 'opacity 0.5s ease-in-out';
                    fadeOverlay.style.pointerEvents = 'none';
                    document.body.appendChild(fadeOverlay);
                    
                    // Start fading to black after 3 seconds
                    setTimeout(() => {
                        fadeOverlay.style.opacity = '1';
                        
                        // After fade to black is complete (3 seconds), start recovery sequence
                        setTimeout(() => {
                            // Change image to door_closed
                            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg";
                            
                            // Change text
                            wayTitle.innerHTML = "눈 떠보니 집으로 돌아왔다...";
                            
                            // Create new choice button for entering home
                            const homeChoiceContainer = document.createElement('div');
                            homeChoiceContainer.className = 'button-container';
                            homeChoiceContainer.id = 'homeChoiceButtonContainer';
                            homeChoiceContainer.style.display = 'flex';
                            homeChoiceContainer.style.flexDirection = 'column';
                            homeChoiceContainer.style.gap = '15px';
                            homeChoiceContainer.style.alignItems = 'center';
                            homeChoiceContainer.style.marginTop = '20px';
                            
                            const enterHomeButton = document.createElement('button');
                            enterHomeButton.id = 'enterHome';
                            enterHomeButton.className = 'dot-btn';
                            enterHomeButton.textContent = '문을 열고 들어간다';
                            
                            // Add click event for enter home button
                            enterHomeButton.addEventListener('click', function() {
                                console.log('User chose to enter home');
                                
                                // Change image to door_opened
                                doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                                
                                // Connect last circle to first circle (complete the loop)
                                if (circles.length >= 2) {
                                    const lastCircle = circles[circles.length - 1]; // The last existing circle
                                    const firstCircle = circles[0]; // The first circle (below home.svg)
                                    
                                    // Draw connecting line from last to first circle
                                    drawConnectingLine(lastCircle, firstCircle);
                                    
                                    // Wait for the line drawing animation to complete (2 seconds), then start ending sequence
                                    setTimeout(() => {
                                        // Start fade out effect
                                        doorImage.style.transition = 'opacity 1s ease-out';
                                        doorImage.style.opacity = '0';
                                        
                                        const currentContainer = document.getElementById('homeChoiceButtonContainer');
                                        if (currentContainer) {
                                            currentContainer.style.transition = 'opacity 1s ease-out';
                                            currentContainer.style.opacity = '0';
                                        }
                                        
                                        const wayTitle = document.getElementById('wayTitle');
                                        wayTitle.style.transition = 'opacity 1s ease-out';
                                        wayTitle.style.opacity = '0';
                                        
                                        // After fade out, change to ending scene
                                        setTimeout(() => {
                                            // Change image to sunset
                                            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                            doorImage.style.opacity = '1';
                                            
                                            // Change text
                                            wayTitle.innerHTML = "오늘 하루도 끝이 났다...";
                                            wayTitle.style.opacity = '1';
                                            
                                            // Hide previous container
                                            if (currentContainer) {
                                                currentContainer.style.display = 'none';
                                            }
                                            
                                            // Create ending choice button container
                                            const endingChoiceContainer = document.createElement('div');
                                            endingChoiceContainer.className = 'button-container';
                                            endingChoiceContainer.id = 'endingChoiceButtonContainer';
                                            endingChoiceContainer.style.display = 'flex';
                                            endingChoiceContainer.style.flexDirection = 'column';
                                            endingChoiceContainer.style.gap = '15px';
                                            endingChoiceContainer.style.alignItems = 'center';
                                            endingChoiceContainer.style.marginTop = '20px';
                                            endingChoiceContainer.style.opacity = '0';
                                            
                                            const restartButton = document.createElement('button');
                                            restartButton.id = 'restart';
                                            restartButton.className = 'dot-btn';
                                            restartButton.textContent = '처음으로 돌아가기';
                                            
                                            // Add click event for restart button
                                            restartButton.addEventListener('click', function() {
                                                console.log('User chose to restart');
                                                // Refresh the page
                                                location.reload();
                                            });
                                            
                                            // Add button to container
                                            endingChoiceContainer.appendChild(restartButton);
                                            
                                            // Add container to choice section
                                            const choiceSection = document.querySelector('.choice-section');
                                            choiceSection.appendChild(endingChoiceContainer);
                                            
                                            // Fade in ending elements
                                            setTimeout(() => {
                                                endingChoiceContainer.style.transition = 'opacity 1s ease-in';
                                                endingChoiceContainer.style.opacity = '1';
                                            }, 100);
                                            
                                        }, 1000); // Wait 1 second for fade out to complete
                                        
                                    }, 2000); // Wait 2 seconds for line drawing to complete
                                }
                                
                                // Add button click effect
                                this.style.transform = 'scale(0.95)';
                                setTimeout(() => {
                                    this.style.transform = 'scale(1)';
                                }, 150);
                            });
                            
                            // Add button to container
                            homeChoiceContainer.appendChild(enterHomeButton);
                            
                            // Add container to choice section
                            const choiceSection = document.querySelector('.choice-section');
                            choiceSection.appendChild(homeChoiceContainer);
                            
                            // Start fading back to normal (fade out the black overlay)
                            fadeOverlay.style.transition = 'opacity 3s ease-in-out';
                            fadeOverlay.style.opacity = '0';
                            
                            // Remove overlay after fade out is complete
                            setTimeout(() => {
                                fadeOverlay.remove();
                            }, 3000);
                            
                        }, 3000); // Wait 3 seconds while screen is black
                        
                    }, 3000); // Wait 3 seconds before starting fade to black
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                runAwayButton.addEventListener('click', async function() {
                    console.log('User chose to run away');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('escapeChoiceButtonContainer');
                    
                    // Apply fade effects
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/run.svg"),
                        changeTextWithFade(wayTitle, "달리기를 잘해서 덕분에 안 잡혔다!<br>운이 좋군."),
                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for running home
                    const runHomeChoiceContainer = document.createElement('div');
                    runHomeChoiceContainer.className = 'button-container';
                    runHomeChoiceContainer.id = 'runHomeChoiceButtonContainer';
                    runHomeChoiceContainer.style.display = 'flex';
                    runHomeChoiceContainer.style.flexDirection = 'column';
                    runHomeChoiceContainer.style.gap = '15px';
                    runHomeChoiceContainer.style.alignItems = 'center';
                    runHomeChoiceContainer.style.marginTop = '20px';
                    
                    // Create run home choice button
                    const runHomeButton = document.createElement('button');
                    runHomeButton.id = 'runHome';
                    runHomeButton.className = 'dot-btn';
                    runHomeButton.textContent = '그대로 집으로 뛰어간다.';
                    
                    // Add click event for run home button
                    runHomeButton.addEventListener('click', async function() {
                        console.log('User chose to run home');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('runHomeChoiceButtonContainer');
                        
                        // Apply fade effects
                        await Promise.all([
                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg"),
                            changeTextWithFade(wayTitle, "숨을 헐떡이며 겨우 문 앞에 도착했다."),
                            currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                        ]);
                        
                        // Create new choice button container for entering home
                        const enterHomeChoiceContainer = document.createElement('div');
                        enterHomeChoiceContainer.className = 'button-container';
                        enterHomeChoiceContainer.id = 'runEnterHomeChoiceButtonContainer';
                        enterHomeChoiceContainer.style.display = 'flex';
                        enterHomeChoiceContainer.style.flexDirection = 'column';
                        enterHomeChoiceContainer.style.gap = '15px';
                        enterHomeChoiceContainer.style.alignItems = 'center';
                        enterHomeChoiceContainer.style.marginTop = '20px';
                        
                        const enterHomeButton = document.createElement('button');
                        enterHomeButton.id = 'runEnterHome';
                        enterHomeButton.className = 'dot-btn';
                        enterHomeButton.textContent = '문을 열고 들어간다';
                        
                        // Add click event for enter home button (ending sequence)
                        enterHomeButton.addEventListener('click', function() {
                            console.log('User chose to enter home (run ending)');
                            
                            // Change image to door_opened
                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg");
                            
                            // Connect last circle to first circle (complete the loop)
                            if (circles.length >= 2) {
                                const lastCircle = circles[circles.length - 1]; // The last existing circle
                                const firstCircle = circles[0]; // The first circle (below home.svg)
                                
                                // Draw connecting line from last to first circle
                                drawConnectingLine(lastCircle, firstCircle);
                                
                                // Wait for the line drawing animation to complete (2 seconds), then start ending sequence
                                setTimeout(() => {
                                    // Start fade out effect
                                    doorImage.style.transition = 'opacity 1s ease-out';
                                    doorImage.style.opacity = '0';
                                    
                                    const currentContainer = document.getElementById('runEnterHomeChoiceButtonContainer');
                                    if (currentContainer) {
                                        currentContainer.style.transition = 'opacity 1s ease-out';
                                        currentContainer.style.opacity = '0';
                                    }
                                    
                                    const wayTitle = document.getElementById('wayTitle');
                                    wayTitle.style.transition = 'opacity 1s ease-out';
                                    wayTitle.style.opacity = '0';
                                    
                                    // After fade out, change to ending scene
                                    setTimeout(() => {
                                        // Change image to sunset
                                        doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                        doorImage.style.opacity = '1';
                                        
                                        // Change text
                                        wayTitle.innerHTML = "오늘 하루도 끝이 났다...";
                                        wayTitle.style.opacity = '1';
                                        
                                        // Hide previous container
                                        if (currentContainer) {
                                            currentContainer.style.display = 'none';
                                        }
                                        
                                        // Create ending choice button container
                                        const endingChoiceContainer = document.createElement('div');
                                        endingChoiceContainer.className = 'button-container';
                                        endingChoiceContainer.id = 'runEndingChoiceButtonContainer';
                                        endingChoiceContainer.style.display = 'flex';
                                        endingChoiceContainer.style.flexDirection = 'column';
                                        endingChoiceContainer.style.gap = '15px';
                                        endingChoiceContainer.style.alignItems = 'center';
                                        endingChoiceContainer.style.marginTop = '20px';
                                        endingChoiceContainer.style.opacity = '0';
                                        
                                        const restartButton = document.createElement('button');
                                        restartButton.id = 'runRestart';
                                        restartButton.className = 'dot-btn';
                                        restartButton.textContent = '처음으로 돌아가기';
                                        
                                        // Add click event for restart button
                                        restartButton.addEventListener('click', function() {
                                            console.log('User chose to restart (run ending)');
                                            // Refresh the page
                                            location.reload();
                                        });
                                        
                                        // Add button to container
                                        endingChoiceContainer.appendChild(restartButton);
                                        
                                        // Add container to choice section
                                        choiceSection.appendChild(endingChoiceContainer);
                                        
                                        // Fade in ending elements
                                        setTimeout(() => {
                                            endingChoiceContainer.style.transition = 'opacity 1s ease-in';
                                            endingChoiceContainer.style.opacity = '1';
                                        }, 100);
                                        
                                    }, 1000); // Wait 1 second for fade out to complete
                                    
                                }, 2000); // Wait 2 seconds for line drawing to complete
                            }
                            
                            // Add button click effect
                            this.style.transform = 'scale(0.95)';
                            setTimeout(() => {
                                this.style.transform = 'scale(1)';
                            }, 150);
                        });
                        
                        // Add button to container
                        enterHomeChoiceContainer.appendChild(enterHomeButton);
                        
                        // Add container to choice section
                        choiceSection.appendChild(enterHomeChoiceContainer);
                        
                        // Fade in new buttons
                        fadeElement(enterHomeChoiceContainer, true);
                        
                        // Generate circle and connecting line
                        generateRandomCircle();
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                    });
                    
                    // Add button to container
                    runHomeChoiceContainer.appendChild(runHomeButton);
                    
                    // Add container to choice section
                    choiceSection.appendChild(runHomeChoiceContainer);
                    
                    // Fade in new buttons
                    fadeElement(runHomeChoiceContainer, true);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                // Add buttons to escape container
                escapeChoiceContainer.appendChild(makeExcuseButton);
                escapeChoiceContainer.appendChild(runAwayButton);
                
                // Add escape choice container to choice section
                const choiceSection = document.querySelector('.choice-section');
                choiceSection.appendChild(escapeChoiceContainer);
                
                // Generate circle and connecting line
                generateRandomCircle();
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            leaveQuietlyButton.addEventListener('click', async function() {
                console.log('User chose to leave quietly');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('apologyChoiceButtonContainer');
                
                // Apply fade effects
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/dead_plant.svg"),
                    changeTextWithFade(wayTitle, "조용히 나가다가 옆에서 말라가는 화분을 발견했다.<br>대신 물을 줘도 될까?"),
                    currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                ]);
                
                // Create new choice button container for plant options
                const plantChoiceContainer = document.createElement('div');
                plantChoiceContainer.className = 'button-container';
                plantChoiceContainer.id = 'plantChoiceButtonContainer';
                plantChoiceContainer.style.display = 'flex';
                plantChoiceContainer.style.flexDirection = 'column';
                plantChoiceContainer.style.gap = '15px';
                plantChoiceContainer.style.alignItems = 'center';
                plantChoiceContainer.style.marginTop = '20px';
                
                // Create first plant choice button
                const waterPlantButton = document.createElement('button');
                waterPlantButton.id = 'waterPlant';
                waterPlantButton.className = 'dot-btn';
                waterPlantButton.textContent = '물을 준다.';
                
                // Create second plant choice button
                const notWaterPlantButton = document.createElement('button');
                notWaterPlantButton.id = 'notWaterPlant';
                notWaterPlantButton.className = 'dot-btn';
                notWaterPlantButton.textContent = '물을 주지 않는다.';
                
                // Add click events for plant buttons
                waterPlantButton.addEventListener('click', async function() {
                    console.log('User chose to water the plant');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('plantChoiceButtonContainer');
                    
                    // Apply fade effects
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/happy_plant.svg"),
                        changeTextWithFade(wayTitle, "꽃이 감사하다고 인사한다."),
                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for happy ending
                    const happyChoiceContainer = document.createElement('div');
                    happyChoiceContainer.className = 'button-container';
                    happyChoiceContainer.id = 'happyChoiceButtonContainer';
                    happyChoiceContainer.style.display = 'flex';
                    happyChoiceContainer.style.flexDirection = 'column';
                    happyChoiceContainer.style.gap = '15px';
                    happyChoiceContainer.style.alignItems = 'center';
                    happyChoiceContainer.style.marginTop = '20px';
                    
                    // Create happy ending choice button
                    const goHomeHappyButton = document.createElement('button');
                    goHomeHappyButton.id = 'goHomeHappy';
                    goHomeHappyButton.className = 'dot-btn';
                    goHomeHappyButton.textContent = '기쁜 마음으로 귀가한다.';
                    
                    // Add click event for happy ending button
                    goHomeHappyButton.addEventListener('click', async function() {
                        console.log('User chose to go home happily');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('happyChoiceButtonContainer');
                        
                        // Apply fade effects
                        await Promise.all([
                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg"),
                            changeTextWithFade(wayTitle, "집에 도착했다."),
                            currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                        ]);
                        
                        // Create new choice button container for entering home
                        const homeChoiceContainer = document.createElement('div');
                        homeChoiceContainer.className = 'button-container';
                        homeChoiceContainer.id = 'happyHomeChoiceButtonContainer';
                        homeChoiceContainer.style.display = 'flex';
                        homeChoiceContainer.style.flexDirection = 'column';
                        homeChoiceContainer.style.gap = '15px';
                        homeChoiceContainer.style.alignItems = 'center';
                        homeChoiceContainer.style.marginTop = '20px';
                        
                        const enterHomeButton = document.createElement('button');
                        enterHomeButton.id = 'enterHappyHome';
                        enterHomeButton.className = 'dot-btn';
                        enterHomeButton.textContent = '문을 열고 들어간다';
                        
                        // Add click event for enter home button (ending sequence)
                        enterHomeButton.addEventListener('click', function() {
                            console.log('User chose to enter home (happy ending)');
                            
                            // Change image to door_opened
                            doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                            
                            // Connect last circle to first circle (complete the loop)
                            if (circles.length >= 2) {
                                const lastCircle = circles[circles.length - 1]; // The last existing circle
                                const firstCircle = circles[0]; // The first circle (below home.svg)
                                
                                // Draw connecting line from last to first circle
                                drawConnectingLine(lastCircle, firstCircle);
                                
                                // Wait for the line drawing animation to complete (2 seconds), then start ending sequence
                                setTimeout(() => {
                                    // Start fade out effect
                                    doorImage.style.transition = 'opacity 1s ease-out';
                                    doorImage.style.opacity = '0';
                                    
                                    const currentContainer = document.getElementById('happyHomeChoiceButtonContainer');
                                    if (currentContainer) {
                                        currentContainer.style.transition = 'opacity 1s ease-out';
                                        currentContainer.style.opacity = '0';
                                    }
                                    
                                    const wayTitle = document.getElementById('wayTitle');
                                    wayTitle.style.transition = 'opacity 1s ease-out';
                                    wayTitle.style.opacity = '0';
                                    
                                    // After fade out, change to ending scene
                                    setTimeout(() => {
                                        // Change image to sunset
                                        doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                        doorImage.style.opacity = '1';
                                        
                                        // Change text
                                        wayTitle.innerHTML = "오늘 하루도 끝이 났다...";
                                        wayTitle.style.opacity = '1';
                                        
                                        // Hide previous container
                                        if (currentContainer) {
                                            currentContainer.style.display = 'none';
                                        }
                                        
                                        // Create ending choice button container
                                        const endingChoiceContainer = document.createElement('div');
                                        endingChoiceContainer.className = 'button-container';
                                        endingChoiceContainer.id = 'happyEndingChoiceButtonContainer';
                                        endingChoiceContainer.style.display = 'flex';
                                        endingChoiceContainer.style.flexDirection = 'column';
                                        endingChoiceContainer.style.gap = '15px';
                                        endingChoiceContainer.style.alignItems = 'center';
                                        endingChoiceContainer.style.marginTop = '20px';
                                        endingChoiceContainer.style.opacity = '0';
                                        
                                        const restartButton = document.createElement('button');
                                        restartButton.id = 'happyRestart';
                                        restartButton.className = 'dot-btn';
                                        restartButton.textContent = '처음으로 돌아가기';
                                        
                                        // Add click event for restart button
                                        restartButton.addEventListener('click', function() {
                                            console.log('User chose to restart (happy ending)');
                                            // Refresh the page
                                            location.reload();
                                        });
                                        
                                        // Add button to container
                                        endingChoiceContainer.appendChild(restartButton);
                                        
                                        // Add container to choice section
                                        const choiceSection = document.querySelector('.choice-section');
                                        choiceSection.appendChild(endingChoiceContainer);
                                        
                                        // Fade in ending elements
                                        setTimeout(() => {
                                            endingChoiceContainer.style.transition = 'opacity 1s ease-in';
                                            endingChoiceContainer.style.opacity = '1';
                                        }, 100);
                                        
                                    }, 1000); // Wait 1 second for fade out to complete
                                    
                                }, 2000); // Wait 2 seconds for line drawing to complete
                            }
                            
                            // Add button click effect
                            this.style.transform = 'scale(0.95)';
                            setTimeout(() => {
                                this.style.transform = 'scale(1)';
                            }, 150);
                        });
                        
                        // Add button to container
                        homeChoiceContainer.appendChild(enterHomeButton);
                        
                        // Add container to choice section
                        const choiceSection = document.querySelector('.choice-section');
                        choiceSection.appendChild(homeChoiceContainer);
                        
                        // Generate circle and connecting line
                        generateRandomCircle();
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                    });
                    
                    // Add button to happy container
                    happyChoiceContainer.appendChild(goHomeHappyButton);
                    
                    // Add happy choice container to choice section
                    const choiceSection = document.querySelector('.choice-section');
                    choiceSection.appendChild(happyChoiceContainer);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                notWaterPlantButton.addEventListener('click', async function() {
                    console.log('User chose not to water the plant');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('plantChoiceButtonContainer');
                    
                    // Apply fade effects
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/badman.svg"),
                        changeTextWithFade(wayTitle, "꽃을 죽이다니. 나쁜 사람."),
                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for silence
                    const silenceChoiceContainer = document.createElement('div');
                    silenceChoiceContainer.className = 'button-container';
                    silenceChoiceContainer.id = 'silenceChoiceButtonContainer';
                    silenceChoiceContainer.style.display = 'flex';
                    silenceChoiceContainer.style.flexDirection = 'column';
                    silenceChoiceContainer.style.gap = '15px';
                    silenceChoiceContainer.style.alignItems = 'center';
                    silenceChoiceContainer.style.marginTop = '20px';
                    
                    // Create silence button
                    const silenceButton = document.createElement('button');
                    silenceButton.id = 'silence';
                    silenceButton.className = 'dot-btn';
                    silenceButton.textContent = '.....';
                    
                    // Add click event for silence button
                    silenceButton.addEventListener('click', async function() {
                        console.log('User chose silence');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('silenceChoiceButtonContainer');
                        
                        // Apply fade effects
                        await Promise.all([
                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg"),
                            changeTextWithFade(wayTitle, "묘한 찝찝함을 느끼며 집으로 돌아갔다..."),
                            currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                        ]);
                        
                        // Create new choice button container for home arrival
                        const homeArrivalContainer = document.createElement('div');
                        homeArrivalContainer.className = 'button-container';
                        homeArrivalContainer.id = 'homeArrivalButtonContainer';
                        homeArrivalContainer.style.display = 'flex';
                        homeArrivalContainer.style.flexDirection = 'column';
                        homeArrivalContainer.style.gap = '15px';
                        homeArrivalContainer.style.alignItems = 'center';
                        homeArrivalContainer.style.marginTop = '20px';
                        
                        // Create enter home button
                        const enterHomeButton = document.createElement('button');
                        enterHomeButton.id = 'enterCreepyHome';
                        enterHomeButton.className = 'dot-btn';
                        enterHomeButton.textContent = '문을 열고 들어간다';
                        
                        // Add click event for enter home button - ENDING SEQUENCE
                        enterHomeButton.addEventListener('click', async function() {
                            console.log('User chose to enter through the door - Starting ending sequence from creepy path');
                            
                            const wayTitle = document.getElementById('wayTitle');
                            const currentContainer = document.getElementById('homeArrivalButtonContainer');
                            const fadeDuration = 500;
                            
                            // Add button click effect
                            this.style.transform = 'scale(0.95)';
                            setTimeout(() => {
                                this.style.transform = 'scale(1)';
                            }, 150);
                            
                            // Step 1: Change to door_opened.svg (no fade) and fade out buttons
                            // Change door image immediately without fade
                            const doorImage = document.querySelector('.illust-container img');
                            if (doorImage) {
                                doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                            }
                            
                            // Hide current choice button
                            if (currentContainer) {
                                await fadeElement(currentContainer, false, fadeDuration);
                            }
                            
                            // Wait for transition to complete
                            await new Promise(resolve => setTimeout(resolve, fadeDuration));
                            
                            // Step 2: Change to sunset.svg and ending message
                            const currentImage = document.querySelector('.illust-container img');
                            if (currentImage) {
                                // Fade out current image and text
                                currentImage.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                                currentImage.style.opacity = '0';
                                wayTitle.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                                wayTitle.style.opacity = '0';
                                
                                // Wait for fade out to complete
                                await new Promise(resolve => setTimeout(resolve, fadeDuration));
                                
                                // Change image and text
                                currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                wayTitle.innerHTML = "오늘 하루도 끝났다...";
                                
                                // Fade in new content
                                currentImage.style.opacity = '1';
                                wayTitle.style.opacity = '1';
                            }
                            
                            // Step 3: Create restart button
                            const restartChoiceContainer = document.createElement('div');
                            restartChoiceContainer.className = 'button-container';
                            restartChoiceContainer.id = 'creepyRestartChoiceButtonContainer';
                            restartChoiceContainer.style.display = 'flex';
                            restartChoiceContainer.style.flexDirection = 'column';
                            restartChoiceContainer.style.gap = '15px';
                            restartChoiceContainer.style.alignItems = 'center';
                            restartChoiceContainer.style.marginTop = '20px';
                            
                            const restartButton = document.createElement('button');
                            restartButton.id = 'restartCreepy';
                            restartButton.className = 'dot-btn';
                            restartButton.textContent = '처음으로 돌아가기';
                            
                            // Add click event for restart button
                            restartButton.addEventListener('click', function() {
                                console.log('User chose to restart from creepy path - Reloading page');
                                // Page reload
                                location.reload();
                            });
                            
                            // Add restart button to container
                            restartChoiceContainer.appendChild(restartButton);
                            
                            // Add restart container to choice section
                            const choiceSection = document.getElementById('choiceSection');
                            choiceSection.appendChild(restartChoiceContainer);
                            
                            // Fade in restart button
                            fadeElement(restartChoiceContainer, true, fadeDuration);
                        });
                        
                        // Add button to home arrival container
                        homeArrivalContainer.appendChild(enterHomeButton);
                        
                        // Add home arrival container to choice section
                        choiceSection.appendChild(homeArrivalContainer);
                        
                        // Fade in new button
                        fadeElement(homeArrivalContainer, true);
                        
                        // Generate circle and connecting line
                        generateRandomCircle();
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                    });
                    
                    // Add button to silence container
                    silenceChoiceContainer.appendChild(silenceButton);
                    
                    // Add silence choice container to choice section
                    choiceSection.appendChild(silenceChoiceContainer);
                    
                    // Fade in new button
                    fadeElement(silenceChoiceContainer, true);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                // Add buttons to plant container
                plantChoiceContainer.appendChild(waterPlantButton);
                plantChoiceContainer.appendChild(notWaterPlantButton);
                
                // Add plant choice container to choice section
                const choiceSection = document.querySelector('.choice-section');
                choiceSection.appendChild(plantChoiceContainer);
                
                // Generate circle and connecting line
                generateRandomCircle();
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            // Add buttons to apology container
            apologyChoiceContainer.appendChild(apologizeButton);
            apologyChoiceContainer.appendChild(leaveQuietlyButton);
            
            // Add apology choice container to choice section
            const choiceSection = document.querySelector('.choice-section');
            choiceSection.appendChild(apologyChoiceContainer);
            
            // Generate circle and connecting line
            generateRandomCircle();
            
            // Add button click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
        
        notEnterStoreButton.addEventListener('click', async function() {
            console.log('User chose not to enter the store');
            
            const wayTitle = document.getElementById('wayTitle');
            const currentContainer = document.getElementById('storeChoiceButtonContainer');
            
            // Apply fade effects
            await Promise.all([
                changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/wonder.svg"),
                changeTextWithFade(wayTitle, "바쁜데 나중에 가자.<br>근데 뭐하려고 했지?"),
                currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
            ]);
            
            // Create new choice button container for remembering options
            const rememberChoiceContainer = document.createElement('div');
            rememberChoiceContainer.className = 'button-container';
            rememberChoiceContainer.id = 'rememberChoiceButtonContainer';
            rememberChoiceContainer.style.display = 'flex';
            rememberChoiceContainer.style.flexDirection = 'column';
            rememberChoiceContainer.style.gap = '15px';
            rememberChoiceContainer.style.alignItems = 'center';
            rememberChoiceContainer.style.marginTop = '20px';
            
            // Create first remember choice button
            const rememberFriendButton = document.createElement('button');
            rememberFriendButton.id = 'rememberFriend';
            rememberFriendButton.className = 'dot-btn';
            rememberFriendButton.textContent = '아, 친구를 만나려고 했지.';
            
            // Create second remember choice button
            const rememberBookButton = document.createElement('button');
            rememberBookButton.id = 'rememberBook';
            rememberBookButton.className = 'dot-btn';
            rememberBookButton.textContent = '아, 빌린 책을 반납하려 했지.';
            
            // Add click events for remember buttons
            rememberFriendButton.addEventListener('click', async function() {
                console.log('User remembered to meet friend');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('rememberChoiceButtonContainer');
                
                // Apply fade effects
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/bench.svg"),
                    changeTextWithFade(wayTitle, "친구를 만나러 공원에 도착했다.<br>벤치에 앉은 나는 옆자리에서 기묘함을 느낀다.<br>돌아볼까?"),
                    currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                ]);
                
                // Create new choice button container for bench options
                const benchChoiceContainer = document.createElement('div');
                benchChoiceContainer.className = 'button-container';
                benchChoiceContainer.id = 'benchChoiceButtonContainer';
                benchChoiceContainer.style.display = 'flex';
                benchChoiceContainer.style.flexDirection = 'column';
                benchChoiceContainer.style.gap = '15px';
                benchChoiceContainer.style.alignItems = 'center';
                benchChoiceContainer.style.marginTop = '20px';
                
                // Create first bench choice button
                const lookBackButton = document.createElement('button');
                lookBackButton.id = 'lookBack';
                lookBackButton.className = 'dot-btn';
                lookBackButton.textContent = '돌아본다.';
                
                // Create second bench choice button
                const dontLookBackButton = document.createElement('button');
                dontLookBackButton.id = 'dontLookBack';
                dontLookBackButton.className = 'dot-btn';
                dontLookBackButton.textContent = '돌아보지 않는다.';
                
                // Add click events for bench buttons
                                lookBackButton.addEventListener('click', async function() {
                    console.log('User chose to look back');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('benchChoiceButtonContainer');
                    
                    // Get the image element
                    const doorImage = document.querySelector('.illust-container img');
                    
                    // Hide buttons and clear everything first
                    await Promise.all([
                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve(),
                        fadeElement(wayTitle, false),
                        doorImage ? fadeElement(doorImage, false) : Promise.resolve()
                    ]);
                    
                    // Clear the text and reset opacity
                    wayTitle.innerHTML = '';
                    wayTitle.style.opacity = '1';
                    wayTitle.style.display = 'block';
                    
                    // First line appears
                    setTimeout(() => {
                        wayTitle.innerHTML = '옆을 돌아본 나는...';
                    }, 500);
                    
                    // Second line appears
                    setTimeout(() => {
                        wayTitle.innerHTML = '옆을 돌아본 나는...<br>아무도 없었다!';
                        
                        // Change image after text is complete
                        setTimeout(async () => {
                            // Ensure image element is available and visible before changing
                            const currentImage = document.querySelector('.illust-container img');
                            if (currentImage) {
                                // Make sure image container is visible
                                const illustContainer = document.querySelector('.illust-container');
                                if (illustContainer) {
                                    illustContainer.style.display = 'flex';
                                    illustContainer.style.opacity = '1';
                                }
                                
                                console.log('Changing image to none.svg');
                                // Use direct image change instead of fadeImage function
                                currentImage.style.transition = 'opacity 300ms ease-in-out';
                                currentImage.style.opacity = '0';
                                
                                setTimeout(() => {
                                    currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/none.svg";
                                    currentImage.style.opacity = '1';
                                }, 300);
                            } else {
                                console.error('Image element not found for none.svg');
                            }
                            
                            // White flash effect after image change
                            setTimeout(() => {
                                // Create white flash overlay
                                const flashOverlay = document.createElement('div');
                                flashOverlay.style.position = 'fixed';
                                flashOverlay.style.top = '0';
                                flashOverlay.style.left = '0';
                                flashOverlay.style.width = '100vw';
                                flashOverlay.style.height = '100vh';
                                flashOverlay.style.backgroundColor = 'white';
                                flashOverlay.style.zIndex = '9999';
                                flashOverlay.style.opacity = '0';
                                flashOverlay.style.transition = 'opacity 0.15s ease-in-out';
                                flashOverlay.style.pointerEvents = 'none';
                                
                                document.body.appendChild(flashOverlay);
                                
                                // Flash in
                                setTimeout(() => {
                                    flashOverlay.style.opacity = '1';
        }, 10);
        
                                // Flash out
                                setTimeout(() => {
                                    flashOverlay.style.opacity = '0';
                                    
                                    // Remove flash overlay
                                    setTimeout(() => {
                                        if (flashOverlay.parentNode) {
                                            flashOverlay.parentNode.removeChild(flashOverlay);
                                        }
                                    }, 150);
                                }, 150);
                                
                                // Start blur effect after flash
                                setTimeout(() => {
                                    // Apply blur effect to all elements
                                    const allElements = document.querySelectorAll('body, body *');
                                    allElements.forEach(element => {
                                        element.style.transition = 'filter 1s ease-in-out, opacity 1s ease-in-out';
                                        element.style.filter = 'blur(20px)';
                                        element.style.opacity = '0';
                                    });
                                    
                                    // After blur completes, restore immediately (no wait time)
                                    setTimeout(() => {
                                        // Change text and image during blur restoration
                                        wayTitle.innerHTML = "머쓱해하다가 친구를 만나고 집으로 돌아갔다.";
                                        doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg";
                                        
                                        allElements.forEach(element => {
                                            element.style.transition = 'filter 2s ease-in-out, opacity 2s ease-in-out';
                                            element.style.filter = 'blur(0px)';
                                            element.style.opacity = '1';
                                        });
                                        
                                        // After restoration, add the enter home button and connect to ending sequence
                                        setTimeout(() => {
                                            allElements.forEach(element => {
                                                element.style.transition = '';
                                                element.style.filter = '';
                                                element.style.opacity = '';
                                            });
                                            
                                            // Create new choice button container for home arrival
                                            const homeArrivalContainer = document.createElement('div');
                                            homeArrivalContainer.className = 'button-container';
                                            homeArrivalContainer.id = 'homeArrivalButtonContainer';
                                            homeArrivalContainer.style.display = 'flex';
                                            homeArrivalContainer.style.flexDirection = 'column';
                                            homeArrivalContainer.style.gap = '15px';
                                            homeArrivalContainer.style.alignItems = 'center';
                                            homeArrivalContainer.style.marginTop = '20px';
                                            
                                            // Create enter home button
                                            const enterHomeButton = document.createElement('button');
                                            enterHomeButton.id = 'enterHome';
                                            enterHomeButton.className = 'dot-btn';
                                            enterHomeButton.textContent = '문을 열고 들어간다';
                                            
                                            // Add click event for enter home button (connect to ending sequence)
                                            enterHomeButton.addEventListener('click', async function() {
                                                console.log('User is entering home - starting ending sequence');
                                                
                                                const wayTitle = document.getElementById('wayTitle');
                                                const currentContainer = document.getElementById('homeArrivalButtonContainer');
                                                
                                                // Change to door_opened image
                                                await changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg");
                                                
                                                // Connect last circle to first circle
                                                if (circles.length >= 2) {
                                                    const lastCircle = circles[circles.length - 1];
                                                    const firstCircle = circles[0];
                                                    drawConnectingLine(lastCircle, firstCircle);
                                                }
                                                
                                                // Wait for line to be drawn
                                                setTimeout(async () => {
                                                    // Fade out current elements
                                                    await Promise.all([
                                                        fadeElement(doorImage, false),
                                                        fadeElement(wayTitle, false),
                                                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                                                    ]);
                                                    
                                                    // Change to sunset scene
                                                    const currentImage = document.querySelector('.illust-container img');
                                                    if (currentImage) {
                                                        // Wait a moment before showing sunset elements
                                                        setTimeout(() => {
                                                            // Update image source and fade in
                                                            currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                                            currentImage.style.opacity = '1';
                                                            
                                                            // Update text and show
                                                            wayTitle.innerHTML = "오늘 하루도 끝이 났다...";
                                                            wayTitle.style.display = 'block';
                                                            wayTitle.style.opacity = '1';
                                                        }, 500);
                                                    }
                                                    
                                                    // Create restart button container
                                                    const restartContainer = document.createElement('div');
                                                    restartContainer.className = 'button-container';
                                                    restartContainer.id = 'restartButtonContainer';
                                                    restartContainer.style.display = 'flex';
                                                    restartContainer.style.flexDirection = 'column';
                                                    restartContainer.style.gap = '15px';
                                                    restartContainer.style.alignItems = 'center';
                                                    restartContainer.style.marginTop = '20px';
                                                    
                                                    // Create restart button
                                                    const restartButton = document.createElement('button');
                                                    restartButton.id = 'restart';
                                                    restartButton.className = 'dot-btn';
                                                    restartButton.textContent = '처음으로 돌아가기';
                                                    
                                                    // Add click event for restart button
                                                    restartButton.addEventListener('click', function() {
                                                        console.log('Restarting the game');
                                                        location.reload();
                                                    });
                                                    
                                                    // Add restart button to container
                                                    restartContainer.appendChild(restartButton);
                                                    
                                                    // Add restart container to choice section
                                                    choiceSection.appendChild(restartContainer);
                                                    
                                                    // Fade in restart button
                                                    fadeElement(restartContainer, true);
                                                    
                                                }, 2000); // Wait for line drawing to complete
                                                
                                                // Add button click effect
                                                this.style.transform = 'scale(0.95)';
                                                setTimeout(() => {
                                                    this.style.transform = 'scale(1)';
                                                }, 150);
                                            });
                                            
                                            // Add button to home arrival container
                                            homeArrivalContainer.appendChild(enterHomeButton);
                                            
                                            // Add home arrival container to choice section
                                            choiceSection.appendChild(homeArrivalContainer);
                                            
                                            // Fade in new button
                                            fadeElement(homeArrivalContainer, true);
                                            
                                        }, 2000); // Wait for restoration to complete
                                    }, 1000); // 1s blur (no additional wait time)
                                }, 300); // Start blur after flash ends
                            }, 300); // Flash starts 300ms after image change
                        }, 500); // Image change 500ms after second line appears
                    }, 2000); // Second line appears 2 seconds after first line
                    
                    // Generate circle and connecting line
        generateRandomCircle();
                    
        // Add button click effect
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 150);
    });
                
                dontLookBackButton.addEventListener('click', async function() {
                    console.log('User chose not to look back');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('benchChoiceButtonContainer');
                    
                    // Apply fade effects
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/friend.svg"),
                        changeTextWithFade(wayTitle, "돌아보지 않은 나는...<br>식은땀을 흘리다가 옆에서 들려온 친구의 목소리에 깨어났다."),
                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for friend scene
                    const friendChoiceContainer = document.createElement('div');
                    friendChoiceContainer.className = 'button-container';
                    friendChoiceContainer.id = 'friendChoiceButtonContainer';
                    friendChoiceContainer.style.display = 'flex';
                    friendChoiceContainer.style.flexDirection = 'column';
                    friendChoiceContainer.style.gap = '15px';
                    friendChoiceContainer.style.alignItems = 'center';
                    friendChoiceContainer.style.marginTop = '20px';
                    
                    // Create friend response button
                    const thankFriendButton = document.createElement('button');
                    thankFriendButton.id = 'thankFriend';
                    thankFriendButton.className = 'dot-btn';
                    thankFriendButton.textContent = '"덕분에 정신차렸다. 친구야."';
                    
                    // Add click event for friend button
                    thankFriendButton.addEventListener('click', async function() {
                        console.log('User thanked friend');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('friendChoiceButtonContainer');
                        
                        // Apply fade effects
                        await Promise.all([
                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg"),
                            changeTextWithFade(wayTitle, "친구에게 느꼈던 감각을 이야기하며 집으로 돌아갔다."),
                            currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                        ]);
                        
                        // Create new choice button container for home arrival
                        const homeArrivalContainer = document.createElement('div');
                        homeArrivalContainer.className = 'button-container';
                        homeArrivalContainer.id = 'homeArrivalButtonContainer';
                        homeArrivalContainer.style.display = 'flex';
                        homeArrivalContainer.style.flexDirection = 'column';
                        homeArrivalContainer.style.gap = '15px';
                        homeArrivalContainer.style.alignItems = 'center';
                        homeArrivalContainer.style.marginTop = '20px';
                        
                        // Create enter home button
                        const enterHomeButton = document.createElement('button');
                        enterHomeButton.id = 'enterFriendHome';
                        enterHomeButton.className = 'dot-btn';
                        enterHomeButton.textContent = '문을 열고 들어간다';
                        
                        // Add click event for enter home button - ENDING SEQUENCE
                        enterHomeButton.addEventListener('click', async function() {
                            console.log('User chose to enter through the door - Starting ending sequence from friend path');
                            
                            const wayTitle = document.getElementById('wayTitle');
                            const currentContainer = document.getElementById('homeArrivalButtonContainer');
                            const fadeDuration = 500;
                            
                            // Add button click effect
                            this.style.transform = 'scale(0.95)';
                            setTimeout(() => {
                                this.style.transform = 'scale(1)';
                            }, 150);
                            
                            // Step 1: Change to door_opened.svg (no fade) and fade out buttons
                            // Change door image immediately without fade
                            const doorImage = document.querySelector('.illust-container img');
                            if (doorImage) {
                                doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg";
                            }
                            
                            // Hide current choice button
                            if (currentContainer) {
                                await fadeElement(currentContainer, false, fadeDuration);
                            }
                            
                            // Wait for transition to complete
                            await new Promise(resolve => setTimeout(resolve, fadeDuration));
                            
                            // Step 2: Change to sunset.svg and ending message
                            const currentImage = document.querySelector('.illust-container img');
                            if (currentImage) {
                                // Fade out current image and text
                                currentImage.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                                currentImage.style.opacity = '0';
                                wayTitle.style.transition = `opacity ${fadeDuration}ms ease-in-out`;
                                wayTitle.style.opacity = '0';
                                
                                // Wait for fade out to complete
                                await new Promise(resolve => setTimeout(resolve, fadeDuration));
                                
                                // Change image and text
                                currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                wayTitle.innerHTML = "오늘 하루도 끝났다...";
                                
                                // Fade in new content
                                currentImage.style.opacity = '1';
                                wayTitle.style.opacity = '1';
                            }
                            
                            // Step 3: Create restart button
                            const restartChoiceContainer = document.createElement('div');
                            restartChoiceContainer.className = 'button-container';
                            restartChoiceContainer.id = 'friendRestartChoiceButtonContainer';
                            restartChoiceContainer.style.display = 'flex';
                            restartChoiceContainer.style.flexDirection = 'column';
                            restartChoiceContainer.style.gap = '15px';
                            restartChoiceContainer.style.alignItems = 'center';
                            restartChoiceContainer.style.marginTop = '20px';
                            
                            const restartButton = document.createElement('button');
                            restartButton.id = 'restartFriend';
                            restartButton.className = 'dot-btn';
                            restartButton.textContent = '처음으로 돌아가기';
                            
                            // Add click event for restart button
                            restartButton.addEventListener('click', function() {
                                console.log('User chose to restart from friend path - Reloading page');
                                // Page reload
                                location.reload();
                            });
                            
                            // Add restart button to container
                            restartChoiceContainer.appendChild(restartButton);
                            
                            // Add restart container to choice section
                            const choiceSection = document.getElementById('choiceSection');
                            choiceSection.appendChild(restartChoiceContainer);
                            
                            // Fade in restart button
                            fadeElement(restartChoiceContainer, true, fadeDuration);
                        });
                        
                        // Add button to home arrival container
                        homeArrivalContainer.appendChild(enterHomeButton);
                        
                        // Add home arrival container to choice section
                        choiceSection.appendChild(homeArrivalContainer);
                        
                        // Fade in new button
                        fadeElement(homeArrivalContainer, true);
                        
                        // Generate circle and connecting line
                        generateRandomCircle();
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                    });
                    
                    // Add button to friend container
                    friendChoiceContainer.appendChild(thankFriendButton);
                    
                    // Add friend choice container to choice section
                    choiceSection.appendChild(friendChoiceContainer);
                    
                    // Fade in new button
                    fadeElement(friendChoiceContainer, true);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                // Add buttons to bench container
                benchChoiceContainer.appendChild(lookBackButton);
                benchChoiceContainer.appendChild(dontLookBackButton);
                
                // Add bench choice container to choice section
                choiceSection.appendChild(benchChoiceContainer);
                
                // Fade in new buttons
                fadeElement(benchChoiceContainer, true);
                
                // Generate circle and connecting line
                generateRandomCircle();
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            rememberBookButton.addEventListener('click', async function() {
                console.log('User remembered to return book');
                
                const wayTitle = document.getElementById('wayTitle');
                const currentContainer = document.getElementById('rememberChoiceButtonContainer');
                
                // Apply fade effects
                await Promise.all([
                    changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/book.svg"),
                    changeTextWithFade(wayTitle, "책을 반납하러 도서관을 갔다.<br>반납하려는데 책에 붙어있는 쪽지를 발견한다."),
                    currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                ]);
                
                // Create new choice button container for book note options
                const bookNoteChoiceContainer = document.createElement('div');
                bookNoteChoiceContainer.className = 'button-container';
                bookNoteChoiceContainer.id = 'bookNoteChoiceButtonContainer';
                bookNoteChoiceContainer.style.display = 'flex';
                bookNoteChoiceContainer.style.flexDirection = 'column';
                bookNoteChoiceContainer.style.gap = '15px';
                bookNoteChoiceContainer.style.alignItems = 'center';
                bookNoteChoiceContainer.style.marginTop = '20px';
                
                // Create first book note choice button
                const ignoreNoteButton = document.createElement('button');
                ignoreNoteButton.id = 'ignoreNote';
                ignoreNoteButton.className = 'dot-btn';
                ignoreNoteButton.textContent = '쪽지를 무시한다.';
                
                // Create second book note choice button
                const readNoteButton = document.createElement('button');
                readNoteButton.id = 'readNote';
                readNoteButton.className = 'dot-btn';
                readNoteButton.textContent = '쪽지를 펼쳐본다.';
                
                // Add click events for book note buttons
                ignoreNoteButton.addEventListener('click', async function() {
                    console.log('User chose to ignore the note');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('bookNoteChoiceButtonContainer');
                    
                    // Apply fade effects
                    await Promise.all([
                        changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg"),
                        changeTextWithFade(wayTitle, "쪽지를 모른척하고 책을 잘 반납한 후에 집으로 돌아갔다."),
                        currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                    ]);
                    
                    // Create new choice button container for home arrival
                    const homeArrivalContainer = document.createElement('div');
                    homeArrivalContainer.className = 'button-container';
                    homeArrivalContainer.id = 'homeArrivalButtonContainer';
                    homeArrivalContainer.style.display = 'flex';
                    homeArrivalContainer.style.flexDirection = 'column';
                    homeArrivalContainer.style.gap = '15px';
                    homeArrivalContainer.style.alignItems = 'center';
                    homeArrivalContainer.style.marginTop = '20px';
                    
                    // Create enter home button
                    const enterHomeButton = document.createElement('button');
                    enterHomeButton.id = 'enterHome';
                    enterHomeButton.className = 'dot-btn';
                    enterHomeButton.textContent = '문을 열고 들어간다';
                    
                    // Add click event for enter home button (connect to ending sequence)
                    enterHomeButton.addEventListener('click', async function() {
                        console.log('User is entering home - starting ending sequence');
                        
                        const wayTitle = document.getElementById('wayTitle');
                        const currentContainer = document.getElementById('homeArrivalButtonContainer');
                        
                        // Change to door_opened image
                        await changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg");
                        
                        // Connect last circle to first circle
                        if (circles.length >= 2) {
                            const lastCircle = circles[circles.length - 1];
                            const firstCircle = circles[0];
                            drawConnectingLine(lastCircle, firstCircle);
                        }
                        
                        // Wait for line to be drawn
                        setTimeout(async () => {
                            // Fade out current elements
                            await Promise.all([
                                fadeElement(doorImage, false),
                                fadeElement(wayTitle, false),
                                currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                            ]);
                            
                            // Change to sunset scene
                            const currentImage = document.querySelector('.illust-container img');
                            if (currentImage) {
                                // Wait a moment before showing sunset elements
                                setTimeout(() => {
                                    // Update image source and fade in
                                    currentImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                    currentImage.style.opacity = '1';
                                    
                                    // Update text and show
                                    wayTitle.innerHTML = "오늘 하루도 끝이 났다...";
                                    wayTitle.style.display = 'block';
                                    wayTitle.style.opacity = '1';
                                }, 500);
                            }
                            
                            // Create restart button container
                            const restartContainer = document.createElement('div');
                            restartContainer.className = 'button-container';
                            restartContainer.id = 'restartButtonContainer';
                            restartContainer.style.display = 'flex';
                            restartContainer.style.flexDirection = 'column';
                            restartContainer.style.gap = '15px';
                            restartContainer.style.alignItems = 'center';
                            restartContainer.style.marginTop = '20px';
                            
                            // Create restart button
                            const restartButton = document.createElement('button');
                            restartButton.id = 'restart';
                            restartButton.className = 'dot-btn';
                            restartButton.textContent = '처음으로 돌아가기';
                            
                            // Add click event for restart button
                            restartButton.addEventListener('click', function() {
                                console.log('Restarting the game');
                                location.reload();
                            });
                            
                            // Add restart button to container
                            restartContainer.appendChild(restartButton);
                            
                            // Add restart container to choice section
                            choiceSection.appendChild(restartContainer);
                            
                            // Fade in restart button
                            fadeElement(restartContainer, true);
                            
                        }, 2000); // Wait for line drawing to complete
                        
                        // Add button click effect
                        this.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            this.style.transform = 'scale(1)';
                        }, 150);
                    });
                    
                    // Add button to home arrival container
                    homeArrivalContainer.appendChild(enterHomeButton);
                    
                    // Add home arrival container to choice section
                    choiceSection.appendChild(homeArrivalContainer);
                    
                    // Fade in new button
                    fadeElement(homeArrivalContainer, true);
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                readNoteButton.addEventListener('click', async function() {
                    console.log('User chose to read the note');
                    
                    const wayTitle = document.getElementById('wayTitle');
                    const currentContainer = document.getElementById('bookNoteChoiceButtonContainer');
                    const doorImage = document.querySelector('.illust-container img');
                    
                    // Hide current buttons
                    await fadeElement(currentContainer, false);
                    
                    // Clear the text first
                    wayTitle.innerHTML = '';
                    wayTitle.style.opacity = '1';
                    
                    // Text lines to appear sequentially
                    const textLines = [
                        '쪽지에 이렇게 적혀있었다.',
                        '.',
                        '.', 
                        '.',
                        '메롱'
                    ];
                    
                    // Display each line with 1 second interval
                    for (let i = 0; i < textLines.length; i++) {
                        setTimeout(() => {
                            if (i === 0) {
                                wayTitle.innerHTML = textLines[i];
                                // Fade out image when first line appears
                                if (doorImage) {
                                    doorImage.style.transition = 'opacity 300ms ease-in-out';
                                    doorImage.style.opacity = '0';
                                }
                            } else {
                                wayTitle.innerHTML += '<br>' + textLines[i];
                            }
                            
                            // After the last line appears, change image and create the choice button
                            if (i === textLines.length - 1) {
                                // Change image to merong.svg and fade it in
                                if (doorImage) {
                                    setTimeout(() => {
                                        doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/merong.svg";
                                        doorImage.style.opacity = '1';
                                    }, 300); // Wait for fade out to complete
                                }
                            }
                            
                            // After the last line appears, create the choice button
                            if (i === textLines.length - 1) {
                                setTimeout(() => {
                                    // Create new choice button container for go home option
                                    const goHomeChoiceContainer = document.createElement('div');
                                    goHomeChoiceContainer.className = 'button-container';
                                    goHomeChoiceContainer.id = 'goHomeChoiceButtonContainer';
                                    goHomeChoiceContainer.style.display = 'flex';
                                    goHomeChoiceContainer.style.flexDirection = 'column';
                                    goHomeChoiceContainer.style.gap = '15px';
                                    goHomeChoiceContainer.style.alignItems = 'center';
                                    goHomeChoiceContainer.style.marginTop = '20px';
                                    
                                    // Create go home button
                                    const goHomeButton = document.createElement('button');
                                    goHomeButton.id = 'goHome';
                                    goHomeButton.className = 'dot-btn';
                                    goHomeButton.textContent = '...집이나 가자.';
                                    
                                    // Add click event for go home button
                                    goHomeButton.addEventListener('click', async function() {
                                        console.log('User chose to go home after reading note');
                                        
                                        const wayTitle = document.getElementById('wayTitle');
                                        const currentContainer = document.getElementById('goHomeChoiceButtonContainer');
                                        
                                        // Apply fade effects
                                        await Promise.all([
                                            changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_closed.svg"),
                                            changeTextWithFade(wayTitle, "터덜터덜 걸어서 집에 도착했다..."),
                                            currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                                        ]);
                                        
                                        // Create new choice button container for home arrival
                                        const homeArrivalContainer = document.createElement('div');
                                        homeArrivalContainer.className = 'button-container';
                                        homeArrivalContainer.id = 'homeArrivalButtonContainer';
                                        homeArrivalContainer.style.display = 'flex';
                                        homeArrivalContainer.style.flexDirection = 'column';
                                        homeArrivalContainer.style.gap = '15px';
                                        homeArrivalContainer.style.alignItems = 'center';
                                        homeArrivalContainer.style.marginTop = '20px';
                                        
                                        // Create enter home button
                                        const enterHomeButton = document.createElement('button');
                                        enterHomeButton.id = 'enterHome';
                                        enterHomeButton.className = 'dot-btn';
                                        enterHomeButton.textContent = '문을 열고 들어간다';
                                        
                                        // Add click event for enter home button (connect to ending sequence)
                                        enterHomeButton.addEventListener('click', async function() {
                                            console.log('User is entering home - starting ending sequence');
                                            
                                            const wayTitle = document.getElementById('wayTitle');
                                            const currentContainer = document.getElementById('homeArrivalButtonContainer');
                                            
                                            // Change to door_opened image
                                            await changeImageWithFade("/Users/dachan/Desktop/designcamp/mjc/source/door_opened.svg");
                                            
                                            // Connect last circle to first circle
                                            if (circles.length >= 2) {
                                                const lastCircle = circles[circles.length - 1];
                                                const firstCircle = circles[0];
                                                drawConnectingLine(lastCircle, firstCircle);
                                            }
                                            
                                            // Wait for line to be drawn
                                            setTimeout(async () => {
                                                // Fade out current elements
                                                await Promise.all([
                                                    // Fade out image properly
                                                    new Promise((resolve) => {
                                                        doorImage.style.transition = 'opacity 500ms ease-in-out';
                                                        doorImage.style.opacity = '0';
                                                        setTimeout(resolve, 500);
                                                    }),
                                                    fadeElement(wayTitle, false),
                                                    currentContainer ? fadeElement(currentContainer, false) : Promise.resolve()
                                                ]);
                                                
                                                // Change to sunset scene
                                                // Wait a moment before showing sunset elements
                                                setTimeout(() => {
                                                    // Update image source and fade in
                                                    doorImage.src = "/Users/dachan/Desktop/designcamp/mjc/source/sunset.svg";
                                                    doorImage.style.opacity = '1';
                                                    
                                                    // Update text and show
                                                    wayTitle.innerHTML = "오늘 하루도 끝이 났다...";
                                                    wayTitle.style.display = 'block';
                                                    wayTitle.style.opacity = '1';
                                                }, 500);
                                                
                                                // Create restart button container after sunset appears
                                                setTimeout(() => {
                                                    const restartContainer = document.createElement('div');
                                                    restartContainer.className = 'button-container';
                                                    restartContainer.id = 'restartButtonContainer';
                                                    restartContainer.style.display = 'flex';
                                                    restartContainer.style.flexDirection = 'column';
                                                    restartContainer.style.gap = '15px';
                                                    restartContainer.style.alignItems = 'center';
                                                    restartContainer.style.marginTop = '20px';
                                                    
                                                    // Create restart button
                                                    const restartButton = document.createElement('button');
                                                    restartButton.id = 'restart';
                                                    restartButton.className = 'dot-btn';
                                                    restartButton.textContent = '처음으로 돌아가기';
                                                    
                                                    // Add click event for restart button
                                                    restartButton.addEventListener('click', function() {
                                                        console.log('Restarting the game');
                                                        location.reload();
                                                    });
                                                    
                                                    // Add restart button to container
                                                    restartContainer.appendChild(restartButton);
                                                    
                                                    // Add restart container to choice section
                                                    choiceSection.appendChild(restartContainer);
                                                    
                                                    // Fade in restart button
                                                    fadeElement(restartContainer, true);
                                                }, 1500); // Show restart button 1.5 seconds after sunset appears
                                                
                                            }, 2000); // Wait for line drawing to complete
                                            
                                            // Add button click effect
                                            this.style.transform = 'scale(0.95)';
                                            setTimeout(() => {
                                                this.style.transform = 'scale(1)';
                                            }, 150);
                                        });
                                        
                                        // Add button to home arrival container
                                        homeArrivalContainer.appendChild(enterHomeButton);
                                        
                                        // Add home arrival container to choice section
                                        choiceSection.appendChild(homeArrivalContainer);
                                        
                                        // Fade in new button
                                        fadeElement(homeArrivalContainer, true);
                                        
                                        // Generate circle and connecting line
                                        generateRandomCircle();
                                        
                                        // Add button click effect
                                        this.style.transform = 'scale(0.95)';
                                        setTimeout(() => {
                                            this.style.transform = 'scale(1)';
                                        }, 150);
                                    });
                                    
                                    // Add button to go home container
                                    goHomeChoiceContainer.appendChild(goHomeButton);
                                    
                                    // Add go home choice container to choice section
                                    choiceSection.appendChild(goHomeChoiceContainer);
                                    
                                    // Fade in new button
                                    fadeElement(goHomeChoiceContainer, true);
                                }, 500); // Wait 0.5s after last line before showing button
                            }
                        }, i * 1000); // 1 second interval between lines
                    }
                    
                    // Generate circle and connecting line
                    generateRandomCircle();
                    
                    // Add button click effect
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
                
                // Add buttons to book note container
                bookNoteChoiceContainer.appendChild(ignoreNoteButton);
                bookNoteChoiceContainer.appendChild(readNoteButton);
                
                // Add book note choice container to choice section
                choiceSection.appendChild(bookNoteChoiceContainer);
                
                // Fade in new buttons
                fadeElement(bookNoteChoiceContainer, true);
                
                // Generate circle and connecting line
                generateRandomCircle();
                
                // Add button click effect
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
            });
            
            // Add buttons to remember container
            rememberChoiceContainer.appendChild(rememberFriendButton);
            rememberChoiceContainer.appendChild(rememberBookButton);
            
            // Add remember choice container to choice section
            choiceSection.appendChild(rememberChoiceContainer);
            
            // Fade in new buttons
            fadeElement(rememberChoiceContainer, true);
            
            // Generate circle and connecting line
            generateRandomCircle();
            
            // Add button click effect
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Add buttons to new container
        newChoiceContainer.appendChild(enterStoreButton);
        newChoiceContainer.appendChild(notEnterStoreButton);
        
        // Add new choice container to choice section
        choiceSection.appendChild(newChoiceContainer);
        
        // Fade in new buttons
        fadeElement(newChoiceContainer, true);
        
        console.log('goNewWay button clicked');
    }
    
    // Handle window resize to ensure circles stay within map section
    window.addEventListener('resize', function() {
        // Remove all existing circles and lines when window is resized
        const existingCircles = document.querySelectorAll('.random-circle');
        const existingLines = document.querySelectorAll('svg');
        const existingBackgroundCircles = document.querySelectorAll('.background-circle');
        
        existingCircles.forEach(circle => {
            circle.remove();
        });
        
        existingLines.forEach(line => {
            line.remove();
        });
        
        existingBackgroundCircles.forEach(bgCircle => {
            bgCircle.remove();
        });
        
        // Clear circles array
        circles = [];
        
        // Reinitialize grid sections
        initializeGridSections();
        
        console.log('Circles and lines cleared on resize, grid sections reinitialized');
    });
    
    // Initialize grid sections
    initializeGridSections();
    
    // Prevent double-click, scroll, and zoom
    preventUserInteractions();
    
    console.log('Map and choice layout initialized with 3x3 grid system and circular connection');
});

// Function to prevent unwanted user interactions
function preventUserInteractions() {
    // Prevent double-click zoom
    document.addEventListener('dblclick', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Prevent scroll (wheel events)
    document.addEventListener('wheel', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Prevent touch scroll and zoom gestures
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault(); // Prevent multi-touch gestures
        }
    }, { passive: false });
    
    document.addEventListener('touchmove', function(e) {
        e.preventDefault(); // Prevent touch scrolling
    }, { passive: false });
    
    document.addEventListener('touchend', function(e) {
        e.preventDefault();
    }, { passive: false });
    
    // Prevent keyboard zoom (Ctrl + +/-, Ctrl + 0)
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
            e.preventDefault();
        }
        // Prevent F11 (fullscreen)
        if (e.key === 'F11') {
            e.preventDefault();
        }
        // Prevent spacebar and arrow keys (page scroll)
        if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
            e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
            e.key === 'PageUp' || e.key === 'PageDown' || 
            e.key === 'Home' || e.key === 'End') {
            e.preventDefault();
        }
    });
    
    // Prevent context menu (right-click)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });
    
    // Prevent drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
    
    console.log('User interaction prevention activated');
}
