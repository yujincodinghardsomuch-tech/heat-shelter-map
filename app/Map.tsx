"use client";

import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";

import { useState, useEffect } from "react";

import shelters from "../data/shelters.json";

import GuLayer from "./components/GuLayer";
import MapWatcher from "./components/MapWatcher";

function MoveMap({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}


export default function Map() {



  const [selectedGu, setSelectedGu] =
    useState("전체");

  const [facilityType, setFacilityType] =
    useState("전체");

  const [currentGu, setCurrentGu] =
    useState("");

  const [guGeoJson, setGuGeoJson] =
    useState<any>(null);

  const [myLocation, setMyLocation] =
    useState<[number, number] | null>(null);

  const [searchLocation, setSearchLocation] =
    useState<[number, number] | null>(null);

  const [searchText, setSearchText] =
    useState("");

  const [nearestShelter, setNearestShelter] =
    useState<any>(null);

  useEffect(() => {
    fetch("/seoul-gu.geojson")
      .then((res) => res.json())
      .then((data) => {
        setGuGeoJson(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  const findNearestShelter = (
    lat: number,
    lng: number,
    type = facilityType
  ) => {
    let nearest: any = null;

    let minDistance = Infinity;

    const targetShelters =
      type === "전체"
        ? shelters
        : shelters.filter(
            (s: any) =>
              s["시설구분1"] === type
          );

    targetShelters.forEach((shelter: any) => {
      const sLat = Number(
        shelter["위도"]
      );

      const sLng = Number(
        shelter["경도"]
      );

      if (!sLat || !sLng) return;

      const distance =
        Math.sqrt(
          (lat - sLat) ** 2 +
          (lng - sLng) ** 2
        );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = shelter;
      }
    });

    setNearestShelter(nearest);

    if (nearest) {
      const address =
        nearest["도로명주소"] || "";

      const match =
        address.match(
          /서울특별시\s+(\S+구)/
        );

      if (match) {
        setSelectedGu(match[1]);
      }
    }
  };

  const findMyLocation = () => {
    if (!navigator.geolocation) {
      alert(
        "위치 서비스를 지원하지 않습니다."
      );
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat =
          position.coords.latitude;

        const lng =
          position.coords.longitude;

        setMyLocation([lat, lng]);

        setSearchLocation(null);

        findNearestShelter(lat, lng);
      },
      () => {
        alert(
          "위치 정보를 가져올 수 없습니다."
        );
      }
    );
  };

  const searchAddress = async () => {
    if (!searchText.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchText
        )}`
      );

      const data =
        await response.json();

      if (!data.length) {
        alert(
          "검색 결과가 없습니다."
        );
        return;
      }

      const lat = Number(
        data[0].lat
      );

      const lng = Number(
        data[0].lon
      );

      setSearchLocation([lat, lng]);

      setMyLocation(null);

      findNearestShelter(lat, lng);
    } catch {
      alert("검색 실패");
    }
  };

  const guList = [
    "전체",
    ...new Set(
      shelters
        .map((s: any) => {
          const address =
            s["도로명주소"] || "";

          const match =
            address.match(
              /서울특별시\s+(\S+구)/
            );

          return match
            ? match[1]
            : null;
        })
        .filter(Boolean)
    ),
  ];
  const facilityTypes = [
    "전체",
    ...new Set(
      shelters
        .map(
          (s: any) =>
            s["시설구분1"]
        )
        .filter(Boolean)
    ),
  ];

  const activeGu = selectedGu;

  const filteredShelters =
    activeGu === "전체"
      ? []
      : shelters.filter((s: any) => {
          const matchGu =
            (
              s["도로명주소"] || ""
            ).includes(activeGu);

          const matchFacility =
            facilityType === "전체" ||
            s["시설구분1"] ===
              facilityType;

          return (
            matchGu &&
            matchFacility
          );
        });

  const currentCenter =
    searchLocation ||
    myLocation ||
    [37.5665, 126.978];

  const startLocation =
    myLocation || searchLocation;

  return (
    <>
      <div
        style={{
          marginBottom: "10px",
          fontWeight: "bold",
          fontSize: "18px",
        }}
      >
        현재 보고 있는 지역 :
        {currentGu ||
          selectedGu ||
          "서울 전체"}
      </div>

      <div
        style={{
          marginBottom: "15px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={findMyLocation}
          style={{
            backgroundColor: "#0077cc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 16px",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          }}
        >
          📍 내 위치 찾기
        </button>

        <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: "6px",
  }}
>
  <span
    style={{
      fontWeight: "bold",
    }}
  >
    주소 검색:
  </span>

  <input
    value={searchText}
    onChange={(e) =>
      setSearchText(e.target.value)
    }
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        searchAddress();
      }
    }}
    placeholder="서울역, 강남역, 서울여대"
    style={{
      padding: "9px 12px",
      borderRadius: "8px",
      border: "1px solid #ccc",
      width: "220px",
    }}
  />

  <button
    onClick={searchAddress}
    style={{
      backgroundColor: "#00a884",
      color: "white",
      border: "none",
      borderRadius: "8px",
      padding: "10px 14px",
      fontWeight: "bold",
      cursor: "pointer",
    }}
  >
    검색
  </button>
</div>

        <select
          value={facilityType}
          onChange={(e) => {
            const type =
              e.target.value;

            setFacilityType(type);

            const location =
              myLocation || searchLocation;

            if (location) {
              findNearestShelter(
                location[0],
                location[1],
                type
              );
            }
          }}
        >
          {facilityTypes.map(
            (type) => (
              <option
                key={type}
                value={type}
              >
                {type}
              </option>
            )
          )}
        </select>



      </div>

      <div
  style={{
    position: "relative",
  }}
>
 


  <MapContainer
  center={[37.5665, 126.978]}
  zoom={11}
  style={{
    height: "650px",
    width: "100%",
  }}
>      

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {guGeoJson && (
          <>
            <GuLayer
              data={guGeoJson}
              selectedGu={selectedGu}
              setSelectedGu={setSelectedGu}
            />
            {/*<MapWatcher
              geoJson={guGeoJson}
              setCurrentGu={
                setCurrentGu
              }
            />*/}
          </>
        )}

        {(searchLocation || myLocation) && (
          <MoveMap
            center={
              currentCenter as [
                number,
                number
              ]
            }
            zoom={15}
          />
        )}

        {(myLocation ||
          searchLocation) && (
          <CircleMarker
            center={
              (
                myLocation ||
                searchLocation
              ) as [
                number,
                number
              ]
            }
            radius={10}
            pathOptions={{
              color: "red",
              fillColor: "red",
              fillOpacity: 1,
            }}
          >
            <Popup>
              현재/검색 위치
            </Popup>
          </CircleMarker>
        )}

        {nearestShelter && (
          <CircleMarker
            center={[
              Number(nearestShelter["위도"]),
              Number(nearestShelter["경도"]),
            ]}
            radius={10}
            pathOptions={{
              color: "#0066ff",
              fillColor: "#0066ff",
              fillOpacity: 1,
              weight: 0,
            }}
          >
            <Popup>
              <strong>
                가장 가까운 쉼터
              </strong>

              <br />

              <strong>
                {nearestShelter["쉼터명칭"]}
              </strong>

              <br />

              시설종류:{" "}
              {nearestShelter["시설구분1"]}

              <br />

              {nearestShelter["도로명주소"]}

              <br />

              <a
                href={
                  startLocation
                    ? `https://map.kakao.com/link/from/현재위치,${startLocation[0]},${startLocation[1]}/to/${encodeURIComponent(
                        nearestShelter["쉼터명칭"]
                      )},${Number(
                        nearestShelter["위도"]
                      )},${Number(
                        nearestShelter["경도"]
                      )}`
                    : `https://map.kakao.com/link/to/${encodeURIComponent(
                        nearestShelter["쉼터명칭"]
                      )},${Number(
                        nearestShelter["위도"]
                      )},${Number(
                        nearestShelter["경도"]
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
              >
                길찾기
              </a>
            </Popup>
          </CircleMarker>
        )}

        {filteredShelters.map(
          (
            shelter: any,
            index: number
          ) => {
            const lat = Number(
              shelter["위도"]
            );

            const lng = Number(
              shelter["경도"]
            );

            if (!lat || !lng)
              return null;

            if (
              nearestShelter &&
              shelter["쉼터명칭"] ===
                nearestShelter[
                  "쉼터명칭"
                ]
            ) {
              return null;
            }

            return (
              <CircleMarker
                key={index}
                center={[
                  lat,
                  lng,
                ]}
                radius={6}
                pathOptions={{
                  color: "#00aa00",
                  fillColor:
                    "#00aa00",
                  fillOpacity: 1,
                  weight: 0,
                }}
              >
                <Popup>
                  <strong>
                    {
                      shelter[
                        "쉼터명칭"
                      ]
                    }
                  </strong>

                  <br />

                  시설종류 :
                  {" "}
                  {
                    shelter[
                      "시설구분1"
                    ]
                  }

                  <br />

                  {
                    shelter[
                      "도로명주소"
                    ]
                  }

                  <br />

                  <a
                    href={`https://map.kakao.com/link/to/${encodeURIComponent(
                      shelter[
                        "쉼터명칭"
                      ]
                    )},${lat},${lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    길찾기
                  </a>
                </Popup>
              </CircleMarker>
            );
          }
                )}
      </MapContainer>
    </div>
  </>
  );
}