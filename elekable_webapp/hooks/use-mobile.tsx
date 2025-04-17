"use client"

import { useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Vérifier au chargement initial
    checkIsMobile()

    // Ajouter un écouteur d'événement pour les changements de taille
    window.addEventListener("resize", checkIsMobile)

    // Nettoyer l'écouteur d'événement
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return isMobile
}
