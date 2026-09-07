import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function InboxScreen() {
    const navigate = useNavigate();
    const location = useLocation();

    const [conversations, setConversations] = useState([]);
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);

    const [loadingInbox, setLoadingInbox] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);

    const [messageText, setMessageText] = useState('');
    const [error, setError] = useState('');

    const messagesEndRef = useRef(null);

    const token = localStorage.getItem('token');

    // =====================================================
    // AUTH HEADERS
    // =====================================================

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    });


    // =====================================================
    // LOAD INBOX
    // =====================================================

    const loadInbox = async () => {
        try {
            setLoadingInbox(true);
            setError('');

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(
                `${API_BASE}/api/messages/inbox`,
                {
                    headers: getHeaders()
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message || 'Failed to load inbox'
                );
            }

            const inboxData = Array.isArray(result.data)
                ? result.data
                : [];

            setConversations(inboxData);

            // Open conversation from URL if provided
            const params = new URLSearchParams(
                location.search
            );

            const requestedConversation =
                params.get('conversation');

            if (requestedConversation) {
                const found = inboxData.find(
                    conversation =>
                        conversation.conversation_id ===
                        requestedConversation
                );

                if (found) {
                    await openConversation(found);
                }
            }

        } catch (error) {

            console.error(
                'Inbox loading error:',
                error
            );

            setError(
                error.message ||
                'Unable to load messages'
            );

        } finally {

            setLoadingInbox(false);
        }
    };


    // =====================================================
    // LOAD CONVERSATION
    // =====================================================

    const openConversation = async conversation => {

        try {

            setActiveConversation(conversation);
            setLoadingMessages(true);
            setError('');

            const response = await fetch(
                `${API_BASE}/api/messages/conversation/${conversation.conversation_id}`,
                {
                    headers: getHeaders()
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    'Failed to load conversation'
                );
            }

            const conversationData =
                result.data?.conversation;

            const conversationMessages =
                result.data?.messages || [];

            setActiveConversation({
                ...conversation,
                ...(conversationData || {})
            });

            setMessages(conversationMessages);


            // Mark messages as read
            await fetch(
                `${API_BASE}/api/messages/conversation/${conversation.conversation_id}/read`,
                {
                    method: 'PATCH',
                    headers: getHeaders()
                }
            );


            // Remove unread count locally
            setConversations(previous =>
                previous.map(item =>
                    item.conversation_id ===
                    conversation.conversation_id
                        ? {
                            ...item,
                            unread_count: 0
                        }
                        : item
                )
            );

            // Update URL without refreshing page
            const params = new URLSearchParams(
                location.search
            );

            params.set(
                'conversation',
                conversation.conversation_id
            );

            navigate(
                `/inbox?${params.toString()}`,
                { replace: true }
            );

        } catch (error) {

            console.error(
                'Conversation loading error:',
                error
            );

            setError(
                error.message ||
                'Unable to load conversation'
            );

        } finally {

            setLoadingMessages(false);
        }
    };


    // =====================================================
    // SEND MESSAGE
    // =====================================================

    const handleSendMessage = async event => {

        event.preventDefault();

        const text = messageText.trim();

        if (!text || !activeConversation || sending) {
            return;
        }

        try {

            setSending(true);
            setError('');

            const response = await fetch(
                `${API_BASE}/api/messages/conversation/${activeConversation.conversation_id}/messages`,
                {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify({
                        messageText: text
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ||
                    'Failed to send message'
                );
            }

            if (result.data) {
                setMessages(previous => [
                    ...previous,
                    result.data
                ]);
            }

            setMessageText('');

            // Update conversation preview
            setConversations(previous =>
                previous.map(item =>
                    item.conversation_id ===
                    activeConversation.conversation_id
                        ? {
                            ...item,
                            last_message_snippet: text,
                            updated_at:
                                new Date().toISOString()
                        }
                        : item
                )
            );

        } catch (error) {

            console.error(
                'Send message error:',
                error
            );

            setError(
                error.message ||
                'Unable to send message'
            );

        } finally {

            setSending(false);
        }
    };


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    useEffect(() => {
        loadInbox();
    }, []);


    // =====================================================
    // AUTO SCROLL
    // =====================================================

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });

    }, [messages]);


    // =====================================================
    // HELPERS
    // =====================================================

    const formatTime = dateString => {

        if (!dateString) {
            return '';
        }

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };


    const getHostName = conversation => {

        return (
            conversation?.company_name ||
            conversation?.host_name ||
            'Tour Host'
        );
    };


    const getInitials = name => {

        if (!name) {
            return 'TH';
        }

        return name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };


    const getUnreadCount = conversation => {

        const count =
            Number(conversation?.unread_count || 0);

        return count > 99 ? '99+' : count;
    };


    // =====================================================
    // LOADING STATE
    // =====================================================

    if (loadingInbox) {

        return (
            <div className="min-h-screen bg-gray-50 pb-24">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

                    <div className="h-8 w-40 bg-gray-200 rounded-lg animate-pulse mb-6" />

                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

                        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[650px]">

                            <div className="border-r p-4 space-y-4">

                                {[1, 2, 3, 4].map(item => (
                                    <div
                                        key={item}
                                        className="flex gap-3"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />

                                        <div className="flex-1">
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse" />
                                            <div className="h-3 bg-gray-200 rounded w-44 animate-pulse" />
                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className="hidden md:flex items-center justify-center">
                                <div className="text-gray-400">
                                    Loading messages...
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    // =====================================================
    // MAIN UI
    // =====================================================

    return (
        <div className="min-h-screen bg-gray-50 pb-24">

            {/* =========================================
                HEADER
            ========================================== */}

            <div className="bg-white border-b">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

                    <div className="flex items-center justify-between">

                        <div>

                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-gray-500 hover:text-gray-800 mb-1"
                            >
                                ← Back
                            </button>

                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                Messages
                            </h1>

                            <p className="text-sm text-gray-500 mt-1">
                                Connect directly with your tour hosts
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* =========================================
                ERROR
            ========================================== */}

            {error && (

                <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">

                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>

                </div>
            )}


            {/* =========================================
                MESSAGING AREA
            ========================================== */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

                    <div className="grid grid-cols-1 md:grid-cols-[330px_1fr] lg:grid-cols-[360px_1fr] h-[calc(100vh-190px)] min-h-[600px]">


                        {/* =================================
                            CONVERSATIONS SIDEBAR
                        ================================== */}

                        <aside
                            className={`
                                border-r
                                flex flex-col
                                ${
                                    activeConversation
                                        ? 'hidden md:flex'
                                        : 'flex'
                                }
                            `}
                        >

                            <div className="px-5 py-4 border-b">

                                <div className="flex items-center justify-between">

                                    <h2 className="font-semibold text-gray-900">
                                        Conversations
                                    </h2>

                                    <span className="text-xs text-gray-400">
                                        {conversations.length}
                                    </span>

                                </div>

                            </div>


                            <div className="flex-1 overflow-y-auto">

                                {conversations.length === 0 ? (

                                    <div className="px-6 py-16 text-center">

                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
                                            💬
                                        </div>

                                        <h3 className="font-semibold text-gray-900">
                                            No conversations yet
                                        </h3>

                                        <p className="text-sm text-gray-500 mt-2 leading-6">
                                            When you contact a host about a package,
                                            your conversation will appear here.
                                        </p>

                                        <button
                                            onClick={() =>
                                                navigate('/destinations')
                                            }
                                            className="mt-5 px-5 py-2.5 rounded-xl bg-[#436e0c] text-white text-sm font-semibold hover:opacity-90 transition"
                                        >
                                            Explore Destinations
                                        </button>

                                    </div>

                                ) : (

                                    conversations.map(
                                        conversation => {

                                            const isActive =
                                                activeConversation?.conversation_id ===
                                                conversation.conversation_id;

                                            const unread =
                                                Number(
                                                    conversation.unread_count ||
                                                    0
                                                );

                                            return (

                                                <button
                                                    key={
                                                        conversation.conversation_id
                                                    }
                                                    onClick={() =>
                                                        openConversation(
                                                            conversation
                                                        )
                                                    }
                                                    className={`
                                                        w-full text-left
                                                        px-4 py-4
                                                        border-b
                                                        transition
                                                        ${
                                                            isActive
                                                                ? 'bg-[#436e0c]/10'
                                                                : 'hover:bg-gray-50'
                                                        }
                                                    `}
                                                >

                                                    <div className="flex gap-3">

                                                        {/* Avatar */}

                                                        <div className="relative flex-shrink-0">

                                                            <div className="w-12 h-12 rounded-full bg-[#436e0c] text-white flex items-center justify-center font-bold text-sm">
                                                                {getInitials(
                                                                    getHostName(
                                                                        conversation
                                                                    )
                                                                )}
                                                            </div>

                                                            {unread > 0 && (

                                                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                                    {getUnreadCount(
                                                                        conversation
                                                                    )}
                                                                </span>

                                                            )}

                                                        </div>


                                                        {/* Conversation info */}

                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex items-center justify-between gap-2">

                                                                <div className="flex items-center gap-1.5 min-w-0">

                                                                    <span
                                                                        className={`
                                                                            truncate
                                                                            text-sm
                                                                            ${
                                                                                unread > 0
                                                                                    ? 'font-bold text-gray-900'
                                                                                    : 'font-semibold text-gray-800'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {getHostName(
                                                                            conversation
                                                                        )}
                                                                    </span>

                                                                    {conversation.verified && (

                                                                        <span
                                                                            className="text-[#436e0c] text-xs"
                                                                            title="Verified host"
                                                                        >
                                                                            ✓
                                                                        </span>

                                                                    )}

                                                                </div>

                                                                <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                                    {formatTime(
                                                                        conversation.updated_at
                                                                    )}
                                                                </span>

                                                            </div>


                                                            <p
                                                                className={`
                                                                    text-xs
                                                                    mt-1
                                                                    truncate
                                                                    ${
                                                                        unread > 0
                                                                            ? 'text-gray-700 font-medium'
                                                                            : 'text-gray-500'
                                                                    }
                                                                `}
                                                            >
                                                                {conversation.last_message_snippet ||
                                                                    'Start a conversation with this host'}
                                                            </p>


                                                            {conversation.rating_score && (

                                                                <div className="flex items-center gap-1 mt-1">

                                                                    <span className="text-amber-500 text-xs">
                                                                        ★
                                                                    </span>

                                                                    <span className="text-[11px] text-gray-400">
                                                                        {Number(
                                                                            conversation.rating_score
                                                                        ).toFixed(1)}
                                                                    </span>

                                                                </div>

                                                            )}

                                                        </div>

                                                    </div>

                                                </button>
                                            );
                                        }
                                    )

                                )}

                            </div>

                        </aside>


                        {/* =================================
                            CHAT PANEL
                        ================================== */}

                        <section
                            className={`
                                flex flex-col min-w-0
                                ${
                                    activeConversation
                                        ? 'flex'
                                        : 'hidden md:flex'
                                }
                            `}
                        >

                            {!activeConversation ? (

                                <div className="flex-1 flex items-center justify-center p-8">

                                    <div className="text-center max-w-sm">

                                        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-3xl mb-5">
                                            💬
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900">
                                            Your messages
                                        </h2>

                                        <p className="text-sm text-gray-500 mt-2 leading-6">
                                            Select a conversation to chat with
                                            a host about your travel plans,
                                            packages and questions.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <>

                                    {/* =========================
                                        CHAT HEADER
                                    ========================== */}

                                    <div className="px-4 sm:px-5 py-4 border-b bg-white">

                                        <div className="flex items-center gap-3">

                                            <button
                                                onClick={() =>
                                                    setActiveConversation(
                                                        null
                                                    )
                                                }
                                                className="md:hidden w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600"
                                            >
                                                ←
                                            </button>


                                            <div className="w-11 h-11 rounded-full bg-[#436e0c] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {getInitials(
                                                    getHostName(
                                                        activeConversation
                                                    )
                                                )}
                                            </div>


                                            <div className="min-w-0">

                                                <div className="flex items-center gap-1.5">

                                                    <h2 className="font-semibold text-gray-900 truncate">
                                                        {getHostName(
                                                            activeConversation
                                                        )}
                                                    </h2>

                                                    {activeConversation.verified && (

                                                        <span className="text-[#436e0c] text-sm">
                                                            ✓
                                                        </span>

                                                    )}

                                                </div>

                                                <p className="text-xs text-gray-500">
                                                    Tour Host
                                                    {activeConversation.rating_score
                                                        ? ` • ★ ${Number(
                                                            activeConversation.rating_score
                                                        ).toFixed(1)}`
                                                        : ''}
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    {/* =========================
                                        PACKAGE CONTEXT
                                    ========================== */}

                                    {activeConversation.associated_package_id && (

                                        <div className="px-4 py-3 bg-gray-50 border-b">

                                            <div className="flex items-center justify-between gap-3">

                                                <div className="min-w-0">

                                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400">
                                                        Package
                                                    </p>

                                                    <p className="text-sm font-semibold text-gray-800 truncate">
                                                        {activeConversation.package_title ||
                                                            'Package inquiry'}
                                                    </p>

                                                </div>

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/package/${activeConversation.associated_package_id}`
                                                        )
                                                    }
                                                    className="text-xs font-semibold text-[#436e0c] hover:underline flex-shrink-0"
                                                >
                                                    View Package
                                                </button>

                                            </div>

                                        </div>

                                    )}


                                    {/* =========================
                                        MESSAGES
                                    ========================== */}

                                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-gray-50">

                                        {loadingMessages ? (

                                            <div className="space-y-4">

                                                <div className="flex">
                                                    <div className="w-44 h-12 rounded-2xl bg-gray-200 animate-pulse" />
                                                </div>

                                                <div className="flex justify-end">
                                                    <div className="w-56 h-12 rounded-2xl bg-[#436e0c]/20 animate-pulse" />
                                                </div>

                                                <div className="flex">
                                                    <div className="w-64 h-16 rounded-2xl bg-gray-200 animate-pulse" />
                                                </div>

                                            </div>

                                        ) : messages.length === 0 ? (

                                            <div className="h-full flex items-center justify-center">

                                                <div className="text-center max-w-sm">

                                                    <div className="text-3xl mb-3">
                                                        👋
                                                    </div>

                                                    <h3 className="font-semibold text-gray-900">
                                                        Start the conversation
                                                    </h3>

                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Ask the host about availability,
                                                        itinerary, pricing or anything
                                                        else about your trip.
                                                    </p>

                                                </div>

                                            </div>

                                        ) : (

                                            <div className="space-y-3">

                                                {messages.map(
                                                    (message, index) => {

                                                        const currentUserId =
                                                            Number(
                                                                JSON.parse(
                                                                    localStorage.getItem(
                                                                        'user'
                                                                    ) || '{}'
                                                                )?.id
                                                            );

                                                        const isMine =
                                                            Number(
                                                                message.sender_id
                                                            ) ===
                                                            currentUserId;

                                                        return (

                                                            <div
                                                                key={
                                                                    message.id ||
                                                                    index
                                                                }
                                                                className={`
                                                                    flex
                                                                    ${
                                                                        isMine
                                                                            ? 'justify-end'
                                                                            : 'justify-start'
                                                                    }
                                                                `}
                                                            >

                                                                <div
                                                                    className={`
                                                                        max-w-[80%]
                                                                        sm:max-w-[65%]
                                                                        ${
                                                                            isMine
                                                                                ? 'items-end'
                                                                                : 'items-start'
                                                                        }
                                                                        flex flex-col
                                                                    `}
                                                                >

                                                                    <div
                                                                        className={`
                                                                            px-4 py-2.5
                                                                            rounded-2xl
                                                                            text-sm
                                                                            leading-6
                                                                            ${
                                                                                isMine
                                                                                    ? 'bg-[#436e0c] text-white rounded-br-md'
                                                                                    : 'bg-white text-gray-800 border rounded-bl-md shadow-sm'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {message.message_text ||
                                                                            message.content}
                                                                    </div>

                                                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                                                        {formatTime(
                                                                            message.created_at
                                                                        )}
                                                                    </span>

                                                                </div>

                                                            </div>

                                                        );
                                                    }
                                                )}

                                                <div
                                                    ref={
                                                        messagesEndRef
                                                    }
                                                />

                                            </div>

                                        )}

                                    </div>


                                    {/* =========================
                                        MESSAGE INPUT
                                    ========================== */}

                                    <form
                                        onSubmit={
                                            handleSendMessage
                                        }
                                        className="p-3 sm:p-4 border-t bg-white"
                                    >

                                        <div className="flex items-end gap-2">

                                            <textarea
                                                value={messageText}
                                                onChange={event =>
                                                    setMessageText(
                                                        event.target.value
                                                    )
                                                }
                                                onKeyDown={event => {

                                                    if (
                                                        event.key ===
                                                            'Enter' &&
                                                        !event.shiftKey
                                                    ) {

                                                        event.preventDefault();

                                                        handleSendMessage(
                                                            event
                                                        );
                                                    }
                                                }}
                                                rows={1}
                                                placeholder="Write a message..."
                                                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#436e0c] focus:ring-2 focus:ring-[#436e0c]/10"
                                            />


                                            <button
                                                type="submit"
                                                disabled={
                                                    !messageText.trim() ||
                                                    sending
                                                }
                                                className="w-12 h-12 rounded-xl bg-[#436e0c] text-white flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
                                            >
                                                {sending
                                                    ? '...'
                                                    : '➤'}
                                            </button>

                                        </div>

                                        <p className="text-[10px] text-gray-400 mt-2 px-1">
                                            Press Enter to send • Shift + Enter for a new line
                                        </p>

                                    </form>

                                </>

                            )}

                        </section>

                    </div>

                </div>

            </div>

        </div>
    );
}