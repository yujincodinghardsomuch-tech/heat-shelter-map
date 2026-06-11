"use client";

import { useEffect } from "react";

import { useMap } from "react-leaflet";

import * as turf from "@turf/turf";

interface Props {
  geoJson: any;

  setCurrentGu: (
    gu: string
  ) => void;
}

export default function MapWatcher({
  geoJson,
  setCurrentGu,
}: Props) {
  const map = useMap();

  useEffect(() => {
    const updateCurrentGu = () => {
      const center =
        map.getCenter();

      const point =
        turf.point([
          center.lng,
          center.lat,
        ]);

      for (const feature of geoJson.features) {
        if (
          turf.booleanPointInPolygon(
            point,
            feature
          )
        ) {
          setCurrentGu(
            feature.properties?.name || ""
          );

          return;
        }
      }
    };

    map.on(
      "moveend",
      updateCurrentGu
    );

    updateCurrentGu();

    return () => {
      map.off(
        "moveend",
        updateCurrentGu
      );
    };
  }, [
    geoJson,
    map,
    setCurrentGu,
  ]);

  return null;
}