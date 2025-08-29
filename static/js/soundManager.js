class SoundManager {
    constructor() {
        this.sounds = {
            click: document.getElementById('clickSound'),
            point: document.getElementById('pointSound'),
            gameOver: document.getElementById('gameOverSound'),
            background: document.getElementById('backgroundMusic')
        };

        this.settings = {
            soundEnabled: true,
            musicEnabled: true,
            masterVolume: 100,
            musicVolume: 50,
            sfxVolume: 70,
            sfxEnabled: true
        };

        this.preloadSounds();
        this.loadSettings();
    }

    preloadSounds() {
        // Force browsers to load sounds immediately
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.load();
                sound.volume = 0; // Start silent
            }
        });
    }


    loadSettings() {
        const savedSettings = JSON.parse(localStorage.getItem('soundSettings'));
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
        this.applySettings();
    }

    saveSettings() {
        localStorage.setItem('soundSettings', JSON.stringify(this.settings));
    }

    applySettings() {
        // Apply volume settings
        const masterVolume = this.settings.soundEnabled ? this.settings.masterVolume / 100 : 0;

        // Background music
        this.sounds.background.volume = (this.settings.musicEnabled ?
            (this.settings.musicVolume / 100) * masterVolume : 0);

        // SFX
        const sfxVolume = (this.settings.sfxVolume / 100) * masterVolume;
        this.sounds.click.volume = sfxVolume;
        this.sounds.point.volume = sfxVolume;
        this.sounds.gameOver.volume = sfxVolume;

        this.saveSettings();
    }

    updateSettings(newSettings) {
        // Merge new settings
        this.settings = {
            ...this.settings,
            ...newSettings
        };

        // Apply volume changes
        const masterVolume = this.settings.soundEnabled ? this.settings.masterVolume / 100 : 0;

        // Background music
        this.sounds.background.volume = this.settings.musicEnabled ?
            (this.settings.musicVolume / 100) * masterVolume : 0;

        // Sound effects
        const sfxVolume = (this.settings.sfxVolume / 100) * masterVolume;
        this.sounds.click.volume = sfxVolume;
        this.sounds.point.volume = sfxVolume;
        this.sounds.gameOver.volume = sfxVolume;
    }

    playClick() {
        if (!this.settings.soundEnabled || !this.settings.sfxEnabled) return;
        this.sounds.click.currentTime = 0;
        this.sounds.click.play().catch(e => console.log('Audio play failed:', e));
    }

    playPoint() {
        if (!this.settings.soundEnabled || !this.settings.sfxEnabled) return;
        this.sounds.point.currentTime = 0;
        this.sounds.point.play().catch(e => console.log('Audio play failed:', e));
    }

    playGameOver() {
        if (!this.settings.soundEnabled || !this.settings.sfxEnabled) return;
        this.sounds.gameOver.currentTime = 0;
        this.sounds.gameOver.play().catch(e => console.log('Audio play failed:', e));
    }

    playBackgroundMusic() {
        if (!this.settings.soundEnabled || !this.settings.musicEnabled) return;
        this.sounds.background.currentTime = 0;
        this.sounds.background.play().catch(e => console.log('Music play failed:', e));
    }

    stopBackgroundMusic() {
        this.sounds.background.pause();
    }

    toggleMusic() {
        this.settings.musicEnabled = !this.settings.musicEnabled;
        if (this.settings.musicEnabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        this.applySettings();
    }

    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.applySettings();
    }
}

// Initialize sound manager
const soundManager = new SoundManager();

// Make available globally
window.soundManager = soundManager;


