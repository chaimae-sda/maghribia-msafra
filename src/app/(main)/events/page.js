'use client';

import { useState } from 'react';
import { Calendar, MapPin, Users, Clock, Star, Filter, ChevronLeft, ChevronRight, BadgeCheck, Ticket } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { events } from '@/data/mock/events';
import styles from './page.module.css';

const categories = ['Tout', 'Randonnée', 'Cuisine', 'Sport', 'Culture', 'Bien-être'];

export default function EventsPage() {
  const [activeCategory, setActiveCategory] = useState('Tout');
  const [selectedEvent, setSelectedEvent] = useState(null);

  const filteredEvents = activeCategory === 'Tout' ? events : events.filter(e => e.category === activeCategory);

  // Simple calendar data
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).getDay();
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  return (
    <div className={styles.events}>
      {/* Header */}
      <div className={styles.header}>
        <h1>📅 Événements & Sorties</h1>
        <p>Découvrez les prochaines aventures organisées par la communauté</p>
      </div>

      <div className={styles.eventsLayout}>
        {/* Main */}
        <div className={styles.eventsMain}>
          {/* Categories */}
          <div className={styles.categories}>
            {categories.map(cat => (
              <button
                key={cat}
                className={`${styles.category} ${activeCategory === cat ? styles.category_active : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Event Grid */}
          <div className={styles.eventGrid}>
            {filteredEvents.map(event => (
              <article key={event.id} className={styles.eventCard} onClick={() => setSelectedEvent(event)}>
                <div className={styles.eventCard_image}>
                  <img src={event.image} alt={event.title} />
                  <div className={styles.eventCard_date}>
                    <span className={styles.eventCard_day}>{new Date(event.date).getDate()}</span>
                    <span className={styles.eventCard_month}>{monthNames[new Date(event.date).getMonth()].substring(0, 3)}</span>
                  </div>
                  {event.isFree ? (
                    <Badge variant="jade" size="sm" className={styles.eventCard_price}>Gratuit</Badge>
                  ) : (
                    <Badge variant="saffron" size="sm" className={styles.eventCard_price}>{event.price} MAD</Badge>
                  )}
                </div>
                <div className={styles.eventCard_body}>
                  <Badge variant="majorelle" size="sm">{event.category}</Badge>
                  <h3 className={styles.eventCard_title}>{event.title}</h3>
                  <div className={styles.eventCard_info}>
                    <span><MapPin size={14} /> {event.city}</span>
                    <span><Clock size={14} /> {event.duration}</span>
                  </div>
                  <p className={styles.eventCard_desc}>{event.description}</p>
                  <div className={styles.eventCard_footer}>
                    <div className={styles.eventCard_organizer}>
                      <Avatar alt={event.organizer.name} size="xs" />
                      <span>{event.organizer.name}</span>
                      <BadgeCheck size={12} className={styles.verified} />
                    </div>
                    <div className={styles.eventCard_spots}>
                      <Users size={14} />
                      <span>{event.currentParticipants}/{event.maxParticipants}</span>
                    </div>
                  </div>
                  <div className={styles.eventCard_progress}>
                    <div
                      className={styles.eventCard_progressBar}
                      style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Sidebar - Mini Calendar */}
        <aside className={styles.eventsSidebar}>
          <div className={styles.calendar}>
            <div className={styles.calendar_header}>
              <button className={styles.calendar_nav}><ChevronLeft size={18} /></button>
              <h3>{monthNames[today.getMonth()]} {today.getFullYear()}</h3>
              <button className={styles.calendar_nav}><ChevronRight size={18} /></button>
            </div>
            <div className={styles.calendar_weekdays}>
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className={styles.calendar_days}>
              {[...Array(firstDay === 0 ? 6 : firstDay - 1)].map((_, i) => (
                <span key={`empty-${i}`} className={styles.calendar_day_empty} />
              ))}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1;
                const isToday = day === today.getDate();
                const hasEvent = events.some(e => new Date(e.date).getDate() === day);
                return (
                  <button
                    key={day}
                    className={`${styles.calendar_day} ${isToday ? styles.calendar_day_today : ''} ${hasEvent ? styles.calendar_day_event : ''}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.upcoming}>
            <h3>🔜 Prochains événements</h3>
            {events.slice(0, 3).map(e => (
              <div key={e.id} className={styles.upcoming_item}>
                <div className={styles.upcoming_date}>
                  <span>{new Date(e.date).getDate()}</span>
                  <span>{monthNames[new Date(e.date).getMonth()].substring(0, 3)}</span>
                </div>
                <div className={styles.upcoming_info}>
                  <strong>{e.title}</strong>
                  <span><MapPin size={12} /> {e.city}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className={styles.modal_overlay} onClick={() => setSelectedEvent(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <img src={selectedEvent.image} alt={selectedEvent.title} className={styles.modal_image} />
            <div className={styles.modal_body}>
              <Badge variant="majorelle" size="md">{selectedEvent.category}</Badge>
              <h2>{selectedEvent.title}</h2>
              <div className={styles.modal_meta}>
                <span><MapPin size={16} /> {selectedEvent.city}</span>
                <span><Calendar size={16} /> {selectedEvent.date}</span>
                <span><Clock size={16} /> {selectedEvent.time} — {selectedEvent.duration}</span>
                <span><Users size={16} /> {selectedEvent.currentParticipants}/{selectedEvent.maxParticipants} participantes</span>
              </div>
              <p>{selectedEvent.description}</p>
              <div className={styles.modal_organizer}>
                <Avatar alt={selectedEvent.organizer.name} size="md" />
                <div>
                  <strong>Organisée par {selectedEvent.organizer.name}</strong>
                  <Badge variant="verified" size="sm">✓ Vérifiée</Badge>
                </div>
              </div>
              <div className={styles.modal_tags}>
                {selectedEvent.tags.map(t => (
                  <Badge key={t} variant="majorelle" size="sm">#{t}</Badge>
                ))}
              </div>
              <div className={styles.modal_actions}>
                <Button variant="primary" size="lg" fullWidth>
                  <Ticket size={18} />
                  {selectedEvent.isFree ? 'S\'inscrire gratuitement' : `Réserver — ${selectedEvent.price} MAD`}
                </Button>
                <Button variant="ghost" fullWidth onClick={() => setSelectedEvent(null)}>Fermer</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
