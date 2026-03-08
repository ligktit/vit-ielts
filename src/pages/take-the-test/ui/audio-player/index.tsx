import { memo, useEffect, useLayoutEffect, useRef } from "react";
import "plyr-react/plyr.css";

interface AudioPlayerProps {
  audioUrl: string;
  isReady: boolean;
  onTimeUpdate?: (currentTime: number) => void;
}

const AudioPlayer = ({ audioUrl, isReady, onTimeUpdate }: AudioPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const plyrInstanceRef = useRef<any>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);

  // Use useLayoutEffect to ensure ref is ready before initialization
  useLayoutEffect(() => {
    // Cleanup previous instance if audioUrl changes
    if (isInitializedRef.current) {
      if (plyrInstanceRef.current) {
        try {
          plyrInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying previous player:", e);
        }
        plyrInstanceRef.current = null;
      }
      if (audioElementRef.current && audioElementRef.current.parentNode) {
        try {
          audioElementRef.current.parentNode.removeChild(audioElementRef.current);
        } catch (e) {
          console.error("Error removing previous audio element:", e);
        }
        audioElementRef.current = null;
      }
      isInitializedRef.current = false;
    }
    
    const initPlayer = async () => {
      // Wait for container to be ready
      if (!containerRef.current) {
        console.log("Container ref not ready");
        return;
      }

      try {
        // Double check container is still in DOM
        if (!containerRef.current.isConnected) {
          console.log("Container not connected to DOM");
          return;
        }

        // Create audio element
        const audioElement = document.createElement("audio");
        audioElement.controls = true;
        audioElement.src = audioUrl;
        audioElementRef.current = audioElement;
        
        // Verify container is still valid before appending
        if (!containerRef.current || !containerRef.current.isConnected) {
          console.log("Container invalid before append");
          audioElementRef.current = null;
          return;
        }
        
        // Append to container
        containerRef.current.appendChild(audioElement);

        // Verify audioElement is now in DOM before initializing Plyr
        if (!audioElement.isConnected || !audioElement.parentNode) {
          console.log("Audio element not connected after append");
          if (audioElement.parentNode) {
            audioElement.parentNode.removeChild(audioElement);
          }
          audioElementRef.current = null;
          return;
        }

        // Dynamically import Plyr
        const Plyr = (await import("plyr")).default;
        
        // Final check before Plyr initialization
        if (!audioElement.isConnected || !audioElement.parentNode) {
          console.log("Audio element disconnected before Plyr init");
          if (audioElement.parentNode) {
            audioElement.parentNode.removeChild(audioElement);
          }
          audioElementRef.current = null;
          return;
        }
        
        // Initialize Plyr
        plyrInstanceRef.current = new Plyr(audioElement, {
          controls: [
            "rewind",
            "play",
            "fast-forward",
            "progress",
            "current-time",
            "mute",
            "volume",
            "settings",
          ],
        });

        // Setup time update listener
        audioElement.addEventListener("timeupdate", () => {
          if (onTimeUpdate) {
            onTimeUpdate(audioElement.currentTime);
          }
        });

        isInitializedRef.current = true;
        console.log("Audio player initialized successfully");
      } catch (error) {
        console.error("Failed to initialize audio player:", error);
        // Cleanup on error
        if (audioElementRef.current && audioElementRef.current.parentNode) {
          try {
            audioElementRef.current.parentNode.removeChild(audioElementRef.current);
          } catch (e) {
            console.error("Error cleaning up audio element:", e);
          }
          audioElementRef.current = null;
        }
        isInitializedRef.current = false;
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    const rafId = requestAnimationFrame(() => {
      initPlayer();
    });

    // Cleanup only on unmount
    return () => {
      cancelAnimationFrame(rafId);
      if (plyrInstanceRef.current) {
        try {
          plyrInstanceRef.current.destroy();
        } catch (e) {
          console.error("Error destroying player:", e);
        }
        plyrInstanceRef.current = null;
      }
      if (audioElementRef.current && audioElementRef.current.parentNode) {
        try {
          audioElementRef.current.parentNode.removeChild(audioElementRef.current);
        } catch (e) {
          console.error("Error removing audio element:", e);
        }
        audioElementRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, [audioUrl]); // Include audioUrl to reinitialize if URL changes

  // Handle play when ready
  useEffect(() => {
    if (isReady && audioElementRef.current) {
      const audioElement = audioElementRef.current;
      
      if (audioElement.paused) {
        audioElement.play().catch((error) =>
          console.error("Audio play failed:", error)
        );
      }
    }
  }, [isReady]);

  return <div ref={containerRef} />;
};

// Memo to prevent re-render
export default memo(AudioPlayer);
