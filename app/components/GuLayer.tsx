"use client";

import { GeoJSON, useMap } from "react-leaflet";

interface Props {
  data: any;
  selectedGu: string;
  setSelectedGu: (gu: string) => void;
}

export default function GuLayer({
  data,
  selectedGu,
  setSelectedGu,
}: Props) {
  const map = useMap();

  return (
    <GeoJSON
      data={data}
      style={(feature: any) => ({
        color: "#333",
        weight: 2,
        fillColor:
          feature.properties?.name === selectedGu
            ? "#ff9800"
            : "#4caf50",
        fillOpacity:
          feature.properties?.name === selectedGu
            ? 0.6
            : 0.2,
      })}
      onEachFeature={(
        feature: any,
        layer: any
      ) => {
        const guName =
          feature.properties?.name;

      if (guName) {
        layer.bindTooltip(
          guName,
          {
            permanent: true,
            direction: "center",
            className: "gu-label",
          }
        );
      }

        layer.on({
          mouseover: () => {
            layer.setStyle({
              weight: 4,
              fillOpacity: 0.5,
            });
          },

          mouseout: () => {
            layer.setStyle({
              weight: 2,
              fillOpacity: 0.2,
            });
          },

          click: () => {
            if (!guName) return;

          

            console.log(
              layer.getBounds()
            );

            setSelectedGu(guName);

            map.fitBounds(
              layer.getBounds(),
              {
                padding: [30, 30],
                maxZoom: 15,
              }
            );
          },
        });
      }}
    />
  );
}