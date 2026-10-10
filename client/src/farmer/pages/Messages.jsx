import React, { useState, useRef, useEffect } from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Send, Phone, Video, Info, ArrowLeft, Check, CheckCheck, Paperclip, Smile, ShieldAlert, ShieldCheck, Loader2, Trash2 } from 'lucide-react';
import { io } from 'socket.io-client';

export default function Messages() {
  const { user } = useOutletContext();
  const location = useLocation();
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [activeBuyerId, setActiveBuyerId] = useState(null);
  const activeBuyerIdRef = useRef(activeBuyerId);
  useEffect(() => {
    activeBuyerIdRef.current = activeBuyerId;
  }, [activeBuyerId]);

  const [isTabVisible, setIsTabVisible] = useState(document.visibilityState === 'visible');
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  const [chats, setChats] = useState([]);
  const [chatSuggestions, setChatSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chatEndRef = useRef(null);
  const socketRef = useRef(null);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiRef = useRef(null);

  // 1. Fetch chat threads from MongoDB
  const fetchChats = async (selectId = null) => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId) return;

    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_BASE}/api/messages/chats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch messages.');
      }

      let loadedChats = data.chats || [];

      // Check if redirected from a buyer's card to start a new negotiation
      const redirectState = location.state;
      if (redirectState && redirectState.contactBuyerId) {
        const { contactBuyerId, contactBuyerName, contactCategory, contactLocation } = redirectState;
        
        // Check if conversation already exists in threads
        const exists = loadedChats.some(chat => chat.id.toString() === contactBuyerId.toString());
        
        if (!exists) {
          // Add a temporary chat thread to the top of the sidebar
          const tempChat = {
            id: contactBuyerId,
            name: contactBuyerName,
            category: contactCategory,
            location: contactLocation,
            cropContext: 'General Negotiation',
            status: 'online',
            unreadCount: 0,
            messages: []
          };
          loadedChats = [tempChat, ...loadedChats];
        }
        
        // Select this buyer as active conversation
        setActiveBuyerId(contactBuyerId);
      } else if (loadedChats.length > 0 && !selectId) {
        // Select the first conversation by default
        setActiveBuyerId(loadedChats[0].id);
      } else if (selectId) {
        setActiveBuyerId(selectId);
      }

      setChats(loadedChats);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to synchronize negotiations.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Initialize Socket.io Connection
  useEffect(() => {
    const currentUserId = user?.id || user?._id;
    if (!currentUserId) return;

    // Fetch message history REST threads
    fetchChats();

    // Establish WebSocket Connection
    console.log(`[Socket] Connecting to ${API_BASE} as user ${currentUserId}`);
    socketRef.current = io(API_BASE);
    socketRef.current.emit('join', currentUserId);

    // Listen for live messages received from database socket
    socketRef.current.on('receiveMessage', (msg) => {
      console.log('[Socket] receiveMessage event received:', msg);
      setChats(prev => {
        // Check if this message participant already exists in threads
        const senderIdStr = msg.senderId.toString();
        const exists = prev.some(chat => chat.id.toString() === senderIdStr);

        if (exists) {
          return prev.map(chat => {
            if (chat.id.toString() === senderIdStr) {
              const msgExists = chat.messages.some(m => m.id === msg.id);
              if (msgExists) return chat;

              const isActive = activeBuyerIdRef.current && activeBuyerIdRef.current.toString() === chat.id.toString();
              console.log(`[Socket] Message from active buyer? ${isActive} (activeBuyerIdRef=${activeBuyerIdRef.current}, chat.id=${chat.id})`);

              return {
                ...chat,
                cropContext: msg.cropContext,
                unreadCount: isActive ? 0 : chat.unreadCount + 1,
                messages: [...chat.messages, { ...msg, sender: 'buyer' }]
              };
            }
            return chat;
          });
        } else {
          // If thread does not exist yet, reload the chats sidebar to fetch new details
          console.log(`[Socket] Chat thread with ${senderIdStr} not found, fetching sidebar chats...`);
          fetchChats(activeBuyerIdRef.current);
          return prev;
        }
      });
    });

    // Listen for self message confirmation
    socketRef.current.on('messageSent', (msg) => {
      console.log('[Socket] messageSent event received:', msg);
      setChats(prev => {
        const receiverIdStr = msg.receiverId.toString();
        return prev.map(chat => {
          if (chat.id.toString() === receiverIdStr) {
            const msgExists = chat.messages.some(m => m.id === msg.id);
            if (msgExists) return chat;

            return {
              ...chat,
              messages: [...chat.messages, { ...msg, sender: 'farmer' }]
            };
          }
          return chat;
        });
      });
    });

    // Listen for read receipt confirmations from the recipient
    socketRef.current.on('messagesRead', (data) => {
      console.log('[Socket] messagesRead event received:', data);
      const { readerId } = data;
      setChats(prev => prev.map(chat => {
        if (chat.id.toString() === readerId.toString()) {
          console.log(`[Socket] Marking farmer-sent messages in chat ${chat.id} as read (blue tick)`);
          return {
            ...chat,
            messages: chat.messages.map(m => 
              m.sender === 'farmer' ? { ...m, status: 'read' } : m
            )
          };
        }
        return chat;
      }));
    });

    // Listen for deleted messages
    socketRef.current.on('messageDeleted', (data) => {
      console.log('[Socket] messageDeleted event received:', data);
      const { messageId } = data;
      setChats(prev => prev.map(chat => ({
        ...chat,
        messages: chat.messages.filter(m => m.id !== messageId && m._id !== messageId)
      })));
    });

    return () => {
      if (socketRef.current) {
        console.log('[Socket] Disconnecting socketRef');
        socketRef.current.disconnect();
      }
    };
  }, [user?.id]);

  const activeChat = chats.find(c => c.id.toString() === activeBuyerId?.toString());

  // 3. Scroll only the message feed flexbox container (Fixes window scroll issue)
  useEffect(() => {
    if (activeBuyerId && activeChat?.messages.length) {
      const scrollContainer = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
      scrollContainer();
      
      const timer = setTimeout(scrollContainer, 50);
      return () => clearTimeout(timer);
    }
  }, [activeBuyerId, activeChat?.messages.length]);

  // Mark messages as read when active chat, its messages, or tab visibility updates
  useEffect(() => {
    const currentUserId = user?.id || user?._id;
    if (!activeBuyerId || !activeChat || !socketRef.current || !isTabVisible || !currentUserId) return;

    // Check if there are any unread messages from the buyer
    const hasUnread = activeChat.messages.some(m => m.sender === 'buyer' && m.status !== 'read');
    console.log(`[Socket] Checking unread (TabVisible=${isTabVisible}): activeBuyerId=${activeBuyerId}, hasUnread=${hasUnread}`);

    if (hasUnread) {
      console.log(`[Socket] Emitting readMessages event: senderId=${activeBuyerId} (buyer), receiverId=${currentUserId} (farmer)`);
      // Emit socket event to update DB and notify sender
      socketRef.current.emit('readMessages', {
        senderId: activeBuyerId,
        receiverId: currentUserId
      });

      // Update state locally
      setChats(prev => prev.map(chat => {
        if (chat.id.toString() === activeBuyerId.toString()) {
          return {
            ...chat,
            unreadCount: 0,
            messages: chat.messages.map(m => 
              m.sender === 'buyer' ? { ...m, status: 'read' } : m
            )
          };
        }
        return chat;
      }));
    }
  }, [activeBuyerId, activeChat?.messages?.length, user?.id, user?._id, isTabVisible]);

  // 4. Send Message via Socket.io
  const handleSendMessage = (text) => {
    const currentUserId = user?.id || user?._id;
    if (!text.trim() || !activeBuyerId || !socketRef.current || !currentUserId) return;

    socketRef.current.emit('sendMessage', {
      senderId: currentUserId,
      receiverId: activeBuyerId,
      text: text.trim(),
      cropContext: activeChat.cropContext || 'General Negotiation'
    });

    setNewMessageText('');
  };

  // 5. Delete Message via Socket.io
  const handleDeleteMessage = (messageId) => {
    const currentUserId = user?.id || user?._id;
    if (!messageId || !activeBuyerId || !socketRef.current || !currentUserId) return;
    
    socketRef.current.emit('deleteMessage', {
      messageId,
      senderId: currentUserId,
      receiverId: activeBuyerId
    });
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickReply = (reply) => {
    handleSendMessage(reply);
  };

  // 6. Fetch Real-time AI Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      const currentUserId = user?.id || user?._id;
      if (!activeChat || !currentUserId) return;
      try {
        const response = await fetch(`${API_BASE}/api/messages/suggestions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': currentUserId
          },
          body: JSON.stringify({
            history: activeChat.messages,
            context: activeChat.cropContext
          })
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.suggestions)) {
          setChatSuggestions(data.suggestions);
        }
      } catch (err) {
        console.error('Failed to fetch AI suggestions:', err);
      }
    };
    
    // Debounce to prevent excessive calls
    const timeoutId = setTimeout(fetchSuggestions, 500);
    return () => clearTimeout(timeoutId);
  }, [activeChat?.messages, activeChat?.cropContext, user?.id, user?._id]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.cropContext.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-[calc(100vh-140px)] flex bg-white dark:bg-[#1E293B] rounded-3xl border border-charcoal/5 dark:border-white/5 shadow-sm overflow-hidden relative">
      
      {/* Messages Sidebar */}
      <div className={`w-full md:w-80 lg:w-96 shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full bg-white dark:bg-[#1E293B] transition-all duration-300 ${
        activeBuyerId ? 'hidden md:flex' : 'flex'
      }`}>
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-50 space-y-3">
          <div>
            <h2 className="font-display font-extrabold text-xl text-charcoal dark:text-gray-100">Negotiation Chats</h2>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">Secure direct messages with active buyers.</p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chat or crop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 p-2 space-y-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
              <p className="text-xs text-gray-400 font-bold">Loading chat logs...</p>
            </div>
          ) : filteredChats.length > 0 ? (
            filteredChats.map(chat => {
              const lastMsg = chat.messages[chat.messages.length - 1];
              const isSelected = activeBuyerId?.toString() === chat.id.toString();
              return (
                <button
                  key={chat.id}
                  onClick={() => setActiveBuyerId(chat.id)}
                  className={`w-full p-3.5 rounded-2xl flex gap-3 text-left transition-all relative cursor-pointer ${
                    isSelected
                      ? 'bg-[#F8FAF5] dark:bg-[#0F172A] border border-primary/10 shadow-sm'
                      : 'border border-transparent hover:bg-gray-50 dark:bg-[#0F172A]/70'
                  }`}
                >
                  {/* Avatar bubble */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/5 text-primary flex items-center justify-center font-display font-extrabold text-sm border border-primary/5">
                      {chat.name.charAt(0)}
                    </div>
                    {chat.status === 'online' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Content details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-display font-bold text-sm text-charcoal dark:text-gray-100 truncate">{chat.name}</h4>
                      <span className="text-[10px] text-gray-400 font-semibold">{lastMsg ? lastMsg.time : ''}</span>
                    </div>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-1.5 py-0.25 rounded-md mt-1 inline-block">
                      {chat.cropContext}
                    </span>
                    <p className="text-xs text-gray-400 truncate font-semibold mt-1">
                      {lastMsg ? (lastMsg.sender === 'farmer' ? 'You: ' : '') + lastMsg.text : 'Start conversation...'}
                    </p>
                  </div>

                  {/* Unread badge */}
                  {chat.unreadCount > 0 && (
                    <span className="absolute right-4 bottom-4 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[9px] font-bold min-w-[16px] text-center shadow-sm">
                      {chat.unreadCount}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="py-8 text-center text-sm text-gray-400 font-medium">No conversations found.</div>
          )}
        </div>
      </div>

      {/* Main Conversation Window */}
      {activeChat ? (
        <div className="flex-1 flex h-full bg-[#FAFBF8] dark:bg-[#0F172A] relative overflow-hidden">
          
          {/* Active Chat Main Feed Column */}
          <div className="flex-1 flex flex-col h-full min-w-0">
            {/* Header Panel */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E293B] flex items-center justify-between shadow-sm shrink-0">
              <div className="flex items-center gap-3">
                {/* Back btn for mobile */}
                <button
                  onClick={() => setActiveBuyerId(null)}
                  className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary md:hidden focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <div>
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-charcoal dark:text-gray-100 tracking-tight leading-none truncate max-w-[180px] sm:max-w-[300px]">{activeChat.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeChat.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="capitalize">{activeChat.status}</span>
                  </div>
                </div>
              </div>

              {/* Quick action buttons */}
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary bg-white dark:bg-[#1E293B] transition-colors hover:shadow-sm focus:outline-none">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-xl border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary bg-white dark:bg-[#1E293B] transition-colors hover:shadow-sm focus:outline-none">
                  <Video className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className={`hidden md:flex p-2 rounded-xl border transition-colors hover:shadow-sm focus:outline-none cursor-pointer ${
                    showDetails
                      ? 'border-primary/20 text-primary bg-[#F8FAF5]'
                      : 'border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary bg-white dark:bg-[#1E293B]'
                  }`}
                >
                  <Info className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Escrow Banner Context */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/50 px-4 py-2.5 flex items-center gap-2 shrink-0">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-400">
                Active negotiation for <strong className="font-bold">{activeChat.cropContext}</strong>. Use the platform escrow to protect payments.
              </p>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.messages.length > 0 ? (
                activeChat.messages.map((msg, idx) => {
                  const isFarmer = msg.sender === 'farmer';
                  return (
                    <div
                      key={msg.id || msg._id || idx}
                      className={`flex ${isFarmer ? 'justify-end' : 'justify-start'} group items-center gap-2`}
                    >
                      {isFarmer && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id || msg._id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 transition-opacity focus:outline-none"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <div className={`max-w-[70%] space-y-1 ${isFarmer ? 'text-right' : 'text-left mr-auto'}`}>
                        <div className={`py-2 px-3.5 rounded-2xl text-sm font-medium leading-relaxed w-fit ${
                          isFarmer
                            ? 'bg-primary text-white rounded-br-none shadow-md shadow-primary/10 ml-auto'
                            : 'bg-white dark:bg-[#1E293B] text-charcoal dark:text-gray-100 rounded-bl-none border border-gray-100 dark:border-gray-800 shadow-sm mr-auto'
                        }`}>
                          {msg.text}
                        </div>
                        
                        {/* Timestamp & read status */}
                        <div className={`flex items-center gap-1.5 text-[10px] text-gray-400 font-semibold mt-1.5 px-1 ${
                          isFarmer ? 'justify-end' : 'justify-start'
                        }`}>
                          <span>{msg.time}</span>
                          {isFarmer && (
                            msg.status === 'read' ? (
                              <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-gray-300" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-xs text-gray-400 font-bold">
                  No conversation logs found. Send a message to start the negotiation!
                </div>
              )}

              {/* Simulated Typing Indicator */}
              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 p-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Target anchor for scrolling container */}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Replies Panel */}
            {chatSuggestions.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E293B] flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                {chatSuggestions.map((reply, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickReply(reply)}
                    className="px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 hover:border-primary/20 text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary bg-gray-50 dark:bg-[#0F172A] hover:bg-[#F8FAF5] dark:hover:bg-slate-800 transition-all whitespace-nowrap focus:outline-none shrink-0 cursor-pointer"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Form Message input */}
            <div className="relative p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E293B] flex items-center gap-3 shrink-0">
              
              {/* Custom Emoji Picker widget */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <div 
                    ref={emojiRef}
                    className="absolute bottom-16 right-4 sm:right-16 bg-white dark:bg-[#1E293B] border border-gray-155 rounded-2xl shadow-xl p-3.5 z-30 w-64"
                  >
                    <div className="grid grid-cols-6 gap-2">
                      {['😊', '😂', '🤣', '❤️', '👍', '🙏', '🌾', '🚜', '🥔', '🧅', '🍅', '🌽', '🤝', '💰', '📦', '🚛', '😮', '😢', '👏', '🔥', '✨', '✔️', '❌', '💯'].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setNewMessageText(prev => prev + emoji);
                            document.getElementById('chat-message-input')?.focus();
                          }}
                          className="text-lg p-1.5 hover:bg-primary/15 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </AnimatePresence>

              <button type="button" className="p-2 rounded-xl text-gray-400 hover:text-primary hover:bg-gray-50 dark:bg-[#0F172A] transition-colors focus:outline-none cursor-pointer">
                <Paperclip className="w-4 h-4" />
              </button>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(newMessageText);
                }}
                className="flex-1 flex gap-3"
              >
                <input
                  id="chat-message-input"
                  type="text"
                  placeholder="Type your reply here..."
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  className="flex-1 py-2 px-4 rounded-xl bg-gray-50 dark:bg-[#0F172A] border border-gray-100 dark:border-gray-800 focus:outline-none focus:border-primary/30 text-sm font-semibold text-charcoal dark:text-gray-100"
                />

                <button 
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`p-2 rounded-xl transition-colors focus:outline-none cursor-pointer ${
                    showEmojiPicker ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-primary hover:bg-gray-50 dark:bg-[#0F172A]'
                  }`}
                >
                  <Smile className="w-4 h-4" />
                </button>

                <button
                  type="submit"
                  className="p-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white transition-all shadow-md shadow-primary/10 focus:outline-none cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* Buyer Details Panel */}
          {showDetails && (
            <div className="w-80 shrink-0 border-l border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1E293B] flex flex-col h-full overflow-y-auto p-6 space-y-6 hidden md:flex">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <h4 className="font-display font-extrabold text-xs text-charcoal dark:text-gray-100 uppercase tracking-wider">Buyer Profile</h4>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-primary focus:outline-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

              {/* Profile Overview */}
              <div className="text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-[#F8FAF5] text-primary flex items-center justify-center font-display font-extrabold text-2xl border border-primary/10 mx-auto shadow-sm">
                  {activeChat.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-display font-bold text-base text-charcoal dark:text-gray-100 leading-snug">{activeChat.name}</h4>
                  <p className="text-xs text-primary font-bold mt-0.5 capitalize">{activeChat.category}</p>
                </div>
                <div className="flex justify-center items-center gap-1.5 py-1 px-3 bg-yellow-550/10 text-yellow-750 border border-yellow-200 rounded-full w-fit mx-auto text-xs font-bold uppercase tracking-wider">
                  ⭐ {activeChat.rating || '4.8'} Rating
                </div>
              </div>

              {/* Location & Context */}
              <div className="space-y-4 pt-4 border-t border-gray-50 text-sm font-semibold text-gray-600 dark:text-gray-300">
                <div>
                  <span className="text-xs text-gray-400 block uppercase tracking-wider font-extrabold">Active Negotiation</span>
                  <span className="text-charcoal dark:text-gray-100 font-bold mt-1 block bg-[#F8FAF5] border border-primary/5 p-2 rounded-xl text-center">
                    🌾 {activeChat.cropContext}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase tracking-wider font-extrabold">Location</span>
                  <span className="text-charcoal dark:text-gray-100 font-bold mt-1 block">📍 {activeChat.location}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block uppercase tracking-wider font-extrabold">Online Status</span>
                  <span className="mt-1 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${activeChat.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <span className="text-charcoal dark:text-gray-100 font-bold capitalize">{activeChat.status}</span>
                  </span>
                </div>
              </div>

              {/* Verification Banner */}
              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 space-y-1.5">
                <h5 className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <ShieldCheck className="w-4.5 h-4.5 fill-current text-primary" /> Verified Buyer
                </h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold leading-relaxed">
                  This buyer profile is verified and backed by AgriNova's corporate escrow protection guidelines.
                </p>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="flex-1 hidden md:flex flex-col items-center justify-center text-center p-8 bg-[#FAFBF8]">
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-[#1E293B] text-gray-300 flex items-center justify-center border border-charcoal/5 dark:border-white/5 shadow-xs mb-4">
            <Smile className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h3 className="font-display font-bold text-charcoal dark:text-gray-100 text-sm">No Active Negotiation</h3>
          <p className="text-sm text-gray-400 font-medium max-w-xs mt-1">
            Select a buyer from the sidebar chat thread list to begin secure communication.
          </p>
        </div>
      )}

    </div>
  );
}

