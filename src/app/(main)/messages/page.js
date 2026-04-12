'use client';

import { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Smile, Paperclip, Hash, Lock, ArrowLeft } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { cityChannels, privateChats, chatMessages } from '@/data/mock/messages';
import styles from './page.module.css';

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState('channels');
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (message.trim()) {
      setMessage('');
    }
  };

  return (
    <div className={styles.messages}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${activeChat ? styles.sidebar_hidden : ''}`}>
        <div className={styles.sidebar_header}>
          <h1>💬 Messages</h1>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'channels' ? styles.tab_active : ''}`}
              onClick={() => setActiveTab('channels')}
            >
              <Hash size={16} /> Canaux
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'private' ? styles.tab_active : ''}`}
              onClick={() => setActiveTab('private')}
            >
              <Lock size={16} /> Privé
            </button>
          </div>
        </div>

        <div className={styles.sidebar_search}>
          <Search size={18} />
          <input type="text" placeholder="Rechercher..." />
        </div>

        <div className={styles.chatList}>
          {activeTab === 'channels' ? (
            cityChannels.map(ch => (
              <button
                key={ch.id}
                className={`${styles.chatItem} ${activeChat?.id === ch.id ? styles.chatItem_active : ''}`}
                onClick={() => setActiveChat({ type: 'channel', ...ch })}
              >
                <span className={styles.chatItem_emoji}>{ch.emoji}</span>
                <div className={styles.chatItem_info}>
                  <div className={styles.chatItem_top}>
                    <span className={styles.chatItem_name}>{ch.name}</span>
                    <span className={styles.chatItem_time}>{ch.lastTime}</span>
                  </div>
                  <div className={styles.chatItem_bottom}>
                    <span className={styles.chatItem_message}>{ch.lastMessage}</span>
                    {ch.unread > 0 && <span className={styles.chatItem_badge}>{ch.unread}</span>}
                  </div>
                </div>
              </button>
            ))
          ) : (
            privateChats.map(dm => (
              <button
                key={dm.id}
                className={`${styles.chatItem} ${activeChat?.id === dm.id ? styles.chatItem_active : ''}`}
                onClick={() => setActiveChat({ type: 'dm', ...dm })}
              >
                <Avatar alt={dm.user.name} size="md" status={dm.user.online ? 'online' : 'offline'} />
                <div className={styles.chatItem_info}>
                  <div className={styles.chatItem_top}>
                    <span className={styles.chatItem_name}>{dm.user.name}</span>
                    <span className={styles.chatItem_time}>{dm.lastTime}</span>
                  </div>
                  <div className={styles.chatItem_bottom}>
                    <span className={styles.chatItem_message}>{dm.lastMessage}</span>
                    {dm.unread > 0 && <span className={styles.chatItem_badge}>{dm.unread}</span>}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${styles.chatArea} ${!activeChat ? styles.chatArea_empty : ''}`}>
        {activeChat ? (
          <>
            <div className={styles.chatArea_header}>
              <button className={styles.backBtn} onClick={() => setActiveChat(null)}>
                <ArrowLeft size={20} />
              </button>
              {activeChat.type === 'channel' ? (
                <div className={styles.chatArea_headerInfo}>
                  <span className={styles.chatArea_emoji}>{activeChat.emoji}</span>
                  <div>
                    <h3>{activeChat.name}</h3>
                    <span>{activeChat.members} membres</span>
                  </div>
                </div>
              ) : (
                <div className={styles.chatArea_headerInfo}>
                  <Avatar alt={activeChat.user.name} size="md" status={activeChat.user.online ? 'online' : 'offline'} />
                  <div>
                    <h3>{activeChat.user.name}</h3>
                    <span>{activeChat.user.online ? 'En ligne' : 'Hors ligne'}</span>
                  </div>
                </div>
              )}
              <div className={styles.chatArea_actions}>
                <button className={styles.chatAction}><Phone size={18} /></button>
                <button className={styles.chatAction}><Video size={18} /></button>
                <button className={styles.chatAction}><MoreVertical size={18} /></button>
              </div>
            </div>

            <div className={styles.chatArea_messages}>
              {chatMessages.map(msg => (
                <div key={msg.id} className={`${styles.msg} ${msg.isOwn ? styles.msg_own : ''}`}>
                  {!msg.isOwn && <Avatar alt={msg.senderName} size="sm" />}
                  <div className={`${styles.msg_bubble} ${msg.isOwn ? styles.msg_bubble_own : ''}`}>
                    {!msg.isOwn && <span className={styles.msg_sender}>{msg.senderName}</span>}
                    <p>{msg.content}</p>
                    <span className={styles.msg_time}>{msg.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <form className={styles.chatArea_input} onSubmit={handleSend}>
              <button type="button" className={styles.inputAction}><Paperclip size={20} /></button>
              <input
                type="text"
                placeholder="Écrivez un message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button type="button" className={styles.inputAction}><Smile size={20} /></button>
              <button type="submit" className={styles.sendBtn} disabled={!message.trim()}>
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className={styles.chatArea_placeholder}>
            <div className={styles.placeholder_icon}>💬</div>
            <h3>Sélectionnez une conversation</h3>
            <p>Choisissez un canal de ville ou une conversation privée pour commencer à discuter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
