"use client";

import dynamic from "next/dynamic";

const Map = dynamic(
  () => import("./Map"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <img
        src="/logo.png"
        alt="서울시 무더위쉼터 찾기"
        style={{
          width: "300px",
          marginBottom: "20px",
        }}
      />

      <Map />
    </div>
  );
}