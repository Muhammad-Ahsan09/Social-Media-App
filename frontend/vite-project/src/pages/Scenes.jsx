import { useEffect, useRef, useState } from "react";
import { FaPlus, FaTimes, FaVideo, FaUpload } from "react-icons/fa";
import Scene from "../components/Scene";
import LeftSidebar from "../components/LeftSidebar";
import BottomNavbar from "../components/BottomNavbar";
import TopNavbar from "../components/TopNavbar";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


const Scenes = ({ setUser, currentUserId }) => {


  const [scenes, setScenes] = useState([]);
  const [activeSceneId, setActiveSceneId] = useState(null);
  const [loadingScenes, setLoadingScenes] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);
  const objectUrlsRef = useRef([]);

  // Release temporary video URLs when the component unmounts.
  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) =>
        URL.revokeObjectURL(url)
      );
    };
  }, []);


  useEffect(() => {
    let cancelled = false;

    const fetchScenes = async () => {
      try {
        setLoadingScenes(true);
        setFetchError("");

        const response = await fetch(`${BACKEND_URL}/api/scenes`, {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();
        console.log(data)

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch Scenes.");
        }

        if (cancelled) return;

        const fetchedScenes = (data.scenes || []).map((scene) => ({
          ...scene,
          likes_count: Number(scene.likes_count || 0),
          comments_count: Number(scene.comments_count || 0),
          // is_liked: scene.is_liked,
          comments: [],
        }));

        setScenes(fetchedScenes);
        setActiveSceneId(fetchedScenes[0]?.id ?? null);
      } catch (error) {
        if (cancelled) return;

        console.error("Fetch scenes error:", error);
        setFetchError(error.message || "Unable to load Scenes.");
      } finally {
        if (!cancelled) {
          setLoadingScenes(false);
        }
      }
    };

    fetchScenes();

    return () => {
      cancelled = true;
    };
  }, [BACKEND_URL]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError("");

    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a video file.");
      event.target.value = "";
      return;
    }

    // Optional 100 MB limit for local testing.
    if (file.size > 100 * 1024 * 1024) {
      setUploadError("The video must be smaller than 100 MB.");
      event.target.value = "";
      return;
    }

    // Remove the previous preview URL if another file is selected.
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== previewUrl
      );
    }

    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);

    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const closeUploadModal = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== previewUrl
      );
    }

    setUploadOpen(false);
    setSelectedFile(null);
    setCaption("");
    setPreviewUrl("");
    setUploadError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };


  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile || !previewUrl) {
      setUploadError("Choose a video before uploading.");
      return;
    }

    if (selectedFile.size > 100 * 1024 * 1024) {
      setUploadError("Video size cannot exceed 100 MB.");
      return;
    }

    try {
      setUploadError("");

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("caption", caption.trim());
      formData.append("visibility", "public");

      const response = await fetch(`${BACKEND_URL}/api/scenes`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to upload Scene.");
      }

      // Use the Scene saved by the backend.
      const newScene = {
        ...data.scene,
        username: data.scene.username || "you",
        profile_pic_url: data.profile_pic_url || "N",
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        comments: [],
      };

      setScenes((previous) => [newScene, ...previous]);
      setActiveSceneId(newScene.id);

      setUploadOpen(false);
      setSelectedFile(null);
      setCaption("");
      setPreviewUrl("");
      setUploadError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // The backend now owns the uploaded video, so the local preview
      // URL can be released after the upload completes.
      URL.revokeObjectURL(previewUrl);
    } catch (error) {
      console.error("Scene upload error:", error);
      setUploadError(error.message || "Something went wrong uploading your Scene.");
    }
  };


  const handleComment = (sceneId, content) => {
    setScenes((previous) =>
      previous.map((scene) =>
        scene.id === sceneId
          ? {
            ...scene,
            comments: [
              ...(scene.comments || []),
              {
                id: Date.now(),
                username: "you",
                content,
              },
            ],
            comments_count: scene.comments_count + 1,
          }
          : scene
      )
    );
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-[#F6F7F4] text-[#294C46] dark:bg-black dark:text-white">
      {/* Mobile top navigation */}
      {/* <TopNavbar setUser={setUser} /> */}

      <div className="flex h-full md:pt-0">
        {/* Desktop sidebar */}
        {/* <div className="hidden md:block">
          <LeftSidebar
            setUser={setUser}
            currentUserId={currentUserId}
          />
        </div> */}

        {/* Scenes content */}
        <main className="relative min-w-0 flex-1 overflow-hidden bg-[#F6F7F4] dark:bg-black">
          {/* Header */}
          <header className="pointer-events-none absolute left-0 right-0 top-14 z-20 flex items-center justify-between px-5 py-4 sm:px-8 md:top-0 md:py-5">
            <h1 className="pointer-events-auto text-xl font-semibold tracking-tight text-[#294C46] dark:text-white">
              Scenes
            </h1>

            <button
              onClick={() => setUploadOpen(true)}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#294C46] px-4 py-2.5 text-[13px] font-medium text-white shadow-lg transition hover:bg-[#1D3832] active:scale-95 dark:bg-white dark:text-black"
            >
              <FaPlus size={11} />
              <span>Upload Scene</span>
            </button>
          </header>

          {/* Feed */}
          <div className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain scrollbar-hide pt-14 pb-16 md:pt-0 md:pb-0">
            {loadingScenes ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm opacity-60">Loading Scenes...</p>
              </div>
            ) : fetchError ? (
              <div className="flex h-full items-center justify-center px-6 text-center">
                <p className="text-sm text-rose-500">{fetchError}</p>
              </div>
            ) : scenes.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                <h2 className="text-lg font-semibold">No Scenes yet</h2>
                <p className="text-sm opacity-60">
                  Be the first to share a moment with your world.
                </p>
                <button
                  onClick={() => setUploadOpen(true)}
                  className="rounded-full bg-[#294C46] px-5 py-2.5 text-sm text-white dark:bg-white dark:text-black"
                >
                  Upload a Scene
                </button>
              </div>
            ) : (
              scenes.map((scene) => (
                <Scene
                  key={scene.id}
                  scene={scene}
                  isActive={activeSceneId === scene.id}
                  onVisible={() => setActiveSceneId(scene.id)}
                />
              ))
            )}
          </div>


          {/* Upload modal */}
          {uploadOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-md"
              onClick={(event) => {
                if (event.target === event.currentTarget) {
                  closeUploadModal();
                }
              }}
            >
              <div className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-[28px] bg-[#F6F7F4] p-6 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.6)] ring-1 ring-black/5 dark:bg-[#141C18] dark:ring-white/10 sm:p-8">
                <button
                  onClick={closeUploadModal}
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full text-[#294C46]/50 transition hover:bg-[#294C46]/5 hover:text-[#294C46] dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Close upload modal"
                >
                  <FaTimes size={13} />
                </button>

                <div className="mb-7">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#294C46]/8 text-[#294C46] ring-1 ring-[#294C46]/10 dark:bg-white/10 dark:text-emerald-200 dark:ring-white/10">
                    <FaVideo size={17} />
                  </div>

                  <h2 className="text-xl font-semibold tracking-tight">
                    Create a Scene
                  </h2>
                  <p className="mt-1 text-sm text-[#294C46]/55 dark:text-white/50">
                    Share a little moment with your world.
                  </p>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                  {/* Video preview / file picker */}
                  <div>
                    <label className="mb-2 block text-[13px] font-medium text-[#294C46]/80 dark:text-white/70">
                      Video
                    </label>

                    {previewUrl ? (
                      <div className="relative mx-auto aspect-[9/14] max-h-[340px] overflow-hidden rounded-2xl bg-black ring-1 ring-black/10 dark:ring-white/10">
                        <video
                          src={previewUrl}
                          controls
                          playsInline
                          className="h-full w-full object-contain"
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                              objectUrlsRef.current =
                                objectUrlsRef.current.filter(
                                  (url) => url !== previewUrl
                                );
                            }

                            setSelectedFile(null);
                            setPreviewUrl("");

                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white ring-1 ring-white/20 backdrop-blur-md transition hover:bg-black/70"
                          aria-label="Remove selected video"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#294C46]/25 px-4 py-10 transition hover:border-[#294C46]/60 hover:bg-[#294C46]/[0.03] dark:border-white/20 dark:hover:border-white/40 dark:hover:bg-white/5"
                      >
                        <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#294C46]/8 dark:bg-white/10">
                          <FaUpload className="text-sm" />
                        </span>
                        <span className="text-sm font-medium">
                          Choose a video
                        </span>
                        <span className="mt-1 text-xs text-[#294C46]/55 dark:text-white/45">
                          MP4, WebM, or another browser-supported format
                        </span>
                        <span className="mt-0.5 text-xs text-[#294C46]/55 dark:text-white/45">
                          Maximum size: 100 MB
                        </span>
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {selectedFile && (
                      <p className="mt-2 break-all text-xs text-[#294C46]/55 dark:text-white/45">
                        {selectedFile.name}
                      </p>
                    )}
                  </div>

                  {/* Caption */}
                  <div>
                    <label
                      htmlFor="scene-caption"
                      className="mb-2 block text-[13px] font-medium text-[#294C46]/80 dark:text-white/70"
                    >
                      Caption
                    </label>

                    <textarea
                      id="scene-caption"
                      value={caption}
                      onChange={(event) => setCaption(event.target.value)}
                      placeholder="What makes this moment special?"
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-none rounded-2xl bg-white px-4 py-3 text-sm text-[#294C46] outline-none ring-1 ring-[#294C46]/12 transition placeholder:text-[#294C46]/35 focus:ring-[#294C46]/50 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:placeholder:text-white/30 dark:focus:ring-emerald-600/60"
                    />

                    <p className="mt-1.5 text-right text-xs tabular-nums text-[#294C46]/40 dark:text-white/35">
                      {caption.length}/2000
                    </p>
                  </div>

                  {uploadError && (
                    <p className="text-sm text-rose-500">
                      {uploadError}
                    </p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={closeUploadModal}
                      className="flex-1 rounded-full px-4 py-3 text-sm font-medium ring-1 ring-[#294C46]/15 transition hover:bg-[#294C46]/5 dark:ring-white/15 dark:hover:bg-white/5"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={!selectedFile}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#294C46] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#1D3832] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-35 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                      <FaUpload size={12} />
                      Publish Scene
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>

        {/* <BottomNavbar currentUserId={currentUserId} /> */}
      </div>
      </div>
      );
};

export default Scenes;