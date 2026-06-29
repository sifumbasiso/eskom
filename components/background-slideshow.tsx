"use client"

import { useEffect, useState } from "react"

const SLIDES = [
  {
    src: "/images/bg-wind-hills.png",
    alt: "Wind turbines across rolling green hills",
  },
  {
    src: "/images/bg-solar.jpg",
    alt: "Rows of solar panels on a hillside under a blue sky",
  },
  {
    src: "/images/bg-windfarm.jpg",
    alt: "Wind farm at sunset with mountains in the distance",
  },
  {
    src: "/images/bg-power-stations.jpg",
    alt: "Eskom power stations along the Cape Town coastline",
  },
  {
    src: "/images/bg-land-leasing.jpg",
    alt: "Renewable energy landscape with wind turbines, cooling towers and solar panels",
  },
]

export function BackgroundSlideshow() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {SLIDES.map((slide, i) => (
        <img
          key={slide.src}
          src={slide.src || "/placeholder.svg"}
          alt={slide.alt}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-[#00A651]/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <span
            key={slide.src}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-6 bg-card" : "w-1.5 bg-card/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
