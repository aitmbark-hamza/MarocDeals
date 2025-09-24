import React from 'react';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();
  const userEmail = localStorage.getItem('userEmail');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-4 text-center">{t('profile.title', { defaultValue: 'My Profile' })}</h1>
        <div className="mb-6 text-center">
          <span className="text-lg font-semibold">{t('profile.email', { defaultValue: 'Email:' })}</span>
          <span className="ml-2 text-muted-foreground">{userEmail}</span>
        </div>
        {/* Add more user info or actions here */}
      </div>
    </div>
  );
};

export default Profile;
