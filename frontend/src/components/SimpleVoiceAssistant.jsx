import {
  useVoiceAssistant,
  DisconnectButton,
  BarVisualizer,
  useTrackTranscription,
  useLocalParticipant,
  useTracks,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SimpleVoiceAssistant.css";

const SimpleVoiceAssistant = () => {
  const { audioTrack } = useVoiceAssistant();
  const localParticipant = useLocalParticipant();
  const room = useRoomContext();
  const navigate = useNavigate();

  const avatarVideoRef = useRef(null);

  const [latestMessage, setLatestMessage] = useState("");
  const [avatarReady, setAvatarReady] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const { segments } = useTrackTranscription({
    publication: localParticipant.microphoneTrack,
    source: Track.Source.Microphone,
    participant: localParticipant.localParticipant,
  });

  useEffect(() => {
    if (!segments?.length) return;

    const last = segments[segments.length - 1];
    setLatestMessage(last.text);

    const timeout = setTimeout(() => {
      setLatestMessage("");
    }, 4000);

    return () => clearTimeout(timeout);
  }, [segments]);

  const videoTracks = useTracks(
    [{ source: Track.Source.Camera, withPlaceholder: false }],
    { onlySubscribed: true }
  );

  useEffect(() => {
    const track = videoTracks[0]?.publication?.track;
    if (track && avatarVideoRef.current) {
      track.attach(avatarVideoRef.current);
      setAvatarReady(true);
    }
  }, [videoTracks]);

  useEffect(() => {
    if (!avatarReady) return;

    const timer = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [avatarReady]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="ui-root">

      {/* TOP BAR */}
      <div className="top-bar">
        {avatarReady ? (
          <span className="call-timer">Call Time {formatTime(seconds)}</span>
        ) : (
          <span className="connecting">Connecting to LARA…</span>
        )}
      </div>

      {/* LEFT SIDE */}
      <div className="left-panel">
        {latestMessage && (
          <div className="user-message">{latestMessage}</div>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="right-panel">
        {!videoTracks.length && (
          <div className="dummy-avatar">
            <div className="pulse" />
            <span>LARA is connecting…</span>
          </div>
        )}

        <video ref={avatarVideoRef} autoPlay playsInline />
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="bottom-controls">

        <div className="controls-left">
          <BarVisualizer trackRef={audioTrack} className="va-bars">
            <div className="bar" />
          </BarVisualizer>
        </div>

        <div className="controls-right">
          <DisconnectButton
            className="drop-call-btn"
            onClick={() => {
              navigate(`/call-ended/${room.name}`);

            }}
          >
            Drop Call
          </DisconnectButton>
        </div>

      </div>

    </div>
  );
};

export default SimpleVoiceAssistant;
