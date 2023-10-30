'use client'


import { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const storageKey = "theme";

  const getUserPreference = () => {
    const userPref = window.localStorage.getItem(storageKey);
    if(userPref){ return userPref === "dark"; }
    return false;
  }

  const toggleTheme = (dark) => {
    setDarkMode(dark);
    window.localStorage.setItem(storageKey, dark ? 'dark' : 'light')
  }

  useEffect(() => {
    setDarkMode(getUserPreference());
    setTimeout(() => {
      document.querySelector('body').classList.remove('no-overflow');
      document.querySelector('#responsive-design-loader').style.display="none";
    }, 1000);
  }, [])
  

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
