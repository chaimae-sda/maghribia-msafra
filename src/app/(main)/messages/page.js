'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Send, X, Check, Loader2, ArrowLeft, Trash2, Mic, StopCircle, MoreVertical, ShieldBan, UserMinus } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { virtualUsers } from '@/data/mock/virtualUsers';
import styles from './page.module.css';

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="spin" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('userId');
  const initialText = searchParams.get('text');

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chats');
  const [invitations, setInvitations] = useState([]);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showOptionsPopup, setShowOptionsPopup] = useState(false);

  useEffect(() => {
    if (user) {
      fetchInvitations();
      fetchConversations();

      const channel = supabase.channel('messaging_main')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'friendships' }, () => {
          fetchInvitations();
          fetchConversations();
        })
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
          const msg = payload.new;
          if (msg.receiver_id === user.id || msg.sender_id === user.id) {
            fetchConversations();
          }
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); }
    }
  }, [user]);

  async function fetchInvitations() {
    const { data } = await supabase
      .from('friendships')
      .select('id, user_id, status, created_at, profiles!friendships_user_id_fkey(full_name, avatar_url, city)')
      .eq('friend_id', user.id)
      .eq('status', 'pending');
    if (data) setInvitations(data.map(d => ({ id: d.id, ...d.profiles, user_id: d.user_id })));
  }

  async function fetchConversations() {
    // Get the latest message from each conversation - OPTIMIZED approach
    // Get all friendships first for this user
    const { data: friendships } = await supabase
      .from('friendships')
      .select('id, user_id, friend_id, status')
      .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);

    if (!friendships || friendships.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }

    // Get friend IDs
    const friendIds = friendships.map(f => f.user_id === user.id ? f.friend_id : f.user_id);

    // Get profiles for all friends - single query
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, city')
      .in('id', friendIds);

    if (!profiles || profiles.length === 0) {
      setChats([]);
      setLoading(false);
      return;
    }

    // Get latest message and unread count for each conversation - optimized with limit
    const conversationList = await Promise.all(
      profiles.map(async (p) => {
        // Get last message from this conversation
        const { data: messages } = await supabase
          .from('messages')
          .select('id, content, created_at, status, receiver_id')
          .or(`and(sender_id.eq.${user.id},receiver_id.eq.${p.id}),and(sender_id.eq.${p.id},receiver_id.eq.${user.id})`)
          .order('created_at', { ascending: false })
          .limit(1);

        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('id', { count: 'exact' })
          .eq('sender_id', p.id)
          .eq('receiver_id', user.id)
          .eq('status', 'sent');

        const friendship = friendships.find(f =>
          (f.user_id === user.id && f.friend_id === p.id) || (f.user_id === p.id && f.friend_id === user.id)
        );

        return {
          friendId: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          city: p.city,
          lastMessage: messages?.[0]?.content || '',
          lastTime: messages?.[0]?.created_at,
          unreadCount: unreadCount || 0,
          isFriend: friendship?.status === 'accepted',
          friendshipId: friendship?.id,
          friendshipStatus: friendship?.status
        };
      })
    );

    // Sort by last message time
    conversationList.sort((a, b) => {
      const timeA = new Date(a.lastTime || 0).getTime();
      const timeB = new Date(b.lastTime || 0).getTime();
      return timeB - timeA;
    });

    setChats(conversationList);

    if (initialUserId && !activeChat) {
      const found = conversationList.find(c => c.friendId === initialUserId);
      if (found) {
        setActiveChat(found);
        setActiveTab(found.isFriend ? 'chats' : 'demandes');
      } else {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, city')
          .eq('id', initialUserId)
          .single();

        if (profileData) {
          const temp = { friendId: profileData.id, ...profileData, isTemporary: true };
          setActiveChat(temp);
          setActiveTab('demandes');
        } else if (virtualUsers[initialUserId]) {
          const vUser = virtualUsers[initialUserId];
          const temp = { friendId: vUser.id, ...vUser, isTemporary: true };
          setActiveChat(temp);
          setActiveTab('demandes');
        }
      }
      if (initialText) setNewMessage(initialText);
    }
    setLoading(false);
  }

  async function respondInvite(id, accept) {
    try {
      setInvitations(prev => prev.filter(inv => inv.id !== id));
      const { error } = await supabase
        .from('friendships')
        .update({ status: accept ? 'accepted' : 'rejected' })
        .eq('id', id);

      if (error) throw error;
      await fetchInvitations();
      await fetchConversations();
      if (accept) setActiveTab('chats');
    } catch (err) {
      console.error('Error responding to invite:', err);
      alert("Erreur : " + err.message);
      fetchInvitations();
    }
  }

  useEffect(() => {
    if (!activeChat) return;
    fetchMessages();

    const msgSub = supabase.channel(`chat_${activeChat.friendId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const msg = payload.new;
        if ((msg.sender_id === user.id && msg.receiver_id === activeChat.friendId) ||
          (msg.sender_id === activeChat.friendId && msg.receiver_id === user.id)) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          // If this message is for the current user, mark it as read
          if (msg.receiver_id === user.id) {
            await supabase.from('messages').update({ status: 'read' }).eq('id', msg.id);
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); }
  }, [activeChat]);

  async function fetchMessages() {
    setMessages([]);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.friendId}),and(sender_id.eq.${activeChat.friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true })
      .limit(500); // Limit to last 500 messages per conversation for performance

    if (data) {
      setMessages(data);
      // Mark all unread messages from the other user as read
      const unreadIds = data.filter(m => m.receiver_id === user.id && m.status !== 'read').map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ status: 'read' }).in('id', unreadIds);
      }
    }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage;
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeChat.friendId,
      content,
      status: 'sent'
    });
    if (!error) {
      setNewMessage('');
      fetchConversations();
    }
  }

  async function deleteConversation(interlocutorId) {
    if (!confirm('Voulez-vous vraiment supprimer cette conversation ?')) return;
    await supabase.from('messages').delete()
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${interlocutorId}),and(sender_id.eq.${interlocutorId},receiver_id.eq.${user.id})`);
    setActiveChat(null);
    fetchConversations();
  }

  async function blockUser(friendId) {
    if (!confirm('Voulez-vous vraiment bloquer cette personne ?')) return;
    await supabase.from('friendships').update({ status: 'blocked' })
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
    setActiveChat(null);
    setShowOptionsPopup(false);
    fetchConversations();
  }

  async function removeFriend(friendId) {
    if (!confirm('Voulez-vous vraiment la retirer de vos amies ?')) return;
    await supabase.from('friendships').delete()
      .or(`and(user_id.eq.${user.id},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${user.id})`);
    setActiveChat(null);
    setShowOptionsPopup(false);
    fetchConversations();
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudioStream(stream);
      const recorder = new MediaRecorder(stream);
      recorder.start();
      const audioChunks = [];
      recorder.addEventListener("dataavailable", event => audioChunks.push(event.data));
      recorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await sendAudioMessage(audioBlob);
      });
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      alert("Permission micro refusée !");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      if (audioStream) audioStream.getTracks().forEach(track => track.stop());
    }
  };

  const sendAudioMessage = async (audioBlob) => {
    setIsUploading(true);
    const fileName = `audio_${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(`voice/${user.id}/${fileName}`, audioBlob, { contentType: 'audio/webm' });

    if (uploadError) {
      setIsUploading(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`voice/${user.id}/${fileName}`);
    await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeChat.friendId,
      content: `[AUDIO] ${publicUrl}`,
      status: 'sent'
    });
    fetchConversations();
    setIsUploading(false);
  };

  const renderMessageContent = (content) => {
    if (content.startsWith('[AUDIO] ')) {
      const url = content.replace('[AUDIO] ', '');
      return <audio src={url} controls style={{ height: '40px', maxWidth: '220px', borderRadius: '20px' }} />;
    }
    return <p>{content}</p>;
  };

  const MessageStatus = ({ status }) => {
    if (status === 'sent') return <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.7)', marginLeft: '5px' }}>✓ Envoyé</span>;
    if (status === 'delivered') return <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)', marginLeft: '5px' }}>✓✓ Reçu</span>;
    if (status === 'read') return <span style={{ fontSize: '0.7rem', color: 'white', marginLeft: '5px', fontWeight: 600 }}>✓✓ Lu</span>;
    return null;
  };

  return (
    <div className={styles.messages}>
      <div className={`${styles.sidebar} ${activeChat ? styles.sidebar_hidden : ''}`}>
        <div className={styles.sidebar_header}>
          <h1>💬 Messagerie</h1>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${activeTab === 'chats' ? styles.tab_active : ''}`} onClick={() => setActiveTab('chats')}>Amies</button>
            <button className={`${styles.tab} ${activeTab === 'invites' ? styles.tab_active : ''}`} onClick={() => setActiveTab('invites')}>
              Invitations {invitations.length > 0 && <span className={styles.badge}>{invitations.length}</span>}
            </button>
            <button className={`${styles.tab} ${activeTab === 'demandes' ? styles.tab_active : ''}`} onClick={() => setActiveTab('demandes')}>Demandes</button>
          </div>
        </div>

        <div className={styles.chatList}>
          {loading && <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="spin" /></div>}

          {!loading && activeTab === 'chats' && (
            chats.filter(c => c.isFriend).length === 0 ? (
              <p style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Aucune amie active.</p>
            ) : (
              chats.filter(c => c.isFriend).map(chat => (
                <button key={chat.friendId} className={`${styles.chatItem} ${activeChat?.friendId === chat.friendId ? styles.chatItem_active : ''}`} onClick={() => setActiveChat(chat)}>
                  <div style={{ position: 'relative' }}>
                    <Avatar src={chat.avatar_url} alt={chat.full_name} size="md" />
                    {chat.unreadCount > 0 && <span className={styles.unread_dot}>{chat.unreadCount}</span>}
                  </div>
                  <div className={styles.chatItem_info}>
                    <div className={styles.chatItem_top}>
                      <span className={styles.chatItem_name}>{chat.full_name}</span>
                      {chat.lastTime && <span className={styles.chatItem_time}>{new Date(chat.lastTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                    </div>
                    <span className={styles.chatItem_preview}>{chat.lastMessage || 'Aucun message'}</span>
                  </div>
                </button>
              ))
            )
          )}

          {!loading && activeTab === 'invites' && invitations.map(inv => (
            <div key={inv.id} className={styles.chatItem} style={{ cursor: 'default' }}>
              <Avatar src={inv.avatar_url} alt={inv.full_name} size="md" />
              <div className={styles.chatItem_info}>
                <span className={styles.chatItem_name}>{inv.full_name}</span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button onClick={() => respondInvite(inv.id, true)} style={{ background: 'var(--jade)', color: 'white', padding: '0.3rem 0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}><Check size={14} /> Accepter</button>
                  <button onClick={() => respondInvite(inv.id, false)} style={{ background: '#eee', padding: '0.3rem 0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}><X size={14} /></button>
                </div>
              </div>
            </div>
          ))}

          {!loading && activeTab === 'demandes' && (
            <div style={{ padding: '1rem' }}>
              {chats.filter(c => !c.isFriend).map(chat => (
                <button key={chat.friendId} className={`${styles.chatItem} ${activeChat?.friendId === chat.friendId ? styles.chatItem_active : ''}`} onClick={() => setActiveChat(chat)}>
                  <Avatar src={chat.avatar_url} alt={chat.full_name} size="md" />
                  <div className={styles.chatItem_info}>
                    <span className={styles.chatItem_name}>{chat.full_name}</span>
                    <span className={styles.chatItem_preview}>{chat.lastMessage}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`${styles.chatArea} ${!activeChat ? styles.chatArea_empty : ''}`}>
        {activeChat ? (
          <>
            <div className={styles.chatArea_header}>
              <button className={styles.backBtn} onClick={() => setActiveChat(null)}>
                <ArrowLeft size={20} />
              </button>

              {/* HEADER CLIQUABLE - ROUTE /profile/[id] */}
              <Link
                href={`/profile/${activeChat.friendId}`}
                className={styles.chatArea_headerInfo}
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, color: 'inherit' }}
              >
                <Avatar src={activeChat.avatar_url} alt={activeChat.full_name} size="md" />
                <div>
                  <h3 style={{ margin: 0 }}>{activeChat.full_name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#666' }}>{activeChat.city}</span>
                </div>
              </Link>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className={styles.deleteBtn} onClick={(e) => { e.preventDefault(); deleteConversation(activeChat.friendId); }} title="Supprimer">
                  <Trash2 size={18} />
                </button>
                <div style={{ position: 'relative' }}>
                  <button className={styles.deleteBtn} onClick={(e) => { e.preventDefault(); setShowOptionsPopup(!showOptionsPopup); }}>
                    <MoreVertical size={18} />
                  </button>
                  {showOptionsPopup && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '12px', zIndex: 50, border: '1px solid var(--border-light)', minWidth: '180px' }}>
                      <button onClick={() => blockUser(activeChat.friendId)} style={{ display: 'flex', gap: '8px', padding: '0.5rem', background: 'transparent', border: 'none', color: 'var(--rose)', width: '100%', cursor: 'pointer' }}>
                        <ShieldBan size={16} /> Bloquer
                      </button>
                      <button onClick={() => removeFriend(activeChat.friendId)} style={{ display: 'flex', gap: '8px', padding: '0.5rem', background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}>
                        <UserMinus size={16} /> Retirer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.chatArea_messages}>
              {messages.map(msg => (
                <div key={msg.id} className={`${styles.msg} ${msg.sender_id === user.id ? styles.msg_own : ''}`}>
                  <div className={`${styles.msg_bubble} ${msg.sender_id === user.id ? styles.msg_bubble_own : ''}`}>
                    {renderMessageContent(msg.content)}
                    <span className={styles.msg_time}>
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender_id === user.id && <MessageStatus status={msg.status} />}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <form className={styles.chatArea_input} onSubmit={sendMessage}>
              {isUploading ? (
                <div style={{ flex: 1, color: '#666' }}>Envoi audio...</div>
              ) : (
                <input type="text" placeholder={isRecording ? "Enregistrement..." : "Message..."} value={newMessage} onChange={e => setNewMessage(e.target.value)} disabled={isRecording} />
              )}
              {!isUploading && (
                isRecording ? (
                  <button type="button" className={styles.sendBtn} style={{ background: 'var(--rose)' }} onClick={stopRecording}><StopCircle size={18} /></button>
                ) : (
                  <button type="button" onClick={startRecording} disabled={newMessage.trim().length > 0} style={{ background: 'transparent', border: 'none', color: 'var(--majorelle)' }}><Mic size={22} /></button>
                )
              )}
              <button type="submit" className={styles.sendBtn} disabled={(!newMessage.trim() && !isRecording) || isRecording || isUploading}><Send size={18} /></button>
            </form>
          </>
        ) : (
          <div className={styles.chatArea_placeholder}>
            <div className={styles.placeholder_icon}>💬</div>
            <h3>Sélectionnez une amie</h3>
          </div>
        )}
      </div>
    </div>
  );
}
