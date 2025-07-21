import React from 'react';
import { ChevronRight } from 'lucide-react';
import '../App.css';

function CategoryCard({ icon, title, description, activitiesAvailable, buttonClass, buttonText = "Let's Go!" }) {
  return (
    <div className="category-card">
      <div className="category-icon-wrapper">
        {icon}
      </div>
      <h3 className="category-title">{title}</h3>
      <p className="category-description">{description}</p>
      {activitiesAvailable > 0 && (
        <p className="activities-available">{activitiesAvailable} activities available</p>
      )}
      <button className={`category-button button-${buttonClass}`}>
        <span>{buttonText}</span>
        <ChevronRight className="icon" />
      </button>
    </div>
  );
}

export default CategoryCard;
