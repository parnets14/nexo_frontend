// Play notification sound
export const playNotificationSound = () => {
  try {
    // Check if Web Audio API is available
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      console.log('Web Audio API not available, browser notification will use default sound');
      return;
    }

    // Create audio context for generating sound
    const audioContext = new AudioContext();
    
    // Check if audio context is suspended (requires user interaction)
    if (audioContext.state === 'suspended') {
      // Try to resume - this works if user has interacted with the page
      audioContext.resume().then(() => {
        console.log('AudioContext resumed, playing notification sound');
        playBeepSound(audioContext);
      }).catch((error) => {
        console.warn('Could not resume AudioContext:', error);
        console.log('Browser notification will use default sound');
      });
    } else {
      // Audio context is already running, play sound immediately
      playBeepSound(audioContext);
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error);
    console.log('Browser notification will use default sound');
  }
};

// Helper function to play the beep sound
const playBeepSound = (audioContext) => {
  try {
    // Create oscillator for the beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Connect nodes
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configure sound
    oscillator.frequency.value = 800; // Frequency in Hz (higher = higher pitch)
    oscillator.type = 'sine'; // Sine wave for smooth sound
    
    // Set volume envelope (fade in/out)
    const now = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    
    // Play sound
    oscillator.start(now);
    oscillator.stop(now + 0.2);
    
    // Clean up
    oscillator.onended = () => {
      try {
        audioContext.close();
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  } catch (error) {
    console.warn('Error playing beep sound:', error);
  }
};

