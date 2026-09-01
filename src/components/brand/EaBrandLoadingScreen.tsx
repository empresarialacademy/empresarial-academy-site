"use client";

import { EaLogoSpinner } from "./EaLogoSpinner";

export function EaBrandLoadingScreen({
  fullScreen = true,
}: {
  progress?: number;
  fullScreen?: boolean;
  theme?: string;
  systemName?: string;
  statusText?: string;
}) {
  return (
    <div
      style={{
        position: fullScreen ? "fixed" : "relative",
        inset: fullScreen ? 0 : undefined,
        width: "100%",
        height: fullScreen ? "100vh" : "100%",
        minHeight: fullScreen ? undefined : 420,
        zIndex: fullScreen ? 99999 : 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#FFFFFF",
      }}
    >
      <style>{`
        body { background: #FFFFFF !important; }
      `}</style>

      {/* LOGO CIRCULAR OFICIAL EA COM CÍRCULO DOURADO GIRANDO */}
      <EaLogoSpinner size={145} glow={true} shimmer={true} />
    </div>
  );
}
