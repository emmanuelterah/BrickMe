import React from 'react';

function HomeSection({ user }) {
  return (
    <section className="dashboard-home">
      <h2>Welcome, {user?.profile?.name || user?.email}!</h2>
      <p>Choose a feature from the sidebar to get started.</p>
    </section>
  );
}

export default HomeSection; 