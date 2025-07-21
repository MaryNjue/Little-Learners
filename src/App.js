import React from 'react';
import './App.css'; // Import the main CSS file for styles
import Header from './components/Header';
import WelcomeBanner from './components/WelcomeBanner';
import CategoryCard from './components/CategoryCard';
import AnnouncementsPanel from './components/AnnouncementsPanel';
import TeacherMessagePanel from './components/TeacherMessagePanel';
import UpcomingActivitiesPanel from './components/UpcomingActivitiesPanel';

import {
  Book, Calculator, Leaf, Music, Gamepad, Folder, Paintbrush, Award
} from 'lucide-react';

function App() {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <WelcomeBanner />
        <section className="learning-categories-section">
          <h2 className="section-title">
            <span role="img" aria-label="palette">🎨</span>
            Choose Your Learning Adventure!
            <span role="img" aria-label="puzzle">🧩</span>
          </h2>
          <div className="category-grid">
            <CategoryCard icon={<Book />} title="Literacy & ABC" description="Learn letters, sounds, and reading!" activitiesAvailable={12} buttonClass="blue" />
            <CategoryCard icon={<Calculator />} title="Numbers & Counting" description="Fun with numbers and math!" activitiesAvailable={8} buttonClass="green" />
            <CategoryCard icon={<Leaf />} title="Environment & Nature" description="Discover our amazing world!" activitiesAvailable={10} buttonClass="emerald" />
            <CategoryCard icon={<Music />} title="Rhymes & Songs" description="Sing and dance with us!" activitiesAvailable={15} buttonClass="purple" />
            <CategoryCard icon={<Gamepad />} title="Fun Games" description="Play and learn together!" activitiesAvailable={6} buttonClass="pink" />
            <CategoryCard icon={<Folder />} title="My Assignments" description="Your special tasks!" activitiesAvailable={3} buttonClass="orange" />
            <CategoryCard icon={<Paintbrush />} title="Creative Arts" description="Draw, color, and create!" activitiesAvailable={9} buttonClass="red" />
            <CategoryCard icon={<Award />} title="My Progress" description="See how great you are!" activitiesAvailable={0} buttonClass="yellow" buttonText="View Progress" />
          </div>
        </section>
        <section className="info-panels-section">
          <AnnouncementsPanel />
          <TeacherMessagePanel />
          <UpcomingActivitiesPanel />
        </section>
      </main>
    </div>
  );
}

export default App;