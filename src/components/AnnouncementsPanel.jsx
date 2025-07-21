import React from 'react';
import { Bell } from 'lucide-react';
import '../App.css';

function AnnouncementsPanel() {
  const announcements = [
    { title: "New Fun Games Added!", time: "Today", teacher: "Teacher Sarah" },
    { title: "Story Time Tomorrow", time: "Tomorrow", teacher: "Teacher Mike" },
    { title: "Great Work This Week!", time: "2 days ago", teacher: "Principal Jones" },
  ];

  return (
    <div className="announcement-panel">
      <div className="announcement-panel-header">
        <Bell className="icon" />
        <h3>Announcements</h3>
      </div>
      <ul className="announcement-list">
        {announcements.map((announcement, index) => (
          <li key={index} className="announcement-item">
            <div className="announcement-item-top">
              <p className="announcement-item-title">{announcement.title}</p>
              <span className="announcement-item-time">{announcement.time}</span>
            </div>
            <p className="announcement-item-teacher">A {announcement.teacher}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AnnouncementsPanel;