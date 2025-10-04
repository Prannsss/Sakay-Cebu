'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Send, 
  Search, 
  MessageCircle, 
  User, 
  Car,
  Clock,
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Trash2
} from 'lucide-react';
import useLocalStorage from '@/hooks/use-local-storage';
import { Message, Conversation, Vehicle, User as UserType } from '@/lib/types';
import { initialVehicles, allUsers } from '@/lib/data';

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles] = useLocalStorage<Vehicle[]>('sakay-cebu-vehicles', initialVehicles);
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('sakay-cebu-conversations', []);
  const [users] = useLocalStorage<UserType[]>('sakay-cebu-users', allUsers);
  const [providers] = useLocalStorage<UserType[]>('sakay-cebu-providers', []);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render trigger
  
  // Get messages for a specific conversation from its own storage
  const getConversationMessages = (conversationId: string): Message[] => {
    const messagesKey = `sakay-cebu-messages-${conversationId}`;
    return JSON.parse(localStorage.getItem(messagesKey) || '[]');
  };

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.push('/login');
    } else {
      setIsLoading(false);
    }
  }, [user, router]);

  // Auto-scroll to bottom when messages change
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  
  useEffect(() => {
    if (selectedConversation && user) {
      const messages = getConversationMessages(selectedConversation);
      setConversationMessages(messages);
      
      // Mark all messages as read when opening conversation
      const messagesKey = `sakay-cebu-messages-${selectedConversation}`;
      const updatedMessages = messages.map(msg => ({
        ...msg,
        read: msg.senderId === user.id ? msg.read : true // Only mark received messages as read
      }));
      
      // Save updated messages back to storage
      localStorage.setItem(messagesKey, JSON.stringify(updatedMessages));
      
      // Force re-render to update unread counts in sidebar
      setConversationMessages(updatedMessages);
      setRefreshKey(prev => prev + 1);
    }
  }, [selectedConversation, user]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationMessages]);

  if (isLoading || !user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter conversations for current user - ONLY show client-provider conversations
  const userConversations = conversations.filter(conv => {
    if (!conv.participants.includes(user.id)) return false;
    
    // Check if user has deleted this conversation
    const deletedKey = `sakay-cebu-deleted-convos-${user.id}`;
    const deletedConvos = JSON.parse(localStorage.getItem(deletedKey) || '[]');
    if (deletedConvos.includes(conv.id)) return false;
    
    // Get the other participant from both users and providers
    const otherUserId = conv.participants.find(id => id !== user.id);
    const allPeople = [...users, ...providers];
    const otherUser = allPeople.find(u => u.id === otherUserId);
    
    // Only show conversations where one is client and other is provider
    if (!otherUser) return false;
    
    // Client should only see conversations with providers
    if (user.role === 'user') {
      return otherUser.role === 'provider';
    }
    
    // Provider should only see conversations with clients
    if (user.role === 'provider') {
      return otherUser.role === 'user';
    }
    
    return false;
  });

  // Send message function
  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      conversationId: selectedConversation,
      senderId: user.id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      read: false
    };

    // Store message in conversation-specific storage
    const messagesKey = `sakay-cebu-messages-${selectedConversation}`;
    const existingMessages = JSON.parse(localStorage.getItem(messagesKey) || '[]');
    localStorage.setItem(messagesKey, JSON.stringify([...existingMessages, message]));
    
    // Update local state
    setConversationMessages([...conversationMessages, message]);

    // Update conversation last activity
    setConversations(conversations.map(conv => 
      conv.id === selectedConversation 
        ? { ...conv, lastMessage: message, lastActivity: message.timestamp }
        : conv
    ));

    setNewMessage('');
  };
  
  // Get other participant info
  const getOtherParticipant = (conversation: Conversation) => {
    const otherUserId = conversation.participants.find(id => id !== user.id);
    // Check both users and providers arrays
    const allPeople = [...users, ...providers];
    return allPeople.find(u => u.id === otherUserId) || { id: otherUserId || '', name: 'Unknown User', role: 'user' as const };
  };

  // Get vehicle info if conversation is about a vehicle
  const getVehicleInfo = (vehicleId?: string) => {
    return vehicleId ? vehicles.find(v => v.id === vehicleId) : null;
  };

  // Delete conversation for this user only (not for other participant)
  const deleteConversation = (conversationId: string) => {
    // Store deleted conversation IDs per user
    const deletedKey = `sakay-cebu-deleted-convos-${user.id}`;
    const deletedConvos = JSON.parse(localStorage.getItem(deletedKey) || '[]');
    
    if (!deletedConvos.includes(conversationId)) {
      deletedConvos.push(conversationId);
      localStorage.setItem(deletedKey, JSON.stringify(deletedConvos));
    }

    // Remove from current view
    setConversations(conversations.filter(conv => conv.id !== conversationId));
    
    // Clear selection if this was selected
    if (selectedConversation === conversationId) {
      setSelectedConversation(null);
    }
  };

  // Filter conversations based on search
  const filteredConversations = userConversations.filter(conv => {
    const otherUser = getOtherParticipant(conv);
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Format timestamp like Messenger
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="fixed inset-0 top-0 left-0 lg:left-64 right-0 bottom-0 bg-background overflow-hidden z-10">
      <div className="h-full flex">
        {/* Conversations Sidebar - Hidden on mobile when chat is selected */}
        <div className={`${selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-[380px] border-r bg-card`}>
          {/* Header */}
          <div className="p-4 border-b">
            <div className="mb-4">
              <h1 className="text-2xl font-bold">Chats</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-full bg-muted border-0"
              />
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {filteredConversations.length > 0 ? (
                filteredConversations.map(conversation => {
                  const otherUser = getOtherParticipant(conversation);
                  const vehicle = getVehicleInfo(conversation.vehicleId);
                  const convMessages = getConversationMessages(conversation.id);
                  const unreadCount = convMessages.filter(msg => 
                    msg.senderId !== user.id && 
                    !msg.read
                  ).length;
                  const isActive = selectedConversation === conversation.id;

                  return (
                    <div
                      key={conversation.id}
                      onClick={() => setSelectedConversation(conversation.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-muted/70 ${
                        isActive ? 'bg-muted' : ''
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-14 w-14">
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {otherUser.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold truncate text-sm">{otherUser.name}</h3>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conversation.lastActivity)}
                          </span>
                        </div>
                        
                        {vehicle && (
                          <div className="flex items-center gap-1 mb-1">
                            <Car className="h-3 w-3 text-primary" />
                            <p className="text-xs text-primary truncate font-medium">
                              {vehicle.model}
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <p className={`text-sm truncate ${unreadCount > 0 ? 'font-semibold' : 'text-muted-foreground'}`}>
                            {conversation.lastMessage ? (
                              <>
                                {conversation.lastMessage.senderId === user.id && <span className="text-muted-foreground">You: </span>}
                                {conversation.lastMessage.content}
                              </>
                            ) : (
                              'No messages yet'
                            )}
                          </p>
                          {unreadCount > 0 && (
                            <div className="flex-shrink-0 ml-2">
                              <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-xs text-primary-foreground font-bold">{unreadCount}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
                    <MessageCircle className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">No conversations yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a conversation with a vehicle provider
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`${!selectedConversation ? 'hidden lg:flex' : 'flex'} flex-col flex-1 bg-background`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              {(() => {
                const conversation = conversations.find(c => c.id === selectedConversation)!;
                const otherUser = getOtherParticipant(conversation);
                const vehicle = getVehicleInfo(conversation.vehicleId);
                
                return (
                  <div className="flex items-center gap-3 p-4 border-b bg-card">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </Button>
                    
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {otherUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-sm">{otherUser.name}</h2>
                      {vehicle && (
                        <div className="flex items-center gap-1">
                          <Car className="h-3 w-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground truncate">
                            {vehicle.model} • ₱{vehicle.pricePerDay}/day
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm('Delete this conversation? This will only remove it from your view.')) {
                            deleteConversation(selectedConversation);
                          }
                        }}
                        title="Delete conversation"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                      <div className="hidden sm:flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Phone className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <Video className="h-5 w-5 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-4xl mx-auto space-y-4">
                  {conversationMessages.map((message, index) => {
                    const isOwn = message.senderId === user.id;
                    const showAvatar = index === 0 || conversationMessages[index - 1].senderId !== message.senderId;
                    
                    return (
                      <div key={message.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && (
                          <Avatar className={`h-7 w-7 ${showAvatar ? '' : 'invisible'}`}>
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getOtherParticipant(conversations.find(c => c.id === selectedConversation)!).name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%] sm:max-w-[60%]`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-muted text-foreground rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 px-2">
                            {formatTime(message.timestamp)}
                          </span>
                        </div>
                        
                        {isOwn && <div className="w-7" />}
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-card">
                <div className="max-w-4xl mx-auto flex items-end gap-2">
                  <Button variant="ghost" size="icon" className="rounded-full flex-shrink-0">
                    <ImageIcon className="h-5 w-5 text-primary" />
                  </Button>
                  
                  <div className="flex-1 flex items-end gap-2 bg-muted rounded-3xl px-4 py-2">
                    <Input
                      placeholder="Aa"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                      <Smile className="h-5 w-5 text-primary" />
                    </Button>
                  </div>
                  
                  <Button 
                    size="icon" 
                    onClick={sendMessage} 
                    disabled={!newMessage.trim()}
                    className="rounded-full flex-shrink-0"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
                  <MessageCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Your Messages</h3>
                <p className="text-muted-foreground">
                  Select a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}