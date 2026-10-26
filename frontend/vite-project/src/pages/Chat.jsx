
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { IoIosSend } from "react-icons/io";
import { FiArrowLeft, FiMoreHorizontal, FiUser } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Chat = ({ setUser, currentUserId }) => {
    const { friend_id } = useParams();

    const [chats, setChats] = useState([]);
    const [message, setMessage] = useState("");
    const [friend, setFriend] = useState({});

    const socketRef = useRef(null);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // Connect once and clean up the socket on unmount.
    useEffect(() => {
        if (!currentUserId) return;

        const socket = io(BACKEND_URL);
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("user-connected", currentUserId);
        });

        const handleReceiveMessage = (chat) => {
            setChats((prev) => [...prev, chat]);
        };

        socket.on("recieve-message", handleReceiveMessage);

        return () => {
            socket.off("recieve-message", handleReceiveMessage);
            socket.disconnect();
            socketRef.current = null;
        };
    }, [currentUserId]);

    // Load the friend's profile.
    useEffect(() => {
        if (!friend_id) return;

        const controller = new AbortController();

        const getFriend = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/users/${friend_id}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error("Failed to load profile");

                const data = await res.json();
                setFriend(data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error loading friend:", error);
                }
            }
        };

        getFriend();

        return () => controller.abort();
    }, [friend_id]);

    // Load conversation whenever the selected friend changes.
    useEffect(() => {
        if (!friend_id || !currentUserId) return;

        const controller = new AbortController();

        const getChat = async () => {
            try {
                const res = await fetch(
                    `${BACKEND_URL}/api/chats/${friend_id}/${currentUserId}`,
                    { signal: controller.signal }
                );

                if (!res.ok) throw new Error("Failed to load messages");

                const data = await res.json();
                setChats(data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    console.error("Error loading chat:", error);
                }
            }
        };

        getChat();

        return () => controller.abort();
    }, [friend_id, currentUserId]);

    // Keep the newest message visible.
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chats]);

    const handleSendMessage = async (e) => {
        e?.preventDefault();

        const text = message.trim();

        if (!text || !socketRef.current || !currentUserId || !friend_id) {
            return;
        }

        const sentMessage = {
            message: text,
            sender_id: currentUserId,
        };

        // Optimistic update for the sender.
        setChats((prev) => [...prev, sentMessage]);
        setMessage("");

        try {
            // Preserve your existing Socket.IO event signature.
            socketRef.current.emit(
                "send-message",
                text,
                currentUserId,
                friend_id
            );

            const res = await fetch(
                `${BACKEND_URL}/api/chats/${friend_id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        current_user_id: currentUserId,
                        message: text,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to save message");
            }
        } catch (error) {
            console.error("Error sending message:", error);
            // The optimistic message remains visible. Add retry handling
            // or reconciliation here if your backend supports it.
        }

        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    return (
        <div className="h-dvh overflow-hidden bg-[#F6F7F4] text-[#263E32]
                        dark:bg-[#1D3028] dark:text-[#E7EEE9]">

            <div className="mx-auto flex h-full w-full max-w-[1600px]">

                {/* Main conversation */}
                <main className="flex min-w-0 flex-1 flex-col">

                    {/* Conversation header */}
                    <header className="z-10 flex h-[76px] shrink-0
                                       items-center gap-3 border-b
                                       border-[#D6DFD9] bg-[#F6F7F4]/95
                                       px-4 backdrop-blur-xl
                                       dark:border-[#344A43]
                                       dark:bg-[#1D3028]/95 sm:px-7">

                        <Link
                            to="/messages"
                            aria-label="Back to messages"
                            className="rounded-full p-2 transition
                                       hover:bg-[#E6ECE6]
                                       dark:hover:bg-[#344A43]"
                        >
                            <FiArrowLeft size={21} />
                        </Link>

                        <Link
                            to={`/profile/${friend_id}`}
                            className="shrink-0"
                        >
                            {friend.profile_pic_url ? (
                                <img
                                    src={friend.profile_pic_url}
                                    alt=""
                                    className="h-11 w-11 rounded-full
                                               border-2 border-[#D6DFD9]
                                               object-cover
                                               dark:border-[#496255]"
                                />
                            ) : (
                                <div className="flex h-11 w-11
                                                items-center justify-center
                                                rounded-full bg-[#E2EAE2]
                                                text-[#496653]
                                                dark:bg-[#344A43]
                                                dark:text-[#C4D7C8]">
                                    <FiUser size={21} />
                                </div>
                            )}
                        </Link>

                        <Link
                            to={`/profile/${friend_id}`}
                            className="min-w-0 flex-1"
                        >
                            <h1 className="truncate font-semibold
                                           tracking-tight">
                                {friend.full_name || friend.username || "Conversation"}
                            </h1>
                            <p className="truncate text-sm
                                          text-[#78877B]
                                          dark:text-[#A9B8AD]">
                                {friend.username
                                    ? `@${friend.username}`
                                    : "Your Solace connection"}
                            </p>
                        </Link>

                        <button
                            type="button"
                            aria-label="View profile"
                            onClick={() => {
                                window.location.href = `/profile/${friend_id}`;
                            }}
                            className="rounded-full p-2.5 text-[#78877B]
                                       transition hover:bg-[#E6ECE6]
                                       dark:hover:bg-[#344A43]"
                        >
                            <FiMoreHorizontal size={23} />
                        </button>
                    </header>

                    {/* Messages */}
                    <section
                        aria-label="Conversation messages"
                        className="flex-1 overflow-y-auto px-4 py-6
                                   sm:px-8 sm:py-8"
                    >
                        <div className="mx-auto flex min-h-full
                                        max-w-3xl flex-col justify-end">

                            {chats.length === 0 ? (
                                <div className="flex flex-1 flex-col
                                                items-center justify-center
                                                py-16 text-center">

                                    <div className="mb-5 flex h-20 w-20
                                                    items-center justify-center
                                                    rounded-full bg-[#E5ECE4]
                                                    text-[#58745E]
                                                    dark:bg-[#344A43]
                                                    dark:text-[#C5D9CA]">
                                        <span className="text-3xl">✳</span>
                                    </div>

                                    <h2 className="text-lg font-semibold">
                                        A little space for connection
                                    </h2>

                                    <p className="mt-2 max-w-xs text-sm
                                                  leading-6 text-[#78877B]
                                                  dark:text-[#A9B8AD]">
                                        Say hello to {friend.full_name || "your friend"}
                                        {" "}and start a meaningful conversation.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {chats.map((chat, index) => {
                                        const isMine =
                                            String(chat.sender_id) ===
                                            String(currentUserId);

                                        return (
                                            <div
                                                key={chat.id ?? `${index}-${chat.sender_id}`}
                                                className={`flex ${
                                                    isMine
                                                        ? "justify-end"
                                                        : "justify-start"
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-[85%]
                                                        break-words
                                                        px-4 py-3 text-[14px]
                                                        leading-6 shadow-sm
                                                        sm:max-w-[72%]
                                                        ${
                                                            isMine
                                                                ? "rounded-2xl rounded-br-md bg-[#365746] text-white dark:bg-[#496D55]"
                                                                : "rounded-2xl rounded-bl-md border border-[#E0E7E0] bg-white text-[#344A43] dark:border-[#344A43] dark:bg-[#263C32] dark:text-[#E2EAE4]"
                                                        }`}
                                                >
                                                    <p className="whitespace-pre-wrap">
                                                        {chat.message}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>
                    </section>

                    {/* Message composer */}
                    <footer className="shrink-0 border-t border-[#D6DFD9]
                                       bg-[#F6F7F4] px-3 pb-4 pt-4
                                       dark:border-[#344A43]
                                       dark:bg-[#1D3028]
                                       sm:px-8 sm:pb-6">

                        <form
                            onSubmit={handleSendMessage}
                            className="mx-auto flex max-w-3xl items-end
                                       gap-2 rounded-2xl border
                                       border-[#D6DFD9] bg-white p-2
                                       shadow-sm transition
                                       focus-within:border-[#8CA893]
                                       focus-within:ring-2
                                       focus-within:ring-[#8CA893]/20
                                       dark:border-[#40574A]
                                       dark:bg-[#263C32]"
                        >
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Write something meaningful..."
                                aria-label="Write a message"
                                className="max-h-32 min-h-[42px] flex-1
                                           resize-none bg-transparent
                                           px-3 py-2.5 text-sm
                                           text-[#263E32] outline-none
                                           placeholder:text-[#9AA69C]
                                           dark:text-[#E7EEE9]
                                           dark:placeholder:text-[#8D9F92]"
                            />

                            <button
                                type="submit"
                                disabled={!message.trim()}
                                aria-label="Send message"
                                className="flex h-11 w-11 shrink-0
                                           items-center justify-center
                                           rounded-xl bg-[#365746]
                                           text-white transition
                                           hover:bg-[#294636]
                                           active:scale-95
                                           disabled:cursor-not-allowed
                                           disabled:opacity-40
                                           dark:bg-[#587A61]
                                           dark:hover:bg-[#688B70]"
                            >
                                <IoIosSend size={25} />
                            </button>
                        </form>

                        <p className="mt-2 text-center text-[11px]
                                      text-[#94A096]
                                      dark:text-[#84968A]">
                            A little kindness goes a long way.
                        </p>
                    </footer>
                </main>

                {/* Desktop profile sidebar */}
                <aside className="hidden w-[290px] shrink-0 flex-col
                                  items-center border-l
                                  border-[#D6DFD9] bg-[#F0F3EE]
                                  px-6 py-10 dark:border-[#344A43]
                                  dark:bg-[#202F28] lg:flex">

                    {friend.profile_pic_url ? (
                        <img
                            src={friend.profile_pic_url}
                            alt={friend.full_name || "Profile"}
                            className="h-28 w-28 rounded-full
                                       border-4 border-white object-cover
                                       shadow-md dark:border-[#40574A]"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center
                                        justify-center rounded-full
                                        bg-[#E0E9DF] text-[#58745E]
                                        dark:bg-[#344A43]">
                            <FiUser size={42} />
                        </div>
                    )}

                    <h2 className="mt-5 text-center text-lg font-semibold">
                        {friend.full_name || "Solace member"}
                    </h2>

                    {friend.username && (
                        <p className="mt-1 text-sm text-[#78877B]
                                      dark:text-[#A9B8AD]">
                            @{friend.username}
                        </p>
                    )}

                    <p className="mt-5 text-center text-sm leading-6
                                  text-[#78877B] dark:text-[#A9B8AD]">
                        Every connection has a story. Keep yours growing.
                    </p>

                    <Link
                        to={`/profile/${friend_id}`}
                        className="mt-7 flex w-full items-center
                                   justify-center gap-2 rounded-xl
                                   border border-[#CBD8CB] bg-white
                                   px-4 py-3 text-sm font-medium
                                   text-[#365746] transition
                                   hover:bg-[#E5ECE4]
                                   dark:border-[#40574A]
                                   dark:bg-[#263C32]
                                   dark:text-[#D7E5D9]
                                   dark:hover:bg-[#344A43]"
                    >
                        <FiUser size={16} />
                        View profile
                    </Link>

                    <div className="mt-auto flex items-center gap-2
                                    text-xs text-[#89978B]">
                        <span className="h-2 w-2 rounded-full
                                         bg-[#86A58A]" />
                        Made for meaningful connections
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default Chat;
