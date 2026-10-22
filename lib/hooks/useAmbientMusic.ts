"use client";

import { createContext, useContext } from "react";

export const AmbientMusicContext = createContext<{
  playing: boolean;
  toggle: () => void;
  setHeroControls: (element: HTMLDivElement | null) => void;
}>({ playing: false, toggle: () => {}, setHeroControls: () => {} });

export const useAmbientMusic = () => useContext(AmbientMusicContext);
