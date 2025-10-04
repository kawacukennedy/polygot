import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4">Appearance</h2>
          <div className="bg-surface rounded-lg p-6">
            <p>Theme settings will be here.</p>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4">Account</h2>
          <div className="bg-surface rounded-lg p-6">
            <p>Account settings will be here.</p>
            <button className="mt-4 text-danger hover:underline">Delete Account</button>
          </div>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-4">Integrations</h2>
          <div className="bg-surface rounded-lg p-6">
            <p>Integrations settings will be here.</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SettingsPage;
