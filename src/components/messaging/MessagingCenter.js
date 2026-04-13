'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Send, Check, Loader2, ArrowLeft, Trash2, Mic, StopCircle } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import styles from './MessagingCenter.module.css';

export default function MessagingCenter({ isAgency = false, compact = false }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('chats');
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioStream, setAudioStream] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchConversations();
      const channel = supabase.channel('messaging_updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => fetchConversations())
        .subscribe();
      return () => { supabase.removeChannel(channel); }
    }
  }, [user, isAgency]);

  async function fetchConversations() {
    // Agencies get all messages, no friend check.
    const { data: allMessages, error } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, content, created_at, status')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (error || !allMessages) {
      setLoading(false);
      return;
    }

    const interlocutorIds = [...new Set(allMessages.map(m =>
      m.sender_id === user.id ? m.receiver_id : m.sender_id
    ))];

    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, city')
      .in('id', interlocutorIds);

    const conversationList = (profiles || []).map(p => {
      const userMessages = allMessages.filter(m => m.sender_id === p.id || m.receiver_id === p.id);
      const lastMsg = userMessages[0];
      const unreadCount = userMessages.filter(m => m.receiver_id === user.id && m.status !== 'read').length;

      return {
        friendId: p.id,
        full_name: p.full_name,
        avatar_url: p.avatar_url,
        lastMessage: lastMsg?.content,
        lastTime: lastMsg?.created_at,
        unreadCount
      };
    });

    setChats(conversationList);
    setLoading(false);
  }

  useEffect(() => {
    if (!activeChat) return;
    fetchMessages();
    const msgSub = supabase.channel(`chat_${activeChat.friendId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
        const msg = payload.new;
        if ((msg.sender_id === user.id && msg.receiver_id === activeChat.friendId) ||
          (msg.sender_id === activeChat.friendId && msg.receiver_id === user.id)) {
          setMessages(prev => [...prev, msg]);
          if (msg.receiver_id === user.id) {
            supabase.from('messages').update({ status: 'read' }).eq('id', msg.id).then();
          }
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(msgSub); }
  }, [activeChat]);

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},receiver_id.eq.${activeChat.friendId}),and(sender_id.eq.${activeChat.friendId},receiver_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data);
      const unreadIds = data.filter(m => m.receiver_id === user.id && m.status !== 'read').map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase.from('messages').update({ status: 'read' }).in('id', unreadIds);
      }
    }
  }

  async function sendMessage(e) {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;
    const content = newMessage;
    setNewMessage('');
    const { error } = await supabase.from('messages').insert({
      sender_id: user.id,
      receiver_id: activeChat.friendId,
      content,
      status: 'sent'
    });
    if (error) {
      alert("Erreur d'envoi");
      setNewMessage(content);
    } else {
        fetchConversations();
    }
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
      alert("Micro non accessible");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      audioStream?.getTracks().forEach(t => t.stop());
    }
  };

  const sendAudioMessage = async (blob) => {
    setIsUploading(true);
    const fileName = `audio_${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(`voice/${user.id}/${fileName}`, blob);

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`voice/${user.id}/${fileName}`);
      await supabase.from('messages').insert({
        sender_id: user.id,
        receiver_id: activeChat.friendId,
        content: `[AUDIO] ${publicUrl}`,
        status: 'sent'
      });
      fetchConversations();
    }
    setIsUploading(false);
  };

  return (
    <div className={`${styles.messages} ${compact ? styles.messagesCompact : ''}`}>
      <div className={styles.sidebar}>
        <div className={styles.sidebar_header}>
          <h1>{isAgency ? '📫 Boîte de réception' : '💬 Messages'}</h1>
          {!isAgency && (
            <div className={styles.tabs}>
              <button className={`${styles.tab} ${activeTab === 'chats' ? styles.tab_active : ''}`} onClick={() => setActiveTab('chats')}>Amies</button>
              <button className={`${styles.tab} ${activeTab === 'invites' ? styles.tab_active : ''}`} onClick={() => setActiveTab('invites')}>Demandes</button>
            </div>
          )}
        </div>
        <div className={styles.chatList}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="spin" /></div>
          ) : chats.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Aucune conversation</p>
          ) : (
            chats.map(chat => (
              <button key={chat.friendId} className={`${styles.chatItem} ${activeChat?.friendId === chat.friendId ? styles.chatItem_active : ''}`} onClick={() => setActiveChat(chat)}>
                <Avatar src={chat.avatar_url} size="md" />
                <div className={styles.chatItem_info}>
                  <div className={styles.chatItem_top}>
                    <span className={styles.chatItem_name}>{chat.full_name}</span>
                    {chat.unreadCount > 0 && <span className={styles.unread_dot}>{chat.unreadCount}</span>}
                  </div>
                  <span className={styles.chatItem_preview}>{chat.lastMessage?.startsWith('[AUDIO]') ? '🎤 Message vocal' : chat.lastMessage}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      <div className={styles.chatArea}>
        {activeChat ? (
          <>
            <div className={styles.chatArea_header}>
              <Avatar src={activeChat.avatar_url} size="sm" />
              <h3 style={{ margin: 0 }}>{activeChat.full_name}</h3>
            </div>
            <div className={styles.chatArea_messages}>
              {messages.map(m => (
                <div key={m.id} className={`${styles.msg} ${m.sender_id === user.id ? styles.msg_own : ''}`}>
                  <div className={`${styles.msg_bubble} ${m.sender_id === user.id ? styles.msg_bubble_own : ''}`}>
                    {m.content.startsWith('[AUDIO]') ? (
                      <audio src={m.content.replace('[AUDIO] ', '')} controls style={{ height: '32px', maxWidth: '200px' }} />
                    ) : (
                      <p style={{ margin: 0 }}>{m.content}</p>
                    )}
                    <span className={styles.msg_time}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
            <form className={styles.chatArea_input} onSubmit={sendMessage}>
              <input 
                type="text" 
                placeholder={isRecording ? "Enregistrement en cours..." : "Écrivez votre message..."} 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)}
                disabled={isRecording || isUploading}
              />
              {isRecording ? (
                <button type="button" onClick={stopRecording} className={styles.sendBtn} style={{ background: 'var(--rose)' }}><StopCircle size={18} /></button>
              ) : (
                <button type="button" onClick={startRecording} className={styles.sendBtn} style={{ background: 'transparent', color: 'var(--majorelle)' }}><Mic size={20} /></button>
              )}
              <button type="submit" className={styles.sendBtn} disabled={!newMessage.trim()}><Send size={18} /></button>
            </form>
          </>
        ) : (
          <div className={styles.chatArea_empty}>
            <div style={{ fontSize: '4rem' }}>💬</div>
            <p>Sélectionnez une conversation pour répondre</p>
          </div>
        )}
      </div>
    </div>
  );
}
