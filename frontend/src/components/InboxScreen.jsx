import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Flag, MoreHorizontal } from 'lucide-react';

import ReportDialog from './ReportDialog';


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

    const [reportMenuOpen, setReportMenuOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState(null);

    const messagesEndRef = useRef(null);
    const inboxLoadedRef = useRef(false);

    const token = localStorage.getItem('touristo_token');
    const storedUser = JSON.parse(
        localStorage.getItem('touristo_user') || '{}'
    );

    const isHost = storedUser?.role === 'host';

    // The other participant in the conversation (never the signed-in user).
    const partnerUserId = isHost
        ? activeConversation?.traveler_id
        : activeConversation?.partner_user_id;

    const canReportPartner =
        Boolean(partnerUserId) &&
        Number(partnerUserId) !== Number(storedUser?.id);

    const messagingText = {
        headerTitle: isHost
            ? 'Customer Inquiries'
            : 'Messages',

        headerSubtitle: isHost
            ? 'Connect directly with your travelers'
            : 'Connect directly with your tour hosts',

        emptyTitle: isHost
            ? 'No customer inquiries yet'
            : 'No conversations yet',

        emptyDescription: isHost
            ? 'When a traveler contacts you about a package, your conversation will appear here.'
            : 'When you contact a host about a package, your conversation will appear here.',

        emptyButton: isHost
            ? 'View My Packages'
            : 'Explore Destinations',

        emptyButtonRoute: isHost
            ? '/my-packages'
            : '/destinations',

        panelTitle: isHost
            ? 'Your inquiries'
            : 'Your messages',

        panelDescription: isHost
            ? 'Select a conversation to chat with a traveler about their travel plans, packages and questions.'
            : 'Select a conversation to chat with a host about your travel plans, packages and questions.',

        otherPartyLabel: isHost
            ? 'Traveler'
            : 'Tour Host',

        conversationFallback: isHost
            ? 'Start a conversation with this traveler'
            : 'Start a conversation with this host',

        startTitle: 'Start the conversation',

        startDescription: isHost
            ? 'Reply to the traveler about availability, itinerary, pricing or anything else about their trip.'
            : 'Ask the host about availability, itinerary, pricing or anything else about your trip.'
    };

    // =====================================================
    // AUTH HEADERS
    // =====================================================

    const getHeaders = useCallback(() => ({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    }), [token]);




    // =====================================================
    // LOAD CONVERSATION
    // =====================================================

    const openConversation = useCallback(async conversation => {

        try {

            setActiveConversation(conversation);
            setLoadingMessages(true);
            setError('');

            const response = await fetch(
                `/api/messages/conversation/${conversation.conversation_id}`,
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
                `/api/messages/conversation/${conversation.conversation_id}/read`,
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
    }, [getHeaders, navigate, location]);
    // =====================================================
    // LOAD INBOX
    // =====================================================

    const loadInbox = useCallback(async () => {
        try {
            setLoadingInbox(true);
            setError('');

            if (!token) {
                navigate('/login');
                return;
            }

            const response = await fetch(
                `/api/messages/inbox`,
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
    }, [token, navigate, getHeaders, location, openConversation]);



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
                `/api/messages/conversation/${activeConversation.conversation_id}/messages`,
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
        if (inboxLoadedRef.current) {
            return;
        }

        inboxLoadedRef.current = true;

        loadInbox();
    }, [loadInbox]);


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
            <div className="min-h-screen bg-[color:var(--bg-primary)] pb-24">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

                    <div className="h-8 w-40 bg-[color:var(--bg-secondary)] rounded-lg animate-pulse mb-6" />

                    <div className="bg-white rounded-2xl shadow-[var(--shadow-sm)] overflow-hidden">

                        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[650px]">

                            <div className="border-r p-4 space-y-4">

                                {[1, 2, 3, 4].map(item => (
                                    <div
                                        key={item}
                                        className="flex gap-3"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[color:var(--bg-secondary)] animate-pulse" />

                                        <div className="flex-1">
                                            <div className="h-4 bg-[color:var(--bg-secondary)] rounded w-32 mb-2 animate-pulse" />
                                            <div className="h-3 bg-[color:var(--bg-secondary)] rounded w-44 animate-pulse" />
                                        </div>
                                    </div>
                                ))}

                            </div>

                            <div className="hidden md:flex items-center justify-center">
                                <div className="text-[color:var(--text-muted)]">
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
        <div className="min-h-screen bg-[color:var(--bg-primary)] pb-24">

            {/* =========================================
                HEADER
            ========================================== */}

            <div className="bg-white border-b">

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

                    <div className="flex items-center justify-between">

                        <div>

                            <button
                                onClick={() => navigate(-1)}
                                className="text-sm text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] mb-1"
                            >
                                ← Back
                            </button>

                            <h1 className="text-3xl tracking-[-0.03em] text-[color:var(--text-primary)]">
                                {messagingText.headerTitle}
                            </h1>

                            <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                                {messagingText.headerSubtitle}
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

                    <div role="alert" className="bg-[color:var(--danger-soft)] border border-[color:var(--danger)]/35 text-[color:var(--danger)] rounded-xl px-4 py-3 text-sm">
                        {error}
                    </div>

                </div>
            )}


            {/* =========================================
                MESSAGING AREA
            ========================================== */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">

                <div className="bg-white rounded-2xl shadow-[var(--shadow-sm)] border overflow-hidden">

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

                                    <h2 className="font-semibold text-[color:var(--text-primary)]">
                                        Conversations
                                    </h2>

                                    <span className="text-xs text-[color:var(--text-muted)]">
                                        {conversations.length}
                                    </span>

                                </div>

                            </div>


                            <div className="flex-1 overflow-y-auto">

                                {conversations.length === 0 ? (

                                    <div className="px-6 py-16 text-center">

                                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[color:var(--bg-secondary)] flex items-center justify-center text-2xl">
                                            💬
                                        </div>

                                        <h3 className="font-semibold text-[color:var(--text-primary)]">
                                            {messagingText.emptyTitle}
                                        </h3>

                                        <p className="text-sm text-[color:var(--text-secondary)] mt-2 leading-6">
                                            {messagingText.emptyDescription}
                                        </p>

                                        <button
                                            onClick={() =>
                                                navigate(messagingText.emptyButtonRoute)
                                            }
                                            className="mt-5 px-5 py-2.5 rounded-xl bg-[color:var(--brand-primary)] text-white text-sm font-semibold hover:opacity-90 transition"
                                        >
                                            {messagingText.emptyButton}
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
                                                                ? 'bg-[color:var(--brand-primary)]/10'
                                                                : 'hover:bg-[color:var(--bg-secondary)]'
                                                        }
                                                    `}
                                                >

                                                    <div className="flex gap-3">

                                                        {/* Avatar */}

                                                        <div className="relative flex-shrink-0">

                                                            <div className="w-12 h-12 rounded-full bg-[color:var(--brand-primary)] text-white flex items-center justify-center font-bold text-sm">
                                                                {getInitials(
                                                                    getHostName(
                                                                        conversation
                                                                    )
                                                                )}
                                                            </div>

                                                            {unread > 0 && (

                                                                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[color:var(--danger)] text-white text-[10px] font-bold flex items-center justify-center">
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
                                                                                    ? 'font-bold text-[color:var(--text-primary)]'
                                                                                    : 'font-semibold text-[color:var(--text-primary)]'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {getHostName(
                                                                            conversation
                                                                        )}
                                                                    </span>

                                                                    {conversation.verified && (

                                                                        <span
                                                                            className="text-[color:var(--brand-primary)] text-xs"
                                                                            title="Verified host"
                                                                        >
                                                                            ✓
                                                                        </span>

                                                                    )}

                                                                </div>

                                                                <span className="text-[10px] text-[color:var(--text-muted)] flex-shrink-0">
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
                                                                            ? 'text-[color:var(--text-primary)] font-medium'
                                                                            : 'text-[color:var(--text-secondary)]'
                                                                    }
                                                                `}
                                                            >
                                                                {conversation.last_message_snippet ||
                                                                    messagingText.conversationFallback}
                                                            </p>


                                                            {conversation.rating_score && (

                                                                <div className="flex items-center gap-1 mt-1">

                                                                    <span className="text-[color:var(--warning)] text-xs">
                                                                        ★
                                                                    </span>

                                                                    <span className="text-[11px] text-[color:var(--text-muted)]">
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

                                        <div className="w-20 h-20 mx-auto rounded-full bg-[color:var(--bg-secondary)] flex items-center justify-center text-3xl mb-5">
                                            💬
                                        </div>

                                        <h2 className="text-xl text-[color:var(--text-primary)]">
                                            {messagingText.panelTitle}
                                        </h2>

                                        <p className="text-sm text-[color:var(--text-secondary)] mt-2 leading-6">
                                            {messagingText.panelDescription}
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
                                                className="md:hidden w-9 h-9 rounded-full hover:bg-[color:var(--bg-secondary)] flex items-center justify-center text-[color:var(--text-secondary)]"
                                            >
                                                ←
                                            </button>


                                            <div className="w-11 h-11 rounded-full bg-[color:var(--brand-primary)] text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                                                {getInitials(
                                                    getHostName(
                                                        activeConversation
                                                    )
                                                )}
                                            </div>


                                            <div className="min-w-0">

                                                <div className="flex items-center gap-1.5">

                                                    <h2 className="font-semibold text-[color:var(--text-primary)] truncate">
                                                        {getHostName(
                                                            activeConversation
                                                        )}
                                                    </h2>

                                                    {activeConversation.verified && (

                                                        <span className="text-[color:var(--brand-primary)] text-sm">
                                                            ✓
                                                        </span>

                                                    )}

                                                </div>

                                                <p className="text-xs text-[color:var(--text-secondary)]">
                                                    {messagingText.otherPartyLabel}
                                                    {activeConversation.rating_score
                                                        ? ` • ★ ${Number(
                                                            activeConversation.rating_score
                                                        ).toFixed(1)}`
                                                        : ''}
                                                </p>

                                            </div>

                                            {canReportPartner && (
                                                <div className="relative ml-auto">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setReportMenuOpen(open => !open)
                                                        }
                                                        aria-label="More conversation actions"
                                                        aria-haspopup="menu"
                                                        aria-expanded={reportMenuOpen}
                                                        className="w-9 h-9 rounded-full flex items-center justify-center text-[color:var(--text-muted)] transition hover:bg-[color:var(--bg-secondary)] hover:text-[color:var(--danger)]"
                                                    >
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </button>

                                                    {reportMenuOpen && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                aria-label="Close menu"
                                                                onClick={() =>
                                                                    setReportMenuOpen(false)
                                                                }
                                                                className="fixed inset-0 z-40 cursor-default"
                                                            />

                                                            <div
                                                                role="menu"
                                                                className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-[color:var(--border-light)] bg-[color:var(--surface-primary)] py-1 shadow-[var(--shadow-lg)]"
                                                            >
                                                                <button
                                                                    type="button"
                                                                    role="menuitem"
                                                                    onClick={() => {
                                                                        setReportMenuOpen(false);
                                                                        setReportTarget({
                                                                            targetType: 'user',
                                                                            targetId: partnerUserId,
                                                                            targetLabel: isHost
                                                                                ? activeConversation?.traveler_name
                                                                                : getHostName(activeConversation)
                                                                        });
                                                                    }}
                                                                    className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-[color:var(--text-primary)] transition hover:bg-[color:var(--bg-secondary)]"
                                                                >
                                                                    <Flag className="w-4 h-4 text-[color:var(--danger)]" />
                                                                    Report User
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            )}

                                        </div>

                                    </div>


                                    {/* =========================
                                        PACKAGE CONTEXT
                                    ========================== */}

                                    {activeConversation.associated_package_id && (

                                        <div className="px-4 py-3 bg-[color:var(--bg-primary)] border-b">

                                            <div className="flex items-center justify-between gap-3">

                                                <div className="min-w-0">

                                                    <p className="text-[10px] uppercase tracking-wider font-semibold text-[color:var(--text-muted)]">
                                                        Package
                                                    </p>

                                                    <p className="text-sm font-semibold text-[color:var(--text-primary)] truncate">
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
                                                    className="text-xs font-semibold text-[color:var(--brand-primary)] hover:underline flex-shrink-0"
                                                >
                                                    View Package
                                                </button>

                                            </div>

                                        </div>

                                    )}


                                    {/* =========================
                                        MESSAGES
                                    ========================== */}

                                    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 bg-[color:var(--bg-primary)]">

                                        {loadingMessages ? (

                                            <div className="space-y-4">

                                                <div className="flex">
                                                    <div className="w-44 h-12 rounded-2xl bg-[color:var(--bg-secondary)] animate-pulse" />
                                                </div>

                                                <div className="flex justify-end">
                                                    <div className="w-56 h-12 rounded-2xl bg-[color:var(--brand-primary)]/20 animate-pulse" />
                                                </div>

                                                <div className="flex">
                                                    <div className="w-64 h-16 rounded-2xl bg-[color:var(--bg-secondary)] animate-pulse" />
                                                </div>

                                            </div>

                                        ) : messages.length === 0 ? (

                                            <div className="h-full flex items-center justify-center">

                                                <div className="text-center max-w-sm">

                                                    <div className="text-3xl mb-3">
                                                        👋
                                                    </div>

                                                    <h3 className="font-semibold text-[color:var(--text-primary)]">
                                                        {messagingText.startTitle}
                                                    </h3>

                                                    <p className="text-sm text-[color:var(--text-secondary)] mt-1">
                                                        {messagingText.startDescription}
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
                                                                        'touristo_user'
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
                                                                                    ? 'bg-[color:var(--brand-primary)] text-white rounded-br-md'
                                                                                    : 'bg-white text-[color:var(--text-primary)] border rounded-bl-md shadow-[var(--shadow-sm)]'
                                                                            }
                                                                        `}
                                                                    >
                                                                        {message.message_text ||
                                                                            message.content}
                                                                    </div>

                                                                    <span className="text-[10px] text-[color:var(--text-muted)] mt-1 px-1">
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
                                            aria-label="Write a message"
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
                                                className="flex-1 resize-none rounded-xl border border-[color:var(--border-light)] px-4 py-3 text-sm outline-none focus:border-[color:var(--brand-primary)] focus:ring-2 focus:ring-[color:var(--brand-primary)]/10"
                                            />


                                            <button
                                                type="submit"
                                                disabled={
                                                    !messageText.trim() ||
                                                    sending
                                                }
                                                className="w-12 h-12 rounded-xl bg-[color:var(--brand-primary)] text-white flex items-center justify-center font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition"
                                            >
                                                {sending
                                                    ? '...'
                                                    : '➤'}
                                            </button>

                                        </div>

                                        <p className="text-[10px] text-[color:var(--text-muted)] mt-2 px-1">
                                            Press Enter to send • Shift + Enter for a new line
                                        </p>

                                    </form>

                                </>

                            )}

                        </section>

                    </div>

                </div>

            </div>

            {reportTarget && (
                <ReportDialog
                    targetType={reportTarget.targetType}
                    targetId={reportTarget.targetId}
                    targetLabel={reportTarget.targetLabel}
                    onClose={() => setReportTarget(null)}
                />
            )}

        </div>
    );
}
