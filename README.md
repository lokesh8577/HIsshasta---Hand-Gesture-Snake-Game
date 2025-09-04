# 🐍 Snake Game with Hand Gesture Controls

A modern web-based Snake game featuring both traditional keyboard controls and innovative hand gesture recognition using computer vision. Play the classic Snake game with your hands!

## 🌟 Features

### 🎮 Dual Control Modes
- **Keyboard Controls**: Classic arrow key gameplay with customizable key bindings
- **Hand Gesture Controls**: Revolutionary camera-based hand tracking for movement
- **Mobile Support**: Touch gestures and swipe controls for mobile devices

### 🎯 Game Features
- **Real-time Gameplay**: Smooth 60 FPS gaming experience
- **Smart Snake AI**: Realistic snake movement with head, body, and tail animations
- **Multiple Food Types**: Apple, banana, cherry, grape, orange, strawberry, and watermelon
- **Customizable Settings**: Adjustable game speed, grid size, and growth rate
- **Pause Functionality**: Pause/resume with keyboard or hand gestures

### 👥 Social Features
- **User Authentication**: Secure Firebase-based login system
- **Global Leaderboards**: Separate rankings for keyboard and gesture modes
- **Score History**: Track your personal gaming statistics
- **Real-time Updates**: Live leaderboard updates during gameplay

### 🎨 Visual & Audio
- **Modern UI**: Responsive design with dark/light theme support
- **Sound Effects**: Immersive audio with background music and game sounds
- **Visual Feedback**: Real-time gesture recognition display
- **Mobile Responsive**: Optimized for all device sizes

## 🚀 Technology Stack

### Backend
- **Flask**: Python web framework
- **OpenCV**: Computer vision for hand tracking
- **CVZone**: Hand detection and tracking
- **TensorFlow**: Machine learning model for gesture recognition
- **Firebase Admin SDK**: User authentication and data storage

### Frontend
- **Vanilla JavaScript**: Core game logic and UI interactions
- **HTML5 Canvas**: Game rendering and animations
- **CSS3**: Modern styling with responsive design
- **Firebase Web SDK**: Client-side authentication

### Infrastructure
- **Render**: Cloud deployment platform
- **Firebase Firestore**: Real-time database for leaderboards
- **Firebase Authentication**: Secure user management

## 🎯 How to Play

### Keyboard Mode
1. Select "Keyboard Controls" from the main menu
2. Use arrow keys to control the snake:
   - ⬆️ Arrow Up: Move up
   - ⬇️ Arrow Down: Move down
   - ⬅️ Arrow Left: Move left
   - ➡️ Arrow Right: Move right
   - Space: Pause/Resume
3. Eat food to grow and increase your score
4. Avoid hitting walls or the snake's own body

### Gesture Mode
1. Select "Hand Gesture Controls" from the main menu
2. Allow camera access when prompted
3. Show your hand to the camera and use these gestures:
   - ✋ Hand pointing up: Move up
   - ✋ Hand pointing down: Move down
   - ✋ Hand pointing left: Move left
   - ✋ Hand pointing right: Move right
   - ✊ Stop gesture: Pause/Resume
4. Ensure good lighting and keep your hand visible to the camera

### Scoring System
- **10 points** per food item consumed
- **Bonus multipliers** for consecutive food collection
- **Separate leaderboards** for keyboard and gesture modes
- **Personal high scores** tracked across sessions

## 🛠️ Installation & Development

### Prerequisites
- Python 3.8+
- Webcam (for gesture controls)
- Modern web browser with camera support

### Local Setup
1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snake-game-gesture-controls.git
   cd snake-game-gesture-controls
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

### Project Structure
```
snake-game-gesture-controls/
├── app.py                 # Main Flask application
├── static/
│   ├── js/
│   │   ├── script.js     # Game logic and UI
│   │   └── sound.js      # Audio management
│   ├── css/
│   │   └── style.css     # Styling and themes
│   ├── img/              # Game assets and food images
│   └── sounds/           # Audio files
├── templates/
│   ├── index.html        # Main game page
│   └── header_content/   # Navigation pages
├── Model/
│   ├── keras_model.h5    # Hand gesture ML model
│   ├── labels.txt        # Gesture labels
│   └── converted_model.tflite  # Optimized model
├── requirements.txt      # Python dependencies
├── Procfile             # Render deployment config
└── README.md            # This file
```

## 🎮 Game Modes

### Classic Mode
- Traditional Snake gameplay
- Keyboard or touch controls
- Focus on precision and timing

### Gesture Mode
- Hands-free gaming experience
- Real-time computer vision
- Perfect for accessibility and fun

## 📊 Features Overview

| Feature | Keyboard Mode | Gesture Mode |
|---------|---------------|--------------|
| Movement Control | Arrow Keys | Hand Gestures |
| Pause/Resume | Spacebar | Stop Gesture |
| Mobile Support | Touch/Swipe | Camera Required |
| Accessibility | High | Moderate |
| Innovation Factor | Classic | Revolutionary |

## 🔧 Configuration Options

### Game Settings
- **Grid Size**: Small (12x12), Medium (15x15), Large (20x20), Custom
- **Snake Speed**: Adjustable from 40ms to 300ms intervals
- **Growth Rate**: Control how much the snake grows per food
- **Food Type**: Choose from 7 different food types or random

### Audio Settings
- **Master Volume**: Overall audio control
- **Background Music**: Toggle game music
- **Sound Effects**: Control click and game sounds

### Control Settings
- **Key Bindings**: Customize keyboard controls
- **Gesture Sensitivity**: Adjust hand tracking sensitivity
- **Camera Settings**: Configure video input preferences

## 🏆 Leaderboard System

### Features
- **Global Rankings**: Compete with players worldwide
- **Mode Separation**: Separate leaderboards for keyboard and gesture
- **Real-time Updates**: Live score updates during gameplay
- **Session Highlighting**: Active players highlighted on leaderboard
- **Personal Stats**: Track your improvement over time

### Scoring Mechanics
- Base points for food consumption
- Time-based bonuses for quick play
- Streak multipliers for consecutive success
- Penalty reduction for efficient gameplay

## 🔒 Privacy & Security

### Data Protection
- **Secure Authentication**: Firebase-powered user management
- **Encrypted Storage**: All user data encrypted in transit and at rest
- **Privacy-First**: Camera feed processed locally, never stored
- **GDPR Compliant**: Full user data control and deletion rights

### Camera Usage
- **Local Processing**: All gesture recognition happens on your device
- **No Recording**: Camera feed is never saved or transmitted
- **Permission Control**: Easy camera access management
- **Offline Capable**: Core game works without internet

## 🚀 Deployment

The application is deployed on Render with automatic builds from the main branch. Environment variables are securely managed through Render's dashboard.

### Live Demo
Visit the live application: [Snake Game with Gesture Controls](https://your-render-url.onrender.com)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
- Follow Python PEP 8 style guide
- Write descriptive commit messages
- Test both keyboard and gesture modes
- Ensure mobile responsiveness
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **CVZone** for simplified computer vision integration
- **Firebase** for authentication and real-time database services
- **TensorFlow** for machine learning model support
- **OpenCV** for computer vision capabilities
- **Render** for reliable cloud deployment

## 📞 Support

For support, questions, or feedback:
- Open an issue on GitHub
- Contact the development team
- Check the documentation wiki

---

**Made with ❤️ by Lokesh Prajapat**

*Bringing classic games into the future with cutting-edge technology*