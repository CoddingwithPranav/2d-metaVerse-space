import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuth from "@/hooks/Authhook";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useArenaAssets } from "@/hooks/useArenaAssets";
import { useAvatarLoader } from "@/hooks/useAvatarLoader";
import { WS_URL } from "@/config";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CanvasRenderer } from "@/components/CanvasRenderer";
import { EmojiPanel } from "@/components/EmojiPanel";
import { useArenaKeyboard } from "@/hooks/useArenaKeyboard";
import { EMOJI_OPTIONS } from "@/constants";

export default function ArenaPage() {
  const { spaceId } = useParams<{ spaceId: string }>();
  const { token } = useAuth();

  const [isConnecting, setIsConnecting] = useState(false);
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [messageInput, setMessageInput] = useState("");

  const { loadUserAvatar, getSprite } = useAvatarLoader();

  const {
    connected,
    selfId,
    users,
    animatedPositions,
    setAnimatedPositions,
    emojis,
    setEmojis,
    chatMessages,
    setChatMessages,
    error: wsError,
    isMovingSelf,
    moveUser,
    sendAction,
    sendMessage,
  } = useWebSocket({
    url: WS_URL,
    token: token || "",
    spaceId: spaceId || "",
    shouldConnect: isConnecting,
    loadUserAvatar,
  });

  const {
    spaceElements,
    gridSize,
    backgroundImg,
    criticalImagesLoaded,
    imageLoadError,
    elementImageCache,
  } = useArenaAssets({
    spaceId: spaceId!,
    token: token!,
    isConnecting: isConnecting && !!token && !!spaceId,
  });

  // Animation loop
  useEffect(() => {
    if (!connected || !criticalImagesLoaded || Object.keys(users).length === 0)
      return;

    let raf: number;
    const animate = () => {
      setAnimatedPositions((prev) => {
        const next = { ...prev };
        let changed = false;

        Object.entries(users).forEach(([id, user]) => {
          const pos = next[id];
          if (!pos) return;

          const targetX = user.x * 20;
          const targetY = user.y * 20;
          const dx = targetX - pos.currentPixelX;
          const dy = targetY - pos.currentPixelY;

          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            pos.currentPixelX += dx * 0.1;
            pos.currentPixelY += dy * 0.1;
            changed = true;
          } else {
            pos.currentPixelX = targetX;
            pos.currentPixelY = targetY;
          }
        });

        return changed ? next : prev;
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [connected, criticalImagesLoaded, users, setAnimatedPositions]);

  // Cleanup expired emojis & messages
  useEffect(() => {
    const emojiInterval = setInterval(() => {
      setEmojis((prev) => prev.filter((e) => Date.now() < e.expiresAt));
    }, 1000);

    const chatInterval = setInterval(() => {
      setChatMessages((prev) => prev.filter((m) => Date.now() < m.expiresAt));
    }, 1000);

    return () => {
      clearInterval(emojiInterval);
      clearInterval(chatInterval);
    };
  }, [setEmojis, setChatMessages]);

  useArenaKeyboard({
    selfId,
    users,
    isMovingSelf,
    moveUser,
    showEmojiPanel,
    setShowEmojiPanel,
    showMessageInput,
    setShowMessageInput,
    sendAction,
    emojiOptions: EMOJI_OPTIONS,
  });
  if (!token || !spaceId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="w-96 bg-white border-gray-200 text-black">
          <CardHeader>
            <CardTitle className="text-red-500">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Missing token or space ID. Please log in and try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isConnecting) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white p-6">
        <Card className="w-full max-w-md bg-white backdrop-blur-md border-gray-200 text-black shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-black">
              Join Space:{" "}
              <span className="font-mono text-gray-700">{spaceId}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6 pt-4">
            <p className="text-center text-gray-600">
              Ready to enter the arena?
            </p>
            <Button
              onClick={() => setIsConnecting(true)}
              size="lg"
              className="w-full bg-[#9ef01a] hover:opacity-90 text-black font-semibold"
            >
              Connect to Arena
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!criticalImagesLoaded && !imageLoadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="w-80 bg-white border-gray-200 text-black">
          <CardHeader>
            <CardTitle className="text-[#9ef01a]">Loading Assets...</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 animate-pulse rounded-full bg-[#9ef01a] delay-0"></div>
            <div className="h-4 w-4 animate-pulse rounded-full bg-[#9ef01a] delay-150"></div>
            <div className="h-4 w-4 animate-pulse rounded-full bg-[#9ef01a] delay-300"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (imageLoadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="w-96 bg-white border-gray-200 text-black">
          <CardHeader>
            <CardTitle className="text-amber-600">
              Asset Loading Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">{imageLoadError}</p>
            <Button
              onClick={() => {
                setIsConnecting(false);
                setTimeout(() => setIsConnecting(true), 100);
              }}
              variant="outline"
              className="w-full"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (wsError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <Card className="w-96 bg-white border-gray-200 text-black">
          <CardHeader>
            <CardTitle className="text-red-500">Connection Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-600">{wsError}</p>
            <Button
              onClick={() => setIsConnecting(false)}
              variant="destructive"
              className="w-full"
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white p-4 pt-24">
      <div className="mx-auto max-w-5xl">
        <CanvasRenderer
          users={users}
          animatedPositions={animatedPositions}
          spaceElements={spaceElements}
          backgroundImg={backgroundImg}
          gridSize={gridSize}
          emojis={emojis}
          chatMessages={chatMessages}
          selfId={selfId}
          getSprite={getSprite}
          elementImageCache={elementImageCache}
        />
      </div>

      <EmojiPanel
        show={showEmojiPanel}
        onSelect={(emoji) => {
          sendAction("show-emoji", emoji);
          setShowEmojiPanel(false);
        }}
        onClose={() => setShowEmojiPanel(false)}
      />

      {showMessageInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <Card className="w-full max-w-md bg-white border-gray-200 text-black">
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && messageInput.trim()) {
                    sendMessage(messageInput);
                    setMessageInput("");
                    setShowMessageInput(false);
                  } else if (e.key === "Escape") {
                    setShowMessageInput(false);
                    setMessageInput("");
                  }
                }}
                placeholder="Type a message..."
                className="w-full rounded-md border border-gray-300 bg-gray-100 p-3 text-black placeholder-gray-500 focus:border-[#9ef01a] focus:ring-[#9ef01a]"
                maxLength={100}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setShowMessageInput(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (messageInput.trim()) {
                      sendMessage(messageInput);
                      setMessageInput("");
                      setShowMessageInput(false);
                    }
                  }}
                  disabled={!messageInput.trim()}
                >
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-white/90 p-4 text-sm text-gray-700 backdrop-blur-md border border-gray-200">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowEmojiPanel((v) => !v)}
            className="flex items-center gap-2 rounded px-3 py-1 hover:bg-gray-100"
          >
            <span>Emojis</span>{" "}
            <span className="font-mono text-[#9ef01a]">H</span>
          </button>
          <button
            onClick={() => setShowMessageInput(true)}
            className="flex items-center gap-2 rounded px-3 py-1 hover:bg-gray-100"
          >
            <span>Chat</span>{" "}
            <span className="font-mono text-[#9ef01a]">I</span>
          </button>
          {selfId && users[selfId] && (
            <div className="text-xs">
              Pos: ({users[selfId].x}, {users[selfId].y})
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
