import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [userRole, setUserRole] = useState(null);

  return (
    <AuthContext.Provider value={{ 
      userRole,
      setUserRole,
      isLead: userRole === 'lead',
      isClient: userRole === 'client'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
