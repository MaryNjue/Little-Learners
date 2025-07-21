import React from 'react';
import { CalendarDays } from 'lucide-react'; // Import necessary icon
import '../App.css'; // Import the CSS file where panel styles are defined

// Upcoming Activities Panel Component
function UpcomingActivitiesPanel() {
  const activities = [
    { title: "Art & Craft Session", day: "Monday", time: "11:00 AM" },
    { title: "Science Discovery", day: "Wednesday", time: "10:30 AM" },
    { title: "Music & Movement", day: "Friday", time: "2:00 PM" },
    { title: "Show and Tell", day: "Next Monday", time: "9:00 AM" },
  ];

  return (
    <div className="upcoming-activities-panel">
      <div className="upcoming-activities-panel-header">
        <CalendarDays className="icon" />
        <h3>Upcoming Activities</h3>
      </div>
      <ul className="activity-list">
        {activities.map((activity, index) => (
          <li key={index} className="activity-item">
            <span className="activity-bullet"></span>
            <div>
              <p className="activity-title">{activity.title}</p>
              <p className="activity-time">{activity.day}, {activity.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UpcomingActivitiesPanel;
