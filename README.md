# Interactive Display Ads for HbbTV

Create customized display ads for an HbbTV application.

## Documentation

The underlying concept of our architecture:

![Concept](./docs/architecture.png)

Preview of our web-editor:

![Editor](./docs/editor_preview.PNG)

## Getting Started

### Prerequisites:
- Preinstalled emulator on your browser (like HybridTV Dev Environment or Hybrid TV viewer)
- Node package manager installed
- A monitor with at least 1920 x 1080 resolution since the hbbTV screen already has 1280 x 720
- Chrome Browser is recommended

### Steps to make our project run:
1. Download or clone our repository
2. Go to awt-da-editor and run: npm install
3. Go to awt-da-webserver and run: npm install
4. Start the editor and the webserver seperately with: npm start
5. Go to awt-da-app and run the HTML file in your browser
6. Start the HbbTV plugin for your browser
7. Press the red button
8. Enjoy the show

### Limitations
- Advertisers can choose only one type of ad interactivity in the web editor
- It is not possible to place video URLs inside an ad, only image URLs
- The HbbTV app only displays a static background image upon launch, no video

## Disclaimer

This prototype is developed in context of the *Master Project: Advanced Web Technologies* at the TU Berlin
in the winter term 2022/23.



