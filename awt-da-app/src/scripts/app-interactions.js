
// Scene implementation
var scene = {
    theAppObject: null,
    appAreaDiv: null,
    ad: null,                    // Holds the ad object
    refreshIntervalId: null,    // Defines the ID for the intervall call of getInstance
    currentImageIndex: 0,       // Defines the current index of the image that is shown in the ad
    isAppAreaVisible: false,
    redButtonDiv: null,
    lastNavigationButtonPressed: null,
    lastPlaybackButtonPressed: null,
    lastNumericButtonPressed: null,
    shouldReactToPlaybackButtons: false,
    shouldReactToNumericButtons: false,
    timeout: 0,

    initialize: function (appObj) {
        this.theAppObject = appObj;
        this.appAreaDiv = document.getElementById('app_area');
        this.ad = document.getElementById("ad");
        this.redButtonDiv = document.getElementById('red_button_notification_field');
        // Register RC button event listener
        rcUtils.registerKeyEventListener();

        // Initial state is app_area hidden
        this.hideAppArea();

        // Render the scene so it is ready to be shown
        this.render();
    },
    getRelevantButtonsMask: function () {
        // Mask includes color buttons
        var mask = rcUtils.MASK_CONSTANT_RED + rcUtils.MASK_CONSTANT_GREEN + rcUtils.MASK_CONSTANT_YELLOW + rcUtils.MASK_CONSTANT_BLUE;
        // And navigation
        mask += rcUtils.MASK_CONSTANT_NAVIGATION;
        // Add playback buttons if scene should react to them
        if (this.shouldReactToPlaybackButtons) { mask += rcUtils.MASK_CONSTANT_PLAYBACK; }
        // Add numeric buttons if scene should react to them
        if (this.shouldReactToNumericButtons) { mask += rcUtils.MASK_CONSTANT_NUMERIC; }
        // Return calculated button mask  
        return mask;
    },
    showAppArea: function () {
        this.appAreaDiv.style.visibility = 'visible';
        this.redButtonDiv.style.visibility = 'hidden';
        this.isAppAreaVisible = true;
        // When shown, app reacts to all buttons relevant on the scene
        rcUtils.setKeyset(this.theAppObject, this.getRelevantButtonsMask());

        // Start interval call when app is visible to show a random ad every 30 seconds
        this.refreshIntervalId = setInterval(function () {
            scene.currentImageIndex = 0;
            getInstance();
        }, 30000);

    },
    hideAppArea: function () {
        this.appAreaDiv.style.visibility = 'hidden';
        this.ad.style.visibility = 'hidden';
        this.redButtonDiv.style.visibility = 'visible';
        this.isAppAreaVisible = false;

        // Stop interval call when app is hidden
        clearInterval(this.refreshIntervalId);
        // When hidden, app reacts only to red button key press (show app scene)
        rcUtils.setKeyset(this.theAppObject, rcUtils.MASK_CONSTANT_RED);
    },
    render: function () {
        var navigationField = document.getElementById('navigation_field');
        var playbackField = document.getElementById('playback_field');
        var togglePlaybackField = document.getElementById('toggle_playback_field');
        var numericField = document.getElementById('numeric_field');
        var toggleNumericField = document.getElementById('toggle_numeric_field');
        var preventField = document.getElementById('prevent_field');


        // Do navigation buttons
        if (this.lastNavigationButtonPressed === null) {
            navigationField.innerHTML = 'Please press one of the navigation buttons (arrows, OK/ENTER, back).';
        }
        else {
            navigationField.innerHTML = this.lastNavigationButtonPressed;
        }
        // Do playback buttons
        if (this.shouldReactToPlaybackButtons) {
            if (this.lastPlaybackButtonPressed === null) {
                playbackField.innerHTML = 'Please press one of the playback buttons (trick play controls).';
            }
            else {
                playbackField.innerHTML = this.lastPlaybackButtonPressed;
            }
            togglePlaybackField.innerHTML = 'Disable playback buttons';
        }
        else {
            playbackField.innerHTML = 'Please press the green button to enable playback buttons.';
            togglePlaybackField.innerHTML = 'Enable playback buttons';
        }
        // Do numeric buttons
        if (this.shouldReactToNumericButtons) {
            if (this.lastNumericButtonPressed === null) {
                numericField.innerHTML = 'Please press one of the numeric buttons (0 ... 9).';
            }
            else {
                numericField.innerHTML = this.lastNumericButtonPressed;
            }
            toggleNumericField.innerHTML = 'Disable numeric buttons';
        }
        else {
            numericField.innerHTML = 'Please press the yellow button to enable numeric buttons.';
            toggleNumericField.innerHTML = 'Enable numeric buttons';
        }
        // Do prevent field
        preventField.innerHTML = 'Please press the blue button to change ad images.';
    },
    timerTick: function () {
        // Check if timeout occured
        if (scene.timeout > 0) {
            // Not yet, display message
            var preventField = document.getElementById('prevent_field');
            preventField.innerHTML = 'The app shall not receive RC button events for ' + scene.timeout + ' seconds.';
            // Decrement timeout and reschedule for 1 second
            scene.timeout--;
            setTimeout(scene.timerTick, 1000);
        }
        else {
            // Timeout occured, start reacting to buttons again
            rcUtils.setKeyset(scene.theAppObject, scene.getRelevantButtonsMask());
            // And rerender scene
            scene.render();
        }
    }
};

// RC button press handler function
function handleKeyCode(kc) {
    try {
        var shouldRender = true;
        // Process buttons
        switch (kc) {
            case VK_RED:
                // Red button shows & hides the app scene
                if (scene.isAppAreaVisible) {
                    scene.hideAppArea();
                }
                else {
                    scene.showAppArea();
                }
                // No need to rerender complete scene
                shouldRender = false;
                break;
            case VK_GREEN:
                // Green button toggles playback buttons
                if (scene.shouldReactToPlaybackButtons) {
                    scene.shouldReactToPlaybackButtons = false;
                }
                else {
                    scene.shouldReactToPlaybackButtons = true;
                    scene.lastPlaybackButtonPressed = null;
                }
                rcUtils.setKeyset(scene.theAppObject, scene.getRelevantButtonsMask());
                break;
            case VK_YELLOW:
                // Yellow button toggles numeric buttons
                if (scene.shouldReactToNumericButtons) {
                    scene.shouldReactToNumericButtons = false;
                }
                else {
                    scene.shouldReactToNumericButtons = true;
                    scene.lastNumericButtonPressed = null;
                }
                rcUtils.setKeyset(scene.theAppObject, scene.getRelevantButtonsMask());
                break;
            case VK_BLUE:
                // Blue button changes images in ad
                let images = document.getElementById('ad').getElementsByTagName('img');
                
                if (images.length > 1) {
                    images[scene.currentImageIndex].style.display = "none";
                    scene.currentImageIndex = (scene.currentImageIndex + 1) % images.length;
                    images[scene.currentImageIndex].style.display = "block";
                } else {
                    scene.currentImageIndex = 0;
                }

                break;
            case VK_LEFT:
                // Left button
                scene.lastNavigationButtonPressed = 'LEFT';
                break;
            case VK_RIGHT:
                // Right button
                scene.lastNavigationButtonPressed = 'RIGHT';
                break;
            case VK_DOWN:
                // Down button
                scene.lastNavigationButtonPressed = 'DOWN';
                break;
            case VK_UP:
                // Up button
                scene.lastNavigationButtonPressed = 'UP';
                break;
            case VK_ENTER:
                // OK/ENTER button
                scene.lastNavigationButtonPressed = 'OK / ENTER';
                break;
            case VK_BACK:
                // BACK button
                scene.lastNavigationButtonPressed = 'BACK';
                break;
            case VK_PLAY:
                // PLAY button
                scene.lastPlaybackButtonPressed = 'PLAY';
                break;
            case VK_PAUSE:
                // PAUSE button
                scene.lastPlaybackButtonPressed = 'PAUSE';
                break;
            case VK_PLAY_PAUSE:
                // PLAY / PAUSE button
                scene.lastPlaybackButtonPressed = 'PLAY / PAUSE';
                break;
            case VK_STOP:
                // STOP button
                scene.lastPlaybackButtonPressed = 'STOP';
                break;
            case VK_FAST_FWD:
                // FFWD button
                scene.lastPlaybackButtonPressed = 'FFWD';
                break;
            case VK_REWIND:
                // RWD button
                scene.lastPlaybackButtonPressed = 'RWD';
                break;
            case VK_0:
                // 0 numeric button
                scene.lastNumericButtonPressed = '0';
                break;
            case VK_1:
                // 1 numeric button
                scene.lastNumericButtonPressed = '1';
                break;
            case VK_2:
                // 2 numeric button
                scene.lastNumericButtonPressed = '2';
                break;
            case VK_3:
                // 3 numeric button
                scene.lastNumericButtonPressed = '3';
                break;
            case VK_4:
                // 4 numeric button
                scene.lastNumericButtonPressed = '4';
                break;
            case VK_5:
                // 5 numeric button
                scene.lastNumericButtonPressed = '5';
                break;
            case VK_6:
                // 6 numeric button
                scene.lastNumericButtonPressed = '6';
                break;
            case VK_7:
                // 7 numeric button
                scene.lastNumericButtonPressed = '7';
                break;
            case VK_8:
                // 8 numeric button
                scene.lastNumericButtonPressed = '8';
                break;
            case VK_9:
                // 9 numeric button
                scene.lastNumericButtonPressed = '9';
                break;
            default:
                // Pressed unhandled key
                shouldRender = false;
        }
        if (shouldRender) {
            // Render scene
            scene.render();
        }
    }
    catch (e) {
        // Pressed unhandled key, catch the error
    }
    // We return true to prevent default action for processed keys
    return true;
}

// App entry function
function start() {
    try {

        // Attempt to acquire the Application object
        var appManager = document.getElementById('applicationManager');
        var appObject = appManager.getOwnerApplication(document);
        // Check if Application object was a success
        if (appObject === null) {
            // Error acquiring the Application object!
        }
        else {
            // We have the Application object, and we can initialize the scene and show our app
            scene.initialize(appObject);
            appObject.show();
        }
    }
    catch (e) {
        // This is not an HbbTV client, catch the error.
    }
}
