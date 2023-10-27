'use client'

import { useEffect, useState } from "react";

export function useThemeSwitch(){
  const preferedThemeQuery = "(prefers-color-schema:light)";
  const storageKey = "theme";

  const toggleTheme = (theme) => {
    if(theme === "light"){
      document.documentElement.id="dark";
    } else {
      document.documentElement.id="light";
    }

    window.localStorage.setItem(storageKey, theme)
  }

  const getUserPreference = () => {
    const userPref = window.localStorage.getItem(storageKey);
    if(userPref){
      return userPref;
    } else {
      return window.matchMedia(preferedThemeQuery).matches ? 'light' : 'dark';
    }
  }

  const [mode, setMode] = useState("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia(preferedThemeQuery);

    const handleChange = () => {
      const newMode = getUserPreference();
      setMode(newMode);
      toggleTheme(newMode);
    }

    handleChange();

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener(handleChange)
    }
  }, [])
  
  return [mode, setMode];
}
