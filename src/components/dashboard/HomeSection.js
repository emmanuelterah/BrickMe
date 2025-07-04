import React from 'react';

function HomeSection({ user }) {
  // Determine if user is new (created within last 5 minutes)
  let isNewUser = false;
  let welcomeMsg = '';
  let suggestion = '';
  if (user && user.createdAt) {
    const created = new Date(user.createdAt);
    const now = new Date();
    const diffMinutes = (now - created) / 1000 / 60;
    isNewUser = diffMinutes < 5;
  }
  if (isNewUser) {
    welcomeMsg = `First time huh? Welcome, ${user?.profile?.name || user?.email}!`;
    suggestion = 'Start by uploading an image to LEGO-fy it, or try the Mosaic Builder from the sidebar!';
  } else if (user) {
    welcomeMsg = `Welcome back, ${user?.profile?.name || user?.email}!`;
    suggestion = 'Pick up where you left off: LEGO-fy a new image, build a mosaic, or explore Voice AI Chat.';
  } else {
    welcomeMsg = 'Welcome!';
    suggestion = 'Choose a feature from the sidebar to get started.';
  }
  return (
    <section className="dashboard-home">
      <h2>{welcomeMsg}</h2>
      <p>{suggestion}</p>
    </section>
  );
}

export default HomeSection; 