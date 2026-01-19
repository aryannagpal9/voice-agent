import { useEffect, useState, useCallback } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import SimpleVoiceAssistant from "./SimpleVoiceAssistant";

const LiveKitModal = ({ setShowSupport }) => {
  const [token, setToken] = useState(null);

  const getToken = useCallback(async () => {
    try {
      const response = await fetch("/api/getToken");
      const data = await response.json();
      setToken(data.token);
    } catch (error) {
      console.error("Token fetch failed:", error);
    }
  }, []);

  useEffect(() => {
    getToken();
  }, [getToken]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="support-room">
          {token ? (
            <LiveKitRoom
              serverUrl={import.meta.env.VITE_LIVEKIT_URL}
              token={token}
              connect={true}
              video={false}
              audio={true}
              onDisconnected={() => setShowSupport(false)}
            >
              <RoomAudioRenderer />
              <SimpleVoiceAssistant />
            </LiveKitRoom>
          ) : (
            <div className="loading">Connecting to AI agent...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveKitModal;
